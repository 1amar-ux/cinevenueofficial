const bookingService = require("../services/booking.service");
const paymentService = require("../services/payment.service");
const EventBooking = require("../models/EventBooking");

// 1. POST /api/v1/event-payments/create-order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { bookingId, eventId, tickets, customer, discount, cineCoinsUsed } = req.body;

    if (bookingId) {
      const booking = await EventBooking.findOne({ bookingId });
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      // Re-create or fetch existing Razorpay order
      const razorpayOrder = await paymentService.createRazorpayOrder(
        booking.pricing.total,
        `CVB_${booking.bookingId}`,
        { bookingId: booking.bookingId }
      );

      booking.payment.orderId = razorpayOrder.id;
      await booking.save();

      return res.json({
        success: true,
        bookingId: booking.bookingId,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount, // in paise
        currency: "INR",
      });
    }

    // Direct booking + order creation
    const result = await bookingService.createBooking({
      eventId,
      tickets,
      customer,
      userId: req.user?.id || null,
      discount,
      cineCoinsUsed,
    });

    res.json({
      success: true,
      bookingId: result.bookingId,
      razorpayOrderId: result.razorpayOrderId,
      amount: result.amount,
      currency: "INR",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 2. POST /api/v1/event-payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required",
      });
    }

    const result = await bookingService.confirmEventBooking({
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    res.json({
      success: true,
      bookingId: result.bookingId,
      status: result.status,
      alreadyProcessed: result.alreadyProcessed || false,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. POST /api/v1/webhooks/razorpay (Idempotent Razorpay Webhook Handler)
exports.handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret configured
    if (webhookSecret && signature) {
      const isValid = paymentService.verifyWebhookSignature(
        JSON.stringify(req.body),
        signature,
        webhookSecret
      );
      if (!isValid) {
        return res.status(400).json({ success: false, message: "Invalid webhook signature" });
      }
    }

    const event = req.body.event;
    console.log(`[RazorpayWebhook] Received event: ${event}`);

    if (event === "order.paid" || event === "payment.captured") {
      const paymentEntity = req.body.payload?.payment?.entity;
      const orderEntity = req.body.payload?.order?.entity;

      const orderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id || "webhook_captured";
      const bookingId = orderEntity?.notes?.bookingId || paymentEntity?.notes?.bookingId;

      if (!orderId && !bookingId) {
        return res.status(200).json({ status: "ignored_missing_order_reference" });
      }

      // Idempotently confirm either movie booking or event booking
      const movieBookingService = require("../services/movieBooking.service");
      const isMovieBooking = (bookingId && bookingId.startsWith("CVB-MOV-")) || await Booking.findOne({
        $or: [{ bookingId }, { "payment.orderId": orderId }],
      });

      if (isMovieBooking) {
        const result = await movieBookingService.confirmMovieBooking({
          bookingId,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          skipSignatureCheck: true,
        });
        console.log(`[RazorpayWebhook] Movie Booking ${result.bookingId} confirmed (Already processed: ${result.alreadyProcessed})`);
      } else {
        const result = await bookingService.confirmEventBooking({
          bookingId,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          skipSignatureCheck: true,
        });
        console.log(`[RazorpayWebhook] Event Booking ${result.bookingId} confirmed (Already processed: ${result.alreadyProcessed})`);
      }
    }

    // Razorpay requires standard HTTP 200 acknowledgment
    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("[RazorpayWebhook] Error processing webhook event:", err.message);
    res.status(200).json({ status: "acknowledged_with_error", error: err.message });
  }
};
