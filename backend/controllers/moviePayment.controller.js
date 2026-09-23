const movieBookingService = require("../services/movieBooking.service");
const paymentService = require("../services/payment.service");
const Booking = require("../models/Booking");

// 1. POST /api/v1/movie-payments/create-order
exports.createMoviePaymentOrder = async (req, res) => {
  try {
    const { bookingId, showtimeId, seats, customer, discount, cineCoinsUsed } = req.body;

    if (bookingId) {
      const booking = await Booking.findOne({ bookingId });
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      const total = booking.pricing?.total || booking.amount || 0;
      const razorpayOrder = await paymentService.createRazorpayOrder(
        total,
        booking.bookingId,
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
    const result = await movieBookingService.createMovieBooking({
      showtimeId,
      seats,
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
    res.status(error.status || 400).json({
      success: false,
      code: error.code || "PAYMENT_ORDER_FAILED",
      message: error.message,
    });
  }
};

// 2. POST /api/v1/movie-payments/verify
exports.verifyMoviePayment = async (req, res) => {
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

    const result = await movieBookingService.confirmMovieBooking({
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
      tickets: result.tickets,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message,
    });
  }
};
