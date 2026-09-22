const eventBookingService = require("../services/eventBookingService");
const EventBooking = require("../models/EventBooking");
const EventTicket = require("../models/EventTicket");
const Event = require("../models/Event");

// 1. Create Event Booking & Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { eventId, tickets, customer, discount, cineCoinsUsed } = req.body;

    const result = await eventBookingService.createEventBookingOrder({
      eventId,
      tickets,
      customer,
      userId: req.user ? req.user.id : null,
      discount,
      cineCoinsUsed,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully. Please complete Razorpay payment.",
      booking: result.booking,
      order: result.razorpayOrder,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Verify Razorpay Payment & Confirm Booking
exports.verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id && !bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId or razorpay_order_id is required",
      });
    }

    const result = await eventBookingService.verifyEventPaymentAndConfirm({
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    res.json({
      success: true,
      message: result.message,
      booking: result.booking,
      tickets: result.tickets,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Get Booking Details
exports.getBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { $or: [{ _id: id }, { bookingId: id }] } : { bookingId: id };

    const booking = await EventBooking.findOne(query).populate("eventId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const tickets = await EventTicket.find({ bookingId: booking._id }).populate("ticketTypeId");

    res.json({
      success: true,
      booking,
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Get User's Event Bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const email = req.query.email || (req.user ? req.user.email : null);

    const query = {};
    if (userId) {
      query.$or = [{ userId }, { "customer.email": email }];
    } else if (email) {
      query["customer.email"] = email;
    } else {
      return res.status(400).json({
        success: false,
        message: "User ID or customer email required to fetch bookings",
      });
    }

    const bookings = await EventBooking.find(query)
      .populate("eventId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
