const Show = require("../models/Show");
const seatLockService = require("../services/seatLockService");

// 1. GET /api/v1/showtimes
exports.getShowtimes = async (req, res) => {
  try {
    const { movieId, theatreId, date } = req.query;
    const query = {};

    if (movieId) query.movie = movieId;
    if (theatreId) query.theatre = theatreId;
    if (date) query.date = date;

    const showtimes = await Show.find(query)
      .populate("movie", "title poster language duration certificate")
      .populate("theatre", "name city address")
      .populate("screen", "name")
      .sort({ startTime: 1 });

    res.json({
      success: true,
      count: showtimes.length,
      showtimes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET /api/v1/movies/:movieId/showtimes
exports.getMovieShowtimes = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { date, city } = req.query;

    const query = { movie: movieId };
    if (date) query.date = date;

    let showtimes = await Show.find(query)
      .populate({
        path: "theatre",
        match: city ? { city: new RegExp(`^${city}$`, "i") } : undefined,
      })
      .populate("screen", "name")
      .populate("movie", "title poster language duration")
      .sort({ startTime: 1 });

    // Filter out shows whose theatre didn't match city filter
    if (city) {
      showtimes = showtimes.filter((s) => s.theatre);
    }

    res.json({
      success: true,
      count: showtimes.length,
      showtimes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET /api/v1/showtimes/:showtimeId/seats (With real-time Redis seat locks overlaid!)
exports.getShowtimeSeats = async (req, res) => {
  try {
    const { showtimeId } = req.params;
    const show = await Show.findById(showtimeId)
      .populate("movie", "title")
      .populate("theatre", "name")
      .populate("screen", "name");

    if (!show) {
      return res.status(404).json({ success: false, message: "Showtime not found" });
    }

    // Retrieve active Redis seat locks
    const lockedMap = await seatLockService.getShowLockedSeats(showtimeId);

    const seats = (show.seats || []).map((seat) => {
      const plain = seat.toObject ? seat.toObject() : { ...seat };
      const lockInfo = lockedMap[plain.seatNumber];

      if (plain.status === "available" && lockInfo) {
        return {
          ...plain,
          status: "locked",
          lockedUntil: lockInfo.expiresAt,
          remainingSeconds: lockInfo.remainingTtl,
        };
      }
      return plain;
    });

    res.json({
      success: true,
      showtimeId: show._id,
      price: show.price,
      seats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. POST /api/v1/showtimes/:showtimeId/seat-lock
exports.lockSeats = async (req, res) => {
  try {
    const { showtimeId } = req.params;
    const { seats, userId } = req.body;

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: "seats array is required" });
    }

    const show = await Show.findById(showtimeId);
    if (!show) {
      return res.status(404).json({ success: false, message: "Showtime not found" });
    }

    // Check if any seat is already permanently booked
    const bookedSeats = show.seats.filter(
      (s) => seats.includes(s.seatNumber) && s.status === "booked"
    );
    if (bookedSeats.length > 0) {
      return res.status(409).json({
        success: false,
        code: "SEAT_ALREADY_BOOKED",
        message: `Seat(s) already booked: ${bookedSeats.map((s) => s.seatNumber).join(", ")}`,
      });
    }

    const lockHolder = userId || req.user?.id || req.body.email || "guest_session";
    const lockResult = await seatLockService.lockSeat(showtimeId, seats, lockHolder, 300);

    res.json({
      success: true,
      message: "Seats locked successfully for 5 minutes",
      lockResult,
    });
  } catch (error) {
    res.status(error.status || 409).json({
      success: false,
      code: error.code || "SEAT_LOCK_FAILED",
      message: error.message,
    });
  }
};

// 5. POST /api/v1/showtimes/:showtimeId/seat-unlock
exports.unlockSeats = async (req, res) => {
  try {
    const { showtimeId } = req.params;
    const { seats, userId } = req.body;

    if (!seats || !Array.isArray(seats)) {
      return res.status(400).json({ success: false, message: "seats array is required" });
    }

    const lockHolder = userId || req.user?.id || null;
    const result = await seatLockService.unlockSeat(showtimeId, seats, lockHolder);

    res.json({
      success: true,
      message: "Seats unlocked successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
