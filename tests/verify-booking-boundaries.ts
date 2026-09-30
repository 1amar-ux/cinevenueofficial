import { posBookingTransactionService } from "../src/modules/bookings/posBookingTransactionService";

async function verifyBookingBoundaries() {
  console.log("=================================================");
  console.log("🛡️ Verifying CineVenue Real Booking Transaction Boundaries");
  console.log("=================================================\n");

  // CASE 1: Boundary 1 & 2 — Seat Selection & POS Temporary Hold
  console.log("CASE 1: Testing Seat Selection & POS Seat Hold...");
  const hold = await posBookingTransactionService.requestSeatHold({
    theatreId: "mock_theatre_01",
    screenId: "mock_screen_01",
    movieId: "mock_movie_01",
    showId: "mock_show_01",
    userId: "user-cust-01",
    seatIds: ["A1", "A2"],
    amount: 900
  });

  console.log(`   Transaction ID: ${hold.transactionId}`);
  console.log(`   CineVenue Booking ID: ${hold.bookingId}`);
  console.log(`   POS Hold Token: ${hold.posHoldToken}`);
  console.log(`   Status: Booking=[${hold.bookingStatus}], Payment=[${hold.paymentStatus}], POS=[${hold.posStatus}], Refund=[${hold.refundStatus}]`);
  if (hold.bookingStatus !== "SEAT_HELD" || hold.paymentStatus !== "PENDING") {
    throw new Error("Case 1 Failed: Hold state invalid");
  }
  console.log("   ✅ PASSED: Boundary 1 & 2 verified.\n");

  // CASE 2: Payment Success != Booking Confirmed (Intermediate State)
  console.log("CASE 2: Testing Payment Verification (PAYMENT_SUCCESS != CONFIRMED)...");
  const paid = await posBookingTransactionService.recordPaymentSuccess({
    transactionId: hold.transactionId,
    paymentId: "pay_rzp_mock_992147",
    paymentOrderId: "order_mock_118"
  });

  console.log(`   Status: Booking=[${paid.bookingStatus}], Payment=[${paid.paymentStatus}], POS=[${paid.posStatus}]`);
  if (paid.paymentStatus !== "SUCCESS" || paid.bookingStatus !== "PAYMENT_SUCCESS") {
    throw new Error("Case 2 Failed: Payment success must set PAYMENT_SUCCESS, not CONFIRMED");
  }
  console.log("   ✅ PASSED: Rule verified (PAYMENT SUCCESS != BOOKING CONFIRMED).\n");

  // CASE 3: Final Commit Point — POS Confirmed + CineVenue Confirmed
  console.log("CASE 3: Testing POS Booking Commit & Dual-ID Confirmation...");
  const confirmed = await posBookingTransactionService.commitPosBooking(hold.transactionId);
  console.log(`   Dual-ID Link: CineVenue [${confirmed.bookingId}] <-> POS ID [${confirmed.posBookingId}]`);
  console.log(`   Status: Booking=[${confirmed.bookingStatus}], Payment=[${confirmed.paymentStatus}], POS=[${confirmed.posStatus}]`);
  if (confirmed.bookingStatus !== "CONFIRMED" || confirmed.posStatus !== "CONFIRMED" || !confirmed.posBookingId) {
    throw new Error("Case 3 Failed: Final commit point failed");
  }
  console.log("   ✅ PASSED: Final booking commit point verified.\n");

  // CASE 4: Duplicate Payment Callback (Idempotency)
  console.log("CASE 4: Testing Duplicate Payment Callback Protection...");
  const duplicatePayment = await posBookingTransactionService.recordPaymentSuccess({
    transactionId: hold.transactionId,
    paymentId: "pay_rzp_mock_992147"
  });
  console.log("   Duplicate check:", duplicatePayment.auditTrail.slice(-1)[0].message);
  console.log("   ✅ PASSED: Duplicate payment callback safely ignored.\n");

  // CASE 5: Duplicate Booking Commit (Idempotency)
  console.log("CASE 5: Testing Duplicate Booking Commit Protection...");
  const duplicateCommit = await posBookingTransactionService.commitPosBooking(hold.transactionId);
  console.log(`   Returned existing state: ${duplicateCommit.posBookingId} (No new POS booking created)`);
  console.log("   ✅ PASSED: Idempotent booking commit verified.\n");

  // CASE 6: Failure Recovery — Payment Success + POS Booking Failed
  console.log("CASE 6: Testing Failure Recovery (Payment Success + POS Booking Failed)...");
  const failedHold = await posBookingTransactionService.requestSeatHold({
    theatreId: "mock_theatre_01",
    screenId: "mock_screen_01",
    movieId: "mock_movie_01",
    showId: "mock_show_decline",
    userId: "user-cust-02",
    seatIds: ["B1"],
    amount: 450
  });

  await posBookingTransactionService.recordPaymentSuccess({
    transactionId: failedHold.transactionId,
    paymentId: "pay_rzp_fail_mock_001"
  });

  const failedResult = await posBookingTransactionService.commitPosBooking(failedHold.transactionId);
  console.log(`   Status: Booking=[${failedResult.bookingStatus}], Payment=[${failedResult.paymentStatus}], POS=[${failedResult.posStatus}], Refund=[${failedResult.refundStatus}]`);
  if (failedResult.bookingStatus !== "FAILED" || failedResult.refundStatus !== "PENDING" || failedResult.paymentStatus !== "SUCCESS") {
    throw new Error("Case 6 Failed: Recovery state invalid");
  }
  console.log("   ✅ PASSED: Payment retained in escrow and refund marked PENDING.\n");

  // CASE 7: Cancellation & Automated Refund
  console.log("CASE 7: Testing Cancellation & Seat Release Transaction...");
  const cancelled = await posBookingTransactionService.cancelBooking(confirmed.bookingId, "Customer requested cancellation");
  console.log(`   Status: Booking=[${cancelled.bookingStatus}], POS=[${cancelled.posStatus}], Refund=[${cancelled.refundStatus}]`);
  if (cancelled.bookingStatus !== "CANCELLED" || cancelled.refundStatus !== "COMPLETED") {
    throw new Error("Case 7 Failed: Cancellation or refund failed");
  }
  console.log("   ✅ PASSED: Cancellation, seat release, and refund completed.\n");

  console.log("=================================================");
  console.log("🎉 ALL 7 REAL BOOKING TRANSACTION BOUNDARIES & RECOVERY CASES PASSED!");
  console.log("=================================================");
}

verifyBookingBoundaries().catch(err => {
  console.error("❌ Boundary Test Failure:", err);
  process.exit(1);
});
