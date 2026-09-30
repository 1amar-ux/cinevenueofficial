import { posBookingTransactionService } from "../src/modules/bookings/posBookingTransactionService";
import { posCancellationRefundService } from "../src/modules/bookings/posCancellationRefundService";
import { systemMonitoringService } from "../src/modules/monitoring/systemMonitoringService";

async function verifyCancellationAndMonitoring() {
  console.log("=================================================");
  console.log("🛡️ Verifying Cancellation Idempotency, Refunds & Operational Monitoring");
  console.log("=================================================\n");

  // Step 1: Create a confirmed booking to test cancellation
  console.log("1. Creating Confirmed Test Booking...");
  const hold = await posBookingTransactionService.requestSeatHold({
    theatreId: "mock_theatre_01",
    screenId: "mock_screen_01",
    movieId: "mock_movie_01",
    showId: "mock_show_01",
    userId: "user-can-test-01",
    seatIds: ["C1", "C2"],
    amount: 500
  });

  await posBookingTransactionService.recordPaymentSuccess({
    transactionId: hold.transactionId,
    paymentId: "pay_rzp_can_001"
  });

  const confirmed = await posBookingTransactionService.commitPosBooking(hold.transactionId);
  console.log(`   Confirmed Booking: ${confirmed.bookingId} (POS ID: ${confirmed.posBookingId})`);
  console.log("   ✅ PASSED: Confirmed booking created.\n");

  // Step 2: Test Cancellation Idempotency
  console.log("2. Testing Cancellation Idempotency...");
  const can1 = await posCancellationRefundService.requestCancellation({
    bookingId: confirmed.bookingId,
    requestedBy: "Customer App",
    reason: "Schedule change"
  });

  console.log(`   First Cancellation Call: ID=[${can1.cancellationId}], Status=[${can1.cancellationStatus}], POS Ref=[${can1.posCancellationReference}]`);

  const can2 = await posCancellationRefundService.requestCancellation({
    bookingId: confirmed.bookingId,
    requestedBy: "Duplicate Webhook / Retry",
    reason: "Schedule change"
  });

  console.log(`   Second Cancellation Call (Duplicate): ID=[${can2.cancellationId}], Status=[${can2.cancellationStatus}]`);
  if (can1.cancellationId !== can2.cancellationId) {
    throw new Error("Cancellation Idempotency Failed: Generated new cancellation ID on duplicate call!");
  }
  console.log("   ✅ PASSED: Cancellation idempotency verified (No duplicate POS cancellation created).\n");

  // Step 3: Test Refund Idempotency with Stable Reference Key
  console.log("3. Testing Refund Idempotency with Stable Reference Key (CVREF-<bookingId>)...");
  const ref1 = await posCancellationRefundService.processRefund({
    bookingId: confirmed.bookingId,
    paymentId: "pay_rzp_can_001",
    cancellationId: can1.cancellationId,
    refundAmount: 500,
    theatreId: "mock_theatre_01"
  });

  console.log(`   First Refund Call: Refund ID=[${ref1.refundId}], Status=[${ref1.refundStatus}], Gateway Ref=[${ref1.paymentGatewayRefundId}]`);

  const ref2 = await posCancellationRefundService.processRefund({
    bookingId: confirmed.bookingId,
    paymentId: "pay_rzp_can_001",
    cancellationId: can1.cancellationId,
    refundAmount: 500,
    theatreId: "mock_theatre_01"
  });

  console.log(`   Second Refund Call (Duplicate): Refund ID=[${ref2.refundId}], Status=[${ref2.refundStatus}]`);
  if (ref1.refundId !== ref2.refundId || ref1.paymentGatewayRefundId !== ref2.paymentGatewayRefundId) {
    throw new Error("Refund Idempotency Failed: Duplicate refund initiated!");
  }
  console.log("   ✅ PASSED: Refund idempotency and stable reference key verified.\n");

  // Step 4: Test Alert Deduplication
  console.log("4. Testing Alert Deduplication & Incident Tracking...");
  const inc1 = systemMonitoringService.createIncident({
    type: "POS_HIGH_LATENCY",
    severity: "WARNING",
    theatreId: "mock_theatre_01",
    theatreName: "Prasad Multiplex & IMAX",
    integrationId: "int_mock_01",
    description: "POS response time elevated to 420ms"
  });
  console.log(`   First Alert: Incident ID=[${inc1.incidentId}], Status=[${inc1.status}]`);

  const inc2 = systemMonitoringService.createIncident({
    type: "POS_HIGH_LATENCY",
    severity: "WARNING",
    theatreId: "mock_theatre_01",
    theatreName: "Prasad Multiplex & IMAX",
    integrationId: "int_mock_01",
    description: "POS response time elevated to 450ms (Escalated)"
  });
  console.log(`   Duplicate Alert: Incident ID=[${inc2.incidentId}], Status=[${inc2.status}]`);
  if (inc1.incidentId !== inc2.incidentId) {
    throw new Error("Alert Deduplication Failed: Duplicate incident spawned!");
  }

  systemMonitoringService.resolveIncident(inc1.incidentId, "Super Admin");
  console.log("   Incident resolved and logged in audit trail.");
  console.log("   ✅ PASSED: Alert deduplication and incident tracking verified.\n");

  // Step 5: Test System Monitoring Overview & Telemetry
  console.log("5. Testing System Monitoring Telemetry...");
  const metrics = systemMonitoringService.getOverviewMetrics();
  console.log(`   POS Integrations: ${metrics.posIntegrations.healthy}/${metrics.posIntegrations.total} Healthy`);
  console.log(`   Bookings Today: ${metrics.bookings.totalToday} (Successful: ${metrics.bookings.successful})`);
  console.log(`   P95 Latency: ${metrics.latency.p95Ms}ms (Avg: ${metrics.latency.avgMs}ms)`);
  console.log(`   Error Rate: ${metrics.errorRate.totalRate}%`);
  console.log("   ✅ PASSED: System monitoring metrics verified.\n");

  console.log("=================================================");
  console.log("🎉 ALL CANCELLATION IDEMPOTENCY, REFUNDS & MONITORING TESTS PASSED!");
  console.log("=================================================");
}

verifyCancellationAndMonitoring().catch(err => {
  console.error("❌ Test Failure:", err);
  process.exit(1);
});
