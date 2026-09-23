const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/eventPayment.controller");

// 1. POST /api/v1/event-payments/create-order
router.post("/create-order", paymentController.createPaymentOrder);

// 2. POST /api/v1/event-payments/verify
router.post("/verify", paymentController.verifyPayment);

module.exports = router;
