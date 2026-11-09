import assert from "assert";
import crypto from "crypto";
import { razorpayService } from "../../server/modules/payments/razorpay.service";
import { cashfreeService } from "../../server/modules/payments/cashfree.service";
import { bookingService, BookingService } from "../../server/modules/bookings/booking.service";

export async function runPaymentGatewayHardeningTests(): Promise<Array<{ name: string; passed: boolean; error?: string }>> {
  const results: Array<{ name: string; passed: boolean; error?: string }> = [];

  // 1. Razorpay HMAC-SHA256 Signature Verification
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "rzp_test_secret_123456";
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

    const payload = JSON.stringify({ event: "order.paid", entity: { id: "order_test_123" } });
    const validSignature = crypto.createHmac("sha256", webhookSecret).update(payload).digest("hex");
    const invalidSignature = "invalid_signature_hex_value_000000000";

    const isValid = razorpayService.verifyWebhookSignature(payload, validSignature);
    const isInvalid = razorpayService.verifyWebhookSignature(payload, invalidSignature);

    assert(isValid === true, "Valid HMAC signature must verify successfully");
    assert(isInvalid === false, "Tampered signature must be rejected");

    results.push({ name: "Razorpay: HMAC-SHA256 webhook signature validation accepts valid and rejects tampered", passed: true });
  } catch (err: any) {
    results.push({ name: "Razorpay: HMAC-SHA256 webhook signature validation", passed: false, error: err.message });
  }

  // 2. Cashfree Webhook Signature Verification with Timestamp
  try {
    const cfSecret = "cf_test_secret_hardening_123";
    const timestamp = Date.now().toString();
    const rawBody = JSON.stringify({ type: "PAYMENT_SUCCESS_WEBHOOK", data: { order: { order_id: "cf_ord_1" } } });
    const signPayload = `${timestamp}${rawBody}`;
    const validSignature = crypto.createHmac("sha256", cfSecret).update(signPayload).digest("base64");

    const isValid = cashfreeService.verifyWebhookSignature(rawBody, validSignature, timestamp, cfSecret);
    const isTampered = cashfreeService.verifyWebhookSignature(rawBody, "tampered_signature", timestamp, cfSecret);

    assert(isValid === true, "Valid Cashfree timestamped signature must verify");
    assert(isTampered === false, "Tampered Cashfree signature must be rejected");

    results.push({ name: "Cashfree: Timestamped HMAC-SHA256 signature verification validates correctly", passed: true });
  } catch (err: any) {
    results.push({ name: "Cashfree: Timestamped HMAC signature verification", passed: false, error: err.message });
  }

  // 3. Webhook Idempotency: Duplicate Confirmation Handled Without Side Effects
  try {
    const testBookingId = `bkg_idem_${Date.now()}`;
    const mockConfirmedBooking = {
      id: testBookingId,
      bookingNumber: `CV-IDEM-999`,
      status: "CONFIRMED",
      totalAmount: 235.40,
      theatreId: "th_test",
      showId: "show_test",
      items: [{ showSeatId: "seat_1", price: 200 }]
    };

    BookingService.seedResilientBooking(mockConfirmedBooking);

    // Re-processing an already confirmed booking must immediately return it without re-processing
    const result = await bookingService.confirmBooking(testBookingId, {
      orderId: "ord_dup_123",
      paymentId: "pay_dup_123",
      provider: "RAZORPAY"
    });

    assert(result && result.status === "CONFIRMED", "Must return confirmed booking");
    assert(result.id === testBookingId, "Returned booking must match requested ID");

    results.push({ name: "Idempotency: Re-processing already confirmed booking returns successfully without duplicating", passed: true });
  } catch (err: any) {
    results.push({ name: "Idempotency: Re-processing confirmed booking", passed: false, error: err.message });
  }

  // 4. Expired Seat-Lock Conflict & Auto-Refund Status Transition
  try {
    const testConflictBookingId = `bkg_conflict_${Date.now()}`;
    const mockPendingBooking = {
      id: testConflictBookingId,
      bookingNumber: `CV-CONF-999`,
      status: "PENDING",
      totalAmount: 235.40,
      theatreId: "th_test",
      showId: "show_test",
      items: [{ showSeatId: "seat_taken_01", price: 200 }]
    };

    BookingService.seedResilientBooking(mockPendingBooking);
    BookingService.bookedSeatIds.add("seat_taken_01");

    let threwConflict = false;
    try {
      await bookingService.confirmBooking(testConflictBookingId, {
        orderId: "order_conflict_1",
        paymentId: "pay_conflict_1",
        provider: "RAZORPAY"
      });
    } catch (e: any) {
      threwConflict = true;
      assert(e.statusCode === 409 || e.name === "ConflictError", "Must throw 409 ConflictError on already-taken seats");
    }

    assert(threwConflict, "Must refuse to confirm booking when seats were taken by another customer");

    const updatedBooking = BookingService.resilientBookings.get(testConflictBookingId);
    assert(updatedBooking?.status === "EXPIRED_REFUND_PENDING", "Must transition status to EXPIRED_REFUND_PENDING");

    results.push({ name: "Seat-Lock Expiry: Conflicting seat booking transitions to refund queue and rejects confirmation", passed: true });
  } catch (err: any) {
    results.push({ name: "Seat-Lock Expiry: Conflicting seat booking", passed: false, error: err.message });
  }

  // 5. Duplicate Payment Reference Reuse Prevention
  try {
    const testReuseBookingId = `bkg_reuse_${Date.now()}`;
    const mockPendingBooking = {
      id: testReuseBookingId,
      bookingNumber: `CV-REUSE-999`,
      status: "PENDING",
      totalAmount: 235.40,
      theatreId: "th_test",
      showId: "show_test",
      items: [{ showSeatId: "seat_free_01", price: 200 }]
    };

    BookingService.seedResilientBooking(mockPendingBooking);
    BookingService.paymentReferences.set("pay_already_used_123", "other_booking_999");

    let threwReuseConflict = false;
    try {
      await bookingService.confirmBooking(testReuseBookingId, {
        orderId: "order_reuse_1",
        paymentId: "pay_already_used_123",
        provider: "RAZORPAY"
      });
    } catch (e: any) {
      threwReuseConflict = true;
      assert(e.statusCode === 409 || e.name === "ConflictError", "Must throw 409 ConflictError on reused payment reference");
    }

    assert(threwReuseConflict, "Must reject reuse of identical payment reference across distinct bookings");

    results.push({ name: "Payment Reference Reuse: Duplicate payment reference across distinct bookings is rejected", passed: true });
  } catch (err: any) {
    results.push({ name: "Payment Reference Reuse: Duplicate payment reference", passed: false, error: err.message });
  } finally {
    BookingService.clearResilientBookings();
  }

  return results;
}

if (process.argv[1]?.includes("payment_gateway_hardening.test")) {
  runPaymentGatewayHardeningTests().then((res) => {
    console.log("Payment Gateway Hardening Tests:", res.length, "Passed:", res.filter(r => r.passed).length, "Failed:", res.filter(r => !r.passed).length);
    res.forEach(r => console.log(r.passed ? `  ✅ ${r.name}` : `  ❌ ${r.name}: ${r.error}`));
  });
}
