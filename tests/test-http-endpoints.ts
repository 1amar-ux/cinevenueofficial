import axios from "axios";
import crypto from "crypto";

async function testHttpEndpoints() {
  console.log("=== Testing HTTP Endpoints on Live Server ===");
  const baseUrl = "http://localhost:3000";

  // 1. Test POST /api/create-order
  console.log("Testing POST /api/create-order with 25000 paise (₹250.00)...");
  const createRes = await axios.post(`${baseUrl}/api/create-order`, {
    amount: 25000,
    currency: "INR",
    receipt: `test_rcpt_${Date.now()}`
  });

  console.log("Create Order Response:", createRes.status, createRes.data);
  if (!createRes.data.success || !createRes.data.order_id) {
    throw new Error("HTTP create-order failed");
  }

  const orderId = createRes.data.order_id;
  const paymentId = `pay_test_${Date.now()}`;
  const secret = "60cM0Gtr0HGjnanWORmYPrQ9";

  // 2. Generate valid HMAC signature
  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // 3. Test POST /api/verify-payment
  console.log("\nTesting POST /api/verify-payment with valid signature...");
  const verifyRes = await axios.post(`${baseUrl}/api/verify-payment`, {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: validSignature
  });

  console.log("Verify Payment Response:", verifyRes.status, verifyRes.data);
  if (!verifyRes.data.success || !verifyRes.data.verified) {
    throw new Error("HTTP verify-payment failed with valid signature");
  }

  // 4. Test POST /api/verify-payment with invalid signature (should return 400)
  console.log("\nTesting POST /api/verify-payment with tampered signature (should return 400)...");
  try {
    await axios.post(`${baseUrl}/api/verify-payment`, {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: "tampered_signature"
    });
    throw new Error("Expected 400 on tampered signature, but got 200");
  } catch (err: any) {
    if (err.response?.status === 400) {
      console.log("✅ Expected 400 received on tampered signature:", err.response.data);
    } else {
      throw err;
    }
  }

  // 5. Test POST /api/create-order with amount < 100 paise (should return 400)
  console.log("\nTesting POST /api/create-order with 50 paise (should return 400)...");
  try {
    await axios.post(`${baseUrl}/api/create-order`, {
      amount: 50
    });
    throw new Error("Expected 400 on amount < 100, but got 200");
  } catch (err: any) {
    if (err.response?.status === 400) {
      console.log("✅ Expected 400 received on amount < 100 paise:", err.response.data);
    } else {
      throw err;
    }
  }

  console.log("\nALL HTTP ENDPOINT TESTS PASSED SUCCESSFULLY! ✅");
}

testHttpEndpoints().catch((err) => {
  console.error("HTTP endpoint test failed:", err?.response?.data || err.message);
  process.exit(1);
});
