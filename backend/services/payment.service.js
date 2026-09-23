const crypto = require("crypto");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder",
});

/**
 * Create Razorpay Order
 *
 * @param {number} amount - Amount in INR (will be converted to paise)
 * @param {string} [receipt] - Unique receipt id
 * @param {Object} [notes] - Additional metadata
 * @returns {Promise<Object>}
 */
async function createRazorpayOrder(amount, receipt = `rcpt_${Date.now()}`, notes = {}) {
  const options = {
    amount: Math.round(amount * 100), // In paise
    currency: "INR",
    receipt,
    notes,
  };

  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    return await razorpay.orders.create(options);
  }

  // Deterministic mock fallback for dev/testing when gateway credentials are unprovisioned
  return {
    id: `order_sim_${Date.now()}`,
    amount: options.amount,
    currency: "INR",
    receipt,
    status: "created",
  };
}

/**
 * Verify Razorpay Payment Signature
 */
function verifyPaymentSignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return true; // Permissive in mock dev mode

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Verify Razorpay Webhook Signature
 */
function verifyWebhookSignature(rawBody, signature, webhookSecret) {
  const secret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return true; // Permissive in mock dev mode

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return expectedSignature === signature;
}

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
};
