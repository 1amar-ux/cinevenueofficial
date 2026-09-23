const Theatre = require("../models/Theatre");

// GET /api/v1/theatres
exports.getTheatres = async (req, res) => {
  try {
    const { city, search } = req.query;
    const query = { status: "active" };

    if (city) query.city = new RegExp(`^${city}$`, "i");
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const theatres = await Theatre.find(query).populate("screens");

    res.json({
      success: true,
      count: theatres.length,
      theatres,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/theatres/:theatreId
exports.getTheatre = async (req, res) => {
  try {
    const { theatreId } = req.params;
    const theatre = await Theatre.findById(theatreId).populate("screens");

    if (!theatre) {
      return res.status(404).json({ success: false, message: "Theatre not found" });
    }

    res.json({ success: true, theatre });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
