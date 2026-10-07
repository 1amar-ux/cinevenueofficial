import { razorpayService } from "../server/modules/payments/razorpay.service";
import crypto from "crypto";

async function testRazorpay() {
  console.log("=== Testing Razorpay Service in Test Mode ===");
  console.log("isConfigured:", razorpayService.isConfigured());
  console.log("isTestMode:", razorpayService.isTestMode());
  console.log("Key ID:", razorpayService.getKeyId());

  // Test Order Creation
  const order = await razorpayService.createOrder({
    amount: 500, // 500 INR -> 50000 paise
    currency: "INR",
    receipt: `test_receipt_${Date.now()}`,
    notes: {
      source: "automated_test",
      type: "movie_ticket"
    }
  });

  console.log("\nCreated Test Order:", order);
  if (!order.id || !order.id.startsWith("order_")) {
    throw new Error("Order creation failed: invalid order id");
  }

  // Test Signature Verification
  const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret_9988776655";
  const testOrderId = order.id;
  const testPaymentId = `pay_test_${Date.now()}`;
  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${testOrderId}|${testPaymentId}`)
    .digest("hex");

  const isValid = razorpayService.verifySignature(testOrderId, testPaymentId, validSignature);
  console.log("\nValid Signature Verification result:", isValid);
  if (!isValid) {
    throw new Error("Valid signature verification failed");
  }

  const isInvalid = razorpayService.verifySignature(testOrderId, testPaymentId, "tampered_signature_xyz");
  console.log("Tampered Signature Verification result (should be false):", isInvalid);
  if (isInvalid) {
    throw new Error("Tampered signature check failed");
  }

  console.log("\nALL RAZORPAY TEST MODE TESTS PASSED SUCCESSFULLY! ✅");
}

testRazorpay().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
