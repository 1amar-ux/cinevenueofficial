const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movie.controller");
const showtimeController = require("../controllers/showtime.controller");

// 1. GET /api/v1/movies
router.get("/", movieController.getMovies);

// 2. GET /api/v1/movies/:movieId
router.get("/:movieId", movieController.getMovie);

// 3. GET /api/v1/movies/:movieId/showtimes
router.get("/:movieId/showtimes", showtimeController.getMovieShowtimes);

module.exports = router;
