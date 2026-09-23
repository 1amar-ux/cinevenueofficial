const movieBookingService = require("../services/movieBooking.service");
const Booking = require("../models/Booking");
const MovieTicket = require("../models/MovieTicket");

// 1. POST /api/v1/movie-bookings
exports.createMovieBooking = async (req, res) => {
  try {
    const { showtimeId, seats, customer, discount, cineCoinsUsed } = req.body;

    const result = await movieBookingService.createMovieBooking({
      showtimeId,
      seats,
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
    res.status(error.status || 400).json({
      success: false,
      code: error.code || "BOOKING_FAILED",
      message: error.message,
    });
  }
};

// 2. GET /api/v1/movie-bookings/:bookingId
exports.getMovieBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(bookingId);
    const query = isObjectId ? { $or: [{ _id: bookingId }, { bookingId }] } : { bookingId };

    const booking = await Booking.findOne(query)
      .populate("movieId", "title poster language duration certificate")
      .populate("theatreId", "name address city")
      .populate("screenId", "name")
      .populate("showtimeId", "date startTime endTime");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const tickets = await MovieTicket.find({ bookingId: booking._id });

    res.json({
      success: true,
      booking,
      tickets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET /api/v1/my/movie-bookings
exports.getMyMovieBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    const email = req.query.email || req.user?.email;

    const query = {};
    if (userId) {
      query.$or = [{ userId }, { user: userId }, { "customer.email": email }];
    } else if (email) {
      query["customer.email"] = email;
    } else {
      return res.status(400).json({
        success: false,
        message: "User ID or customer email required to retrieve movie bookings",
      });
    }

    const bookings = await Booking.find(query)
      .populate("movieId", "title poster language")
      .populate("theatreId", "name city")
      .populate("screenId", "name")
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
