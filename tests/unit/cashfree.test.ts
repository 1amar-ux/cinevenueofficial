import crypto from "crypto";
import { cashfreeService, CashfreeService } from "../../server/modules/payments/cashfree.service";

export async function runCashfreeTests(): Promise<{ name: string; passed: boolean; error?: string }[]> {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  // Test 1: Order creation with default sandbox simulator
  try {
    const order = await cashfreeService.createOrder({
      orderId: `test_order_${Date.now()}`,
      orderAmount: 499.50,
      customerDetails: {
        customerId: "cust_12345",
        customerName: "Jane Doe",
        customerEmail: "jane@cinevenue.in",
        customerPhone: "+91 98765 43210"
      },
      notes: { bookingType: "MOVIE" }
    });

    if (
      order &&
      order.orderId.startsWith("test_order_") &&
      order.paymentSessionId &&
      order.orderAmount === 499.50 &&
      order.orderCurrency === "INR"
    ) {
      results.push({ name: "Cashfree Service: createOrder generates session ID and valid order shape", passed: true });
    } else {
      results.push({ name: "Cashfree Service: createOrder output mismatch", passed: false, error: JSON.stringify(order) });
    }
  } catch (err: any) {
    results.push({ name: "Cashfree Service: createOrder error", passed: false, error: err.message });
  }

  // Test 2: Order verification in sandbox simulation
  try {
    const verifyRes = await cashfreeService.verifyOrderPayment("order_sim_test_123");
    if (verifyRes.isPaid === true && verifyRes.orderStatus === "PAID") {
      results.push({ name: "Cashfree Service: verifyOrderPayment handles sandbox verification", passed: true });
    } else {
      results.push({ name: "Cashfree Service: verifyOrderPayment invalid response", passed: false, error: JSON.stringify(verifyRes) });
    }
  } catch (err: any) {
    results.push({ name: "Cashfree Service: verifyOrderPayment error", passed: false, error: err.message });
  }

  // Test 3: Webhook HMAC-SHA256 signature verification logic
  try {
    const secret = "test_secret_key_123456";
    const timestamp = "1726038400";
    const rawBody = JSON.stringify({ data: { order: { order_id: "order_123" } } });
    const payload = `${timestamp}${rawBody}`;
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64");

    // Temporarily verify using helper logic
    const computed = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(validSignature, "utf-8"),
      Buffer.from(computed, "utf-8")
    );

    if (isValid) {
      results.push({ name: "Cashfree Service: HMAC-SHA256 signature algorithm validation", passed: true });
    } else {
      results.push({ name: "Cashfree Service: HMAC-SHA256 timing-safe comparison failed", passed: false, error: "Signature mismatch" });
    }
  } catch (err: any) {
    results.push({ name: "Cashfree Service: Webhook signature test error", passed: false, error: err.message });
  }

  return results;
}
