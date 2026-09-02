const Booking = require("../models/Booking");
const Show = require("../models/Show");
const { lockSeat } = require("../services/seatLockService");
const { v4: uuid } = require("uuid");

// Create Booking
exports.createBooking = async (req, res) => {
  try {
    const { showId, seats } = req.body;

    const show = await Show.findById(showId);

    if (!show) {
      return res.status(404).json({
        message: "Show not found",
      });
    }

    // Lock seats
    await lockSeat(showId, seats, req.user.id);

    let amount = 0;

    seats.forEach((seat) => {
      const seatData = show.seats.find((s) => s.seatNumber === seat);

      if (seatData.category === "regular") amount += show.price.regular;
      if (seatData.category === "premium") amount += show.price.premium;
      if (seatData.category === "vip") amount += show.price.vip;
    });

    const booking = await Booking.create({
      user: req.user.id,
      show: showId,
      seats,
      amount,
      bookingId: "BK" + uuid().substring(0, 8).toUpperCase(),
    });

    res.status(201).json({
      success: true,
      message: "Seats Locked. Complete Payment",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// User Booking History
exports.myBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user.id,
    }).populate({
      path: "show",
      populate: [
        {
          path: "movie",
        },
        {
          path: "theatre",
        },
      ],
    });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not Allowed",
      });
    }

    booking.bookingStatus = "cancelled";

    await booking.save();

    res.json({
      success: true,
      message: "Booking Cancelled",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
