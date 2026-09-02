const Movie = require("../models/Movie");
const { uploadImage } = require("../services/uploadService");

// Add Movie
exports.addMovie = async (req, res) => {
  try {
    let poster = "";

    if (req.file) {
      poster = await uploadImage(req.file);
    }

    const movie = await Movie.create({
      ...req.body,
      poster,
    });

    res.status(201).json({
      success: true,
      movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Movies
exports.getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();

    res.json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Movie by ID
exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.json({
      success: true,
      movie,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update Movie
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.json({
      success: true,
      movie,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete Movie
exports.deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Movie Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Search Movies
exports.searchMovies = async (req, res) => {
  try {
    const { keyword, language, genre, sort } = req.query;

    let filter = {};

    if (keyword) {
      filter.title = {
        $regex: keyword,
        $options: "i",
      };
    }

    if (language) {
      filter.language = language;
    }

    if (genre) {
      filter.genre = {
        $in: [genre],
      };
    }

    let movies = Movie.find(filter);

    if (sort === "rating") {
      movies = movies.sort({
        rating: -1,
      });
    }

    const result = await movies;

    res.json({
      success: true,
      count: result.length,
      movies: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
