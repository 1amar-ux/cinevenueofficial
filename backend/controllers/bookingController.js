const Booking = require("../models/Booking");
const Show = require("../models/Show");
const { lockSeat, unlockSeat } = require("../services/seatLockService");
const { v4: uuid } = require("uuid");

// Create Booking with Atomic Seat Hold
exports.createBooking = async (req, res) => {
  try {
    const { showId, seats } = req.body;

    if (!showId) {
      return res.status(400).json({
        success: false,
        message: "showId is required",
      });
    }

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one seat",
      });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    // Validate that requested seats exist in show layout
    const missingSeats = seats.filter(
      (seatNum) => !show.seats.some((s) => s.seatNumber === seatNum)
    );
    if (missingSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid seat(s) for this show: ${missingSeats.join(", ")}`,
      });
    }

    // Validate that none of the requested seats are already permanently booked
    const alreadyBooked = show.seats.filter(
      (s) => seats.includes(s.seatNumber) && s.status === "booked"
    );
    if (alreadyBooked.length > 0) {
      return res.status(409).json({
        success: false,
        code: "SEAT_ALREADY_BOOKED",
        message: `Seat(s) already booked: ${alreadyBooked.map((s) => s.seatNumber).join(", ")}`,
      });
    }

    // Atomic seat locking with rollback protection on contention
    try {
      await lockSeat(showId, seats, req.user.id);
    } catch (lockErr) {
      return res.status(409).json({
        success: false,
        code: lockErr.code || "SEAT_ALREADY_LOCKED",
        seat: lockErr.seat,
        message: lockErr.message || "One or more seats are currently locked by another customer",
      });
    }

    // Safe ticket price calculation
    let amount = 0;
    seats.forEach((seat) => {
      const seatData = show.seats.find((s) => s.seatNumber === seat);
      const category = seatData ? seatData.category : "regular";

      if (category === "vip" && show.price && show.price.vip) {
        amount += show.price.vip;
      } else if (category === "premium" && show.price && show.price.premium) {
        amount += show.price.premium;
      } else if (show.price && show.price.regular) {
        amount += show.price.regular;
      } else {
        amount += 150; // Standard fallback INR
      }
    });

    let booking;
    try {
      booking = await Booking.create({
        user: req.user.id,
        show: showId,
        seats,
        amount,
        bookingId: "BK" + uuid().substring(0, 8).toUpperCase(),
        bookingStatus: "pending",
        paymentStatus: "unpaid",
      });
    } catch (dbError) {
      // Immediate compensation rollback: free seat lock if DB record creation fails
      await unlockSeat(showId, seats, req.user.id);
      throw dbError;
    }

    res.status(201).json({
      success: true,
      message: "Seats locked successfully. Please complete payment within 5 minutes.",
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
      success: false,
      message: error.message,
    });
  }
};

// Cancel Booking & Release Held Seats
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not Allowed",
      });
    }

    booking.bookingStatus = "cancelled";
    await booking.save();

    // Safely release Redis lock
    await unlockSeat(booking.show, booking.seats, req.user.id);

    // If seats were marked as booked in Show model, revert them back to available
    await Show.updateOne(
      {
        _id: booking.show,
        "seats.seatNumber": {
          $in: booking.seats,
        },
      },
      {
        $set: {
          "seats.$[seat].status": "available",
        },
      },
      {
        arrayFilters: [
          {
            "seat.seatNumber": {
              $in: booking.seats,
            },
          },
        ],
      }
    );

    res.json({
      success: true,
      message: "Booking cancelled and seats successfully released",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
