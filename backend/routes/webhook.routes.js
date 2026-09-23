const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/eventPayment.controller");

// POST /api/v1/webhooks/razorpay (Idempotent Razorpay Webhook Handler)
router.post("/razorpay", paymentController.handleRazorpayWebhook);

module.exports = router;
