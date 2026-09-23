const bookingService = require("../services/booking.service");
const EventBooking = require("../models/EventBooking");
const EventTicket = require("../models/EventTicket");

// 1. POST /api/v1/event-bookings
exports.createBooking = async (req, res) => {
  try {
    const { eventId, tickets, customer, discount, cineCoinsUsed } = req.body;

    const result = await bookingService.createBooking({
      eventId,
      tickets,
      customer,
      userId: req.user?.id || null,
      discount,
      cineCoinsUsed,
    });

    res.status(201).json({
      success: true,
      bookingId: result.bookingId,
      razorpayOrderId: result.razorpayOrderId,
      amount: result.amount,
      currency: result.currency,
      booking: result.booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. GET /api/v1/event-bookings/:bookingId
exports.getBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(bookingId);
    const query = isObjectId ? { $or: [{ _id: bookingId }, { bookingId }] } : { bookingId };

    const booking = await EventBooking.findOne(query).populate("eventId");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const tickets = await EventTicket.find({ bookingId: booking._id }).populate("ticketTypeId");

    res.json({
      success: true,
      booking,
      tickets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET /api/v1/my/event-bookings
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    const email = req.query.email || req.user?.email;

    const query = {};
    if (userId) query.$or = [{ userId }, { "customer.email": email }];
    else if (email) query["customer.email"] = email;
    else {
      return res.status(400).json({
        success: false,
        message: "Authentication or customer email required",
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. GET /api/v1/admin/event-bookings
exports.adminGetBookings = async (req, res) => {
  try {
    const { eventId, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (eventId) query.eventId = eventId;
    if (status) query.status = status;

    const bookings = await EventBooking.find(query)
      .populate("eventId", "title slug date venue")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    const total = await EventBooking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
