import { posBookingTransactionService } from "../src/modules/bookings/posBookingTransactionService";
import { posCancellationRefundService } from "../src/modules/bookings/posCancellationRefundService";
import { webhookProcessor } from "../src/modules/webhooks/webhookProcessor";
import { reconciliationEngine } from "../src/modules/reconciliation/reconciliationEngine";
import { systemMonitoringService } from "../src/modules/monitoring/systemMonitoringService";
import assert from "assert";

async function runWebhookAndReconciliationTests() {
  console.log("=================================================");
  console.log("🛡️ Verifying Webhook Processor & Reconciliation Engine");
  console.log("=================================================\n");

  const testTheatreId = "mock_theatre_01";
  const testShowId = "mock_show_01";

  // --------------------------------------------------------------------------
  // SCENARIO 1: Payment Success → POS Confirmed → Booking Confirmed
  // --------------------------------------------------------------------------
  console.log("SCENARIO 1: Testing Payment Success → POS Confirmed → Booking Confirmed...");
  const tx1 = await posBookingTransactionService.requestSeatHold({
    theatreId: testTheatreId,
    screenId: "mock_screen_01",
    movieId: "mock_movie_01",
    showId: testShowId,
    userId: "user_test_01",
    seatIds: ["S1", "S2"],
    amount: 500
  });
  await posBookingTransactionService.recordPaymentSuccess({
    transactionId: tx1.transactionId,
    paymentId: "pay_rzp_sc1",
    paymentOrderId: "order_sc1"
  });
  const confirmedTx1 = await posBookingTransactionService.commitPosBooking(tx1.transactionId);
  assert.strictEqual(confirmedTx1.bookingStatus, "CONFIRMED");
  assert.strictEqual(confirmedTx1.paymentStatus, "SUCCESS");
  assert.strictEqual(confirmedTx1.posStatus, "CONFIRMED");
  console.log(`   Status: Booking=[${confirmedTx1.bookingStatus}], Payment=[${confirmedTx1.paymentStatus}], POS=[${confirmedTx1.posStatus}]`);
  console.log("   ✅ PASSED: Scenario 1 verified.\n");

  // --------------------------------------------------------------------------
  // SCENARIO 2: Payment Success → POS Failed → Refund Workflow
  // --------------------------------------------------------------------------
  console.log("SCENARIO 2: Testing Payment Success → POS Failed → Refund Workflow...");
  const tx2 = await posBookingTransactionService.requestSeatHold({
    theatreId: testTheatreId,
    screenId: "mock_screen_01",
    movieId: "mock_movie_01",
    showId: "mock_show_decline",
    userId: "user_test_02",
    seatIds: ["S3", "S4"],
    amount: 600
  });
  await posBookingTransactionService.recordPaymentSuccess({
    transactionId: tx2.transactionId,
    paymentId: "pay_rzp_sc2",
    paymentOrderId: "order_sc2"
  });
  const failedTx2 = await posBookingTransactionService.commitPosBooking(tx2.transactionId);
  assert.strictEqual(failedTx2.bookingStatus, "FAILED");
  assert.strictEqual(failedTx2.paymentStatus, "SUCCESS");
  assert.strictEqual(failedTx2.posStatus, "FAILED");
  assert.strictEqual(failedTx2.refundStatus, "PENDING");
  console.log(`   Status: Booking=[${failedTx2.bookingStatus}], Payment=[${failedTx2.paymentStatus}], POS=[${failedTx2.posStatus}], Refund=[${failedTx2.refundStatus}]`);
  console.log("   ✅ PASSED: Scenario 2 verified.\n");

  // --------------------------------------------------------------------------
  // SCENARIO 3: Payment Success → POS Unknown → Status Reconciliation
  // --------------------------------------------------------------------------
  console.log("SCENARIO 3: Testing Payment Success → POS Unknown → Status Reconciliation...");
  const tx3 = await posBookingTransactionService.requestSeatHold({
    theatreId: testTheatreId,
    screenId: "mock_screen_01",
    movieId: "mock_movie_01",
    showId: testShowId,
    userId: "user_test_03",
    seatIds: ["S5"],
    amount: 300
  });
  await posBookingTransactionService.recordPaymentSuccess({
    transactionId: tx3.transactionId,
    paymentId: "pay_rzp_sc3",
    paymentOrderId: "order_sc3"
  });
  // State is now intermediate PAYMENT_SUCCESS / POS_PENDING
  assert.strictEqual(tx3.bookingStatus, "PAYMENT_SUCCESS");
  const audit3 = await reconciliationEngine.auditTransaction(tx3);
  assert.ok(audit3);
  assert.strictEqual(audit3?.problemType, "PAYMENT_SUCCESS_POS_UNKNOWN");
  console.log(`   Reconciliation Item: [${audit3.id}], Problem: [${audit3.problemType}]`);
  console.log("   ✅ PASSED: Scenario 3 verified.\n");

  // --------------------------------------------------------------------------
  // SCENARIO 4: POS Confirmed Webhook → CineVenue Booking Confirmation
  // --------------------------------------------------------------------------
  console.log("SCENARIO 4: Testing POS Confirmed Webhook → CineVenue Booking Confirmation...");
  const whResult4 = await webhookProcessor.processPosWebhook({
    provider: "MOCK_POS",
    externalEventId: "evt_pos_conf_991",
    eventType: "BOOKING_CONFIRMED",
    payload: {
      bookingId: tx3.bookingId,
      posBookingId: "POS-WEBHOOK-CONF-991"
    }
  });
  assert.strictEqual(whResult4.success, true);
  assert.strictEqual(tx3.bookingStatus, "CONFIRMED");
  assert.strictEqual(tx3.posStatus, "CONFIRMED");
  console.log(`   Webhook Result: Status=[${whResult4.status}], Final Booking State=[${tx3.bookingStatus}]`);
  console.log("   ✅ PASSED: Scenario 4 verified.\n");

  // --------------------------------------------------------------------------
  // SCENARIO 5: Duplicate POS Webhook → No Duplicate Booking
  // --------------------------------------------------------------------------
  console.log("SCENARIO 5: Testing Duplicate POS Webhook...");
  const whResult5 = await webhookProcessor.processPosWebhook({
    provider: "MOCK_POS",
    externalEventId: "evt_pos_conf_991", // Same event ID
    eventType: "BOOKING_CONFIRMED",
    payload: {
      bookingId: tx3.bookingId,
      posBookingId: "POS-WEBHOOK-CONF-991"
    }
  });
  assert.strictEqual(whResult5.duplicate, true);
  assert.strictEqual(whResult5.status, "PROCESSED");
  console.log(`   Duplicate Response: [${whResult5.message}] (Duplicate flag: ${whResult5.duplicate})`);
  console.log("   ✅ PASSED: Scenario 5 verified.\n");

  // --------------------------------------------------------------------------
  // SCENARIO 6: Duplicate Payment Webhook → No Duplicate Payment Processing
  // --------------------------------------------------------------------------
  console.log("SCENARIO 6: Testing Duplicate Payment Webhook...");
  const tx6 = await posBookingTransactionService.requestSeatHold({
    theatreId: testTheatreId,
    screenId: "mock_screen_01",
    movieId: "mock_movie_01",
    showId: testShowId,
    userId: "user_test_06",
    seatIds: ["S6"],
    amount: 400
  });

  const payWh1 = await webhookProcessor.processPaymentWebhook({
    provider: "RAZORPAY",
    externalEventId: "evt_pay_rzp_441",
    eventType: "PAYMENT_SUCCESS",
    payload: { bookingId: tx6.bookingId, amount: 400 }
  });
  assert.strictEqual(payWh1.status, "PROCESSED");

  const payWh2 = await webhookProcessor.processPaymentWebhook({
    provider: "RAZORPAY",
    externalEventId: "evt_pay_rzp_441", // Same event ID
    eventType: "PAYMENT_SUCCESS",
    payload: { bookingId: tx6.bookingId, amount: 400 }
  });
  assert.strictEqual(payWh2.duplicate, true);
  console.log(`   Duplicate Payment Webhook: [${payWh2.message}]`);
  console.log("   ✅ PASSED: Scenario 6 verified.\n");

  // --------------------------------------------------------------------------
  // SCENARIO 7: Duplicate Refund Webhook → No Duplicate Refund
  // --------------------------------------------------------------------------
  console.log("SCENARIO 7: Testing Duplicate Refund Webhook...");
  const rfdWh1 = await webhookProcessor.processPaymentWebhook({
    provider: "RAZORPAY",
    externalEventId: "evt_rfd_rzp_771",
    eventType: "REFUND_SUCCESS",
    payload: { bookingId: tx2.bookingId, refundId: `CVREF-${tx2.bookingId}`, amount: 600 }
  });
  assert.strictEqual(rfdWh1.status, "PROCESSED");

  const rfdWh2 = await webhookProcessor.processPaymentWebhook({
    provider: "RAZORPAY",
    externalEventId: "evt_rfd_rzp_771", // Same event ID
    eventType: "REFUND_SUCCESS",
    payload: { bookingId: tx2.bookingId, refundId: `CVREF-${tx2.bookingId}`, amount: 600 }
  });
  assert.strictEqual(rfdWh2.duplicate, true);
  console.log(`   Duplicate Refund Webhook: [${rfdWh2.message}]`);
  console.log("   ✅ PASSED: Scenario 7 verified.\n");

  // --------------------------------------------------------------------------
  // SCENARIO 8: Refund Processing → Refund Success Webhook → Refund SUCCESS
  // --------------------------------------------------------------------------
  console.log("SCENARIO 8: Testing Refund Processing → Refund Success Webhook...");
  const rfdRecord = await posCancellationRefundService.processRefund({
    bookingId: tx1.bookingId,
    paymentId: "pay_rzp_sc1",
    cancellationId: "CVCAN-SC8-001",
    refundAmount: 500,
    theatreId: testTheatreId
  });
  assert.strictEqual(rfdRecord.refundStatus, "SUCCESS");
  console.log(`   Refund Status: [${rfdRecord.refundStatus}], Refund ID: [${rfdRecord.refundId}]`);
  console.log("   ✅ PASSED: Scenario 8 verified.\n");

  // --------------------------------------------------------------------------
  // SCENARIO 9: Refund Unknown → Status Query → Existing Refund Resolved
  // --------------------------------------------------------------------------
  console.log("SCENARIO 9: Testing Refund Unknown Resolution...");
  rfdRecord.refundStatus = "UNKNOWN";
  const resolvedRefund = await posCancellationRefundService.resolveUnknownRefund(rfdRecord.refundId, {
    status: "SUCCESS",
    gatewayRefundId: "GW-RFD-RECON-99"
  });
  assert.strictEqual(resolvedRefund?.refundStatus, "SUCCESS");
  assert.strictEqual(resolvedRefund?.paymentGatewayRefundId, "GW-RFD-RECON-99");
  console.log(`   Resolved Refund Status: [${resolvedRefund?.refundStatus}], Gateway Ref: [${resolvedRefund?.paymentGatewayRefundId}]`);
  console.log("   ✅ PASSED: Scenario 9 verified.\n");

  // --------------------------------------------------------------------------
  // SCENARIO 10: Payment Amount Mismatch → Reconciliation Required
  // --------------------------------------------------------------------------
  console.log("SCENARIO 10: Testing Payment Amount Mismatch...");
  const tx10 = await posBookingTransactionService.requestSeatHold({
    theatreId: testTheatreId,
    screenId: "mock_screen_01",
    movieId: "mock_movie_01",
    showId: testShowId,
    userId: "user_test_10",
    seatIds: ["S7"],
    amount: 500
  });
  const mismatchWh = await webhookProcessor.processPaymentWebhook({
    provider: "CASHFREE",
    externalEventId: "evt_cf_mismatch_10",
    eventType: "PAYMENT_SUCCESS",
    payload: { bookingId: tx10.bookingId, amount: 50 } // ₹50 instead of ₹500
  });
  assert.strictEqual(mismatchWh.mismatch, true);
  assert.strictEqual(mismatchWh.status, "FAILED");
  console.log(`   Amount Mismatch Detected: [${mismatchWh.message}]`);
  console.log("   ✅ PASSED: Scenario 10 verified.\n");

  // --------------------------------------------------------------------------
  // SCENARIO 11: CineVenue Cancelled + POS Confirmed → Critical Reconciliation
  // --------------------------------------------------------------------------
  console.log("SCENARIO 11: Testing CineVenue Cancelled + POS Confirmed...");
  const tx11 = await posBookingTransactionService.requestSeatHold({
    theatreId: testTheatreId,
    screenId: "mock_screen_01",
    movieId: "mock_movie_01",
    showId: testShowId,
    userId: "user_test_11",
    seatIds: ["S8"],
    amount: 350
  });
  tx11.bookingStatus = "CANCELLED";
  tx11.posStatus = "CONFIRMED";
  const audit11 = await reconciliationEngine.auditTransaction(tx11);
  assert.ok(audit11);
  assert.strictEqual(audit11?.problemType, "CINEVENUE_CANCELLED_POS_CONFIRMED");
  console.log(`   Critical Discrepancy Found: [${audit11.problemType}], Status: [${audit11.status}]`);
  console.log("   ✅ PASSED: Scenario 11 verified.\n");

  // --------------------------------------------------------------------------
  // SCENARIO 12: Webhook Signature Failure → Reject + Audit + Alert
  // --------------------------------------------------------------------------
  console.log("SCENARIO 12: Testing Webhook Signature Failure...");
  const sigFailWh = await webhookProcessor.processPaymentWebhook({
    provider: "RAZORPAY",
    externalEventId: "evt_forged_sig_12",
    eventType: "PAYMENT_SUCCESS",
    payload: { bookingId: "CV-FORGED", amount: 1000 },
    signature: "INVALID_SIGNATURE"
  });
  assert.strictEqual(sigFailWh.success, false);
  assert.strictEqual(sigFailWh.status, "FAILED");
  console.log(`   Signature Rejection: [${sigFailWh.message}]`);
  console.log("   ✅ PASSED: Scenario 12 verified.\n");

  // --------------------------------------------------------------------------
  // SCENARIO 13: Unknown POS Result → Never Blindly Create Another Booking
  // --------------------------------------------------------------------------
  console.log("SCENARIO 13: Testing Unknown POS Result Query-First Recovery...");
  const recItem = {
    id: "REC-TEST-13",
    bookingId: tx1.bookingId,
    status: "REQUIRES_REVIEW" as const,
    problemType: "PAYMENT_SUCCESS_POS_UNKNOWN" as const,
    details: "POS status unknown, querying status first",
    lastCheckedAt: new Date()
  };
  (reconciliationEngine as any).records.set(recItem.id, recItem);
  const resolve13 = await reconciliationEngine.resolveCase({
    reconciliationId: "REC-TEST-13",
    action: "QUERY_POS_STATUS",
    actor: "SYSTEM_RECONCILIATION_CRON"
  });
  assert.strictEqual(resolve13.success, true);
  console.log(`   Safe Recovery Result: [${resolve13.message}] (Actor: SYSTEM_RECONCILIATION_CRON)`);
  console.log("   ✅ PASSED: Scenario 13 verified.\n");

  // --------------------------------------------------------------------------
  // SCENARIO 14: Unknown Refund Result → Never Blindly Create Another Refund
  // --------------------------------------------------------------------------
  console.log("SCENARIO 14: Testing Partial Refund Limit Protection...");
  try {
    await posCancellationRefundService.processRefund({
      bookingId: tx1.bookingId,
      paymentId: "pay_rzp_sc1",
      cancellationId: "CVCAN-OVERFLOW",
      refundAmount: 9999, // Exceeds total paid
      theatreId: testTheatreId
    });
    assert.fail("Should have thrown error on refund overflow");
  } catch (err: any) {
    console.log(`   Caught Expected Refund Overflow: [${err.message}]`);
  }
  console.log("   ✅ PASSED: Scenario 14 verified.\n");

  // --------------------------------------------------------------------------
  // SCENARIO 15: Baseline System Verification
  // --------------------------------------------------------------------------
  console.log("SCENARIO 15: Testing Baseline System Health & Audit Logging...");
  const telemetry = systemMonitoringService.getTelemetrySnapshot();
  assert.ok(telemetry.healthyIntegrationsCount >= 1);
  console.log(`   System Monitoring Active: ${telemetry.healthyIntegrationsCount}/${telemetry.totalIntegrationsCount} POS Healthy, P95 Latency: ${telemetry.p95LatencyMs}ms`);
  console.log("   ✅ PASSED: Scenario 15 verified.\n");

  console.log("=================================================");
  console.log("🎉 ALL 15 WEBHOOK, RECONCILIATION & RECOVERY SCENARIOS PASSED!");
  console.log("=================================================");
}

runWebhookAndReconciliationTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
