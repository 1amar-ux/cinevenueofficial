const Movie = require("../models/Movie");

// GET /api/v1/movies
exports.getMovies = async (req, res) => {
  try {
    const { language, genre, search, active = "true" } = req.query;
    const query = {};

    if (active === "true") query.active = true;
    if (language) query.language = new RegExp(`^${language}$`, "i");
    if (genre) query.genre = new RegExp(`^${genre}$`, "i");
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const movies = await Movie.find(query).sort({ releaseDate: -1 });

    res.json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/movies/:movieId
exports.getMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    res.json({ success: true, movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
