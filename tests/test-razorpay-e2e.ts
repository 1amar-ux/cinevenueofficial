import http from "http";
import axios from "axios";
import crypto from "crypto";
import { createApp } from "../server/app";
import { env } from "../server/config/env";
import { razorpayService } from "../server/modules/payments/razorpay.service";

async function runE2ETests() {
  console.log("==================================================");
  console.log("   RAZORPAY STANDARD WEB CHECKOUT E2E VERIFICATION ");
  console.log("==================================================");

  console.log("Configuration status:");
  console.log("  isConfigured:", razorpayService.isConfigured());
  console.log("  isTestMode  :", razorpayService.isTestMode());
  console.log("  Key ID      :", razorpayService.getKeyId());

  // 1. Boot up app on an ephemeral port
  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`\nEphemeral test server running at ${baseUrl}`);

  try {
    // ----------------------------------------------------
    // TEST 1: Minimum Amount Validation (< 100 paise) -> HTTP 400
    // ----------------------------------------------------
    console.log("\n[Test 1] Testing minimum amount validation (< 100 paise)...");
    try {
      await axios.post(`${baseUrl}/api/create-order`, { amount: 50, currency: "INR" });
      throw new Error("Validation failure: 50 paise should have returned HTTP 400");
    } catch (err: any) {
      if (err.response?.status === 400) {
        console.log("  ✅ Expected HTTP 400 returned:", err.response.data);
      } else {
        throw err;
      }
    }

    // ----------------------------------------------------
    // TEST 2: Live Razorpay Order Creation -> HTTP 200 & order_id
    // ----------------------------------------------------
    console.log("\n[Test 2] Testing live Razorpay order creation (₹250 = 25000 paise)...");
    const orderRes = await axios.post(`${baseUrl}/api/create-order`, {
      amount: 25000,
      currency: "INR",
      receipt: `test_rcpt_${Date.now()}`
    });

    console.log("  Status:", orderRes.status);
    console.log("  Response payload:", orderRes.data);

    if (!orderRes.data.success || !orderRes.data.order_id || !orderRes.data.order_id.startsWith("order_")) {
      throw new Error(`Order creation failed or invalid order_id: ${JSON.stringify(orderRes.data)}`);
    }
    console.log("  ✅ Order created successfully with Razorpay API:", orderRes.data.order_id);

    const testOrderId = orderRes.data.order_id;
    const testPaymentId = `pay_test_${Date.now()}`;
    const secret = razorpayService.getKeySecret();

    // ----------------------------------------------------
    // TEST 3: Cryptographic HMAC-SHA256 Signature Verification -> HTTP 200
    // ----------------------------------------------------
    console.log("\n[Test 3] Testing valid signature verification...");
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest("hex");

    const verifySuccessRes = await axios.post(`${baseUrl}/api/verify-payment`, {
      razorpay_order_id: testOrderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: validSignature
    });

    console.log("  Status:", verifySuccessRes.status);
    console.log("  Response payload:", verifySuccessRes.data);
    if (!verifySuccessRes.data.success || !verifySuccessRes.data.verified) {
      throw new Error("Valid signature verification failed");
    }
    console.log("  ✅ Valid HMAC-SHA256 signature verified successfully!");

    // ----------------------------------------------------
    // TEST 4: Tampered Signature Rejection -> HTTP 400
    // ----------------------------------------------------
    console.log("\n[Test 4] Testing tampered signature rejection...");
    try {
      await axios.post(`${baseUrl}/api/verify-payment`, {
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: "tampered_fake_signature_xyz"
      });
      throw new Error("Tampered signature check failed: invalid signature was accepted");
    } catch (err: any) {
      if (err.response?.status === 400) {
        console.log("  ✅ Expected HTTP 400 returned for tampered signature:", err.response.data);
      } else {
        throw err;
      }
    }

    // ----------------------------------------------------
    // TEST 5: Missing Fields Rejection -> HTTP 400
    // ----------------------------------------------------
    console.log("\n[Test 5] Testing missing fields rejection...");
    try {
      await axios.post(`${baseUrl}/api/verify-payment`, {
        razorpay_order_id: testOrderId,
        razorpay_payment_id: "",
        razorpay_signature: validSignature
      });
      throw new Error("Missing fields check failed: missing payment_id was accepted");
    } catch (err: any) {
      if (err.response?.status === 400) {
        console.log("  ✅ Expected HTTP 400 returned for missing fields:", err.response.data);
      } else {
        throw err;
      }
    }

    console.log("\n==================================================");
    console.log("  ALL RAZORPAY END-TO-END HTTP TESTS PASSED! ✅");
    console.log("==================================================");
  } finally {
    server.close();
  }
}

runE2ETests().catch((err) => {
  console.error("E2E Test failed:", err);
  process.exit(1);
});
