const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createShow,
  getShows,
  getMovieShows,
  getSeats,
  getShowsByCity,
} = require("../controllers/showController");

// Create Show
router.post("/", auth, createShow);

// All Shows
router.get("/", getShows);

// Movie Shows
router.get("/movie/:movieId", getMovieShows);

// Seat Layout
router.get("/seats/:id", getSeats);

// City Shows
router.get("/city/:city", getShowsByCity);

module.exports = router;
