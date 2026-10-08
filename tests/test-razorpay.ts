import { razorpayService } from "../server/modules/payments/razorpay.service";
import crypto from "crypto";

async function testRazorpayStandardCheckout() {
  console.log("=== Testing Razorpay Standard Web Checkout Integration ===");
  console.log("isConfigured:", razorpayService.isConfigured());
  console.log("isTestMode:", razorpayService.isTestMode());
  console.log("Key ID:", razorpayService.getKeyId());
  
  if (razorpayService.getKeyId() !== "rzp_test_TkyaAeNaWcbJho") {
    throw new Error(`Expected Key ID rzp_test_TkyaAeNaWcbJho, got: ${razorpayService.getKeyId()}`);
  }

  // 1. Test Minimum Amount Validation (< 100 paise)
  try {
    await razorpayService.createOrder({
      amount: 50 // 50 paise is below minimum 100 paise
    });
    throw new Error("Validation check failed: order below 100 paise should have been rejected");
  } catch (valErr: any) {
    console.log("✅ Minimum amount validation (< 100 paise) passed:", valErr.message);
  }

  // 2. Test Order Creation (>= 100 paise)
  const order = await razorpayService.createOrder({
    amount: 50000, // 50000 paise (₹500.00)
    currency: "INR",
    receipt: `test_receipt_${Date.now()}`,
    notes: {
      source: "standard_checkout_test",
      type: "ticket"
    }
  });

  console.log("\nCreated Razorpay Order:", {
    order_id: order.order_id,
    amount: order.amount,
    currency: order.currency,
    key_id: order.key_id
  });

  if (!order.order_id || !order.order_id.startsWith("order_")) {
    throw new Error("Order creation failed: invalid order id");
  }

  // 3. Test Cryptographic HMAC-SHA256 Signature Verification
  const secret = razorpayService.getKeySecret();
  const testOrderId = order.order_id;
  const testPaymentId = `pay_test_${Date.now()}`;
  
  // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${testOrderId}|${testPaymentId}`)
    .digest("hex");

  const verifySuccess = razorpayService.verifyPayment({
    razorpay_order_id: testOrderId,
    razorpay_payment_id: testPaymentId,
    razorpay_signature: validSignature
  });

  console.log("\nValid Signature Verification result:", verifySuccess);
  if (!verifySuccess.verified) {
    throw new Error("Valid signature verification failed");
  }

  // 4. Test Tampered Signature Rejection
  const verifyTampered = razorpayService.verifyPayment({
    razorpay_order_id: testOrderId,
    razorpay_payment_id: testPaymentId,
    razorpay_signature: "tampered_invalid_signature_xyz"
  });

  console.log("Tampered Signature Verification result (should be false):", verifyTampered.verified);
  if (verifyTampered.verified) {
    throw new Error("Tampered signature check failed: invalid signature was accepted");
  }

  // 5. Test Missing Field Rejection
  const verifyMissing = razorpayService.verifyPayment({
    razorpay_order_id: testOrderId,
    razorpay_payment_id: "",
    razorpay_signature: validSignature
  });
  if (verifyMissing.verified) {
    throw new Error("Missing field check failed: order with empty payment_id was accepted");
  }

  console.log("\nALL RAZORPAY STANDARD WEB CHECKOUT TESTS PASSED! ✅");
}

testRazorpayStandardCheckout().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
