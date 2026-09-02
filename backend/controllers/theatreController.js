const Theatre = require("../models/Theatre");

// Add Theatre
exports.addTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.create({
      ...req.body,
      owner: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Theatre Added",
      theatre,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Theatres
exports.getTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find().populate("owner", "name email");

    res.json({
      success: true,
      theatres,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Theatre By City
exports.getTheatresByCity = async (req, res) => {
  try {
    const theatres = await Theatre.find({
      city: req.params.city,
    });

    res.json({
      success: true,
      theatres,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Theatre
exports.deleteTheatre = async (req, res) => {
  try {
    await Theatre.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Theatre Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
