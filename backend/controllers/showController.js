const Show = require("../models/Show");
const Screen = require("../models/Screen");
const { getShowLockedSeats } = require("../services/seatLockService");

// Create Show
exports.createShow = async (req, res) => {
  try {
    const {
      movie,
      theatre,
      screen,
      date,
      startTime,
      endTime,
      language,
      price,
    } = req.body;

    const screenData = await Screen.findById(screen);

    if (!screenData) {
      return res.status(404).json({
        message: "Screen not found",
      });
    }

    // Generate Seats
    let seats = [];

    screenData.seats.forEach((seat) => {
      seats.push({
        seatNumber: seat.row + seat.number,
        category: seat.type,
        status: "available",
      });
    });

    const show = await Show.create({
      movie,
      theatre,
      screen,
      date,
      startTime,
      endTime,
      language,
      price,
      seats,
    });

    res.status(201).json({
      success: true,
      message: "Show Created",
      show,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Shows
exports.getShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate("movie")
      .populate("theatre")
      .populate("screen");

    res.json({
      success: true,
      shows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Shows By Movie
exports.getMovieShows = async (req, res) => {
  try {
    const shows = await Show.find({
      movie: req.params.movieId,
    })
      .populate("theatre")
      .populate("screen");

    res.json({
      success: true,
      shows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Seat Layout with Real-Time Lock Status
exports.getSeats = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    const lockedMap = await getShowLockedSeats(req.params.id);

    const enrichedSeats = (show.seats || []).map((seat) => {
      const plainSeat = seat.toObject ? seat.toObject() : { ...seat };
      const lockInfo = lockedMap[plainSeat.seatNumber];

      if (plainSeat.status === "available" && lockInfo) {
        return {
          ...plainSeat,
          status: "locked",
          lockedUntil: lockInfo.expiresAt,
          remainingSeconds: lockInfo.remainingTtl,
        };
      }
      return plainSeat;
    });

    res.json({
      success: true,
      seats: enrichedSeats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search Shows By City
exports.getShowsByCity = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate({
        path: "theatre",
        match: {
          city: req.params.city,
        },
      })
      .populate("movie")
      .populate("screen");

    const filtered = shows.filter((show) => show.theatre);

    res.json({
      success: true,
      shows: filtered,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
