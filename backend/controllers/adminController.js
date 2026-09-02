const User = require("../models/User");
const Movie = require("../models/Movie");
const Theatre = require("../models/Theatre");
const Booking = require("../models/Booking");

// Dashboard Statistics
exports.dashboard = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const movies = await Movie.countDocuments();
    const theatres = await Theatre.countDocuments();
    const bookings = await Booking.countDocuments();

    const revenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        users,
        movies,
        theatres,
        bookings,
        revenue: revenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Users
exports.users = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
