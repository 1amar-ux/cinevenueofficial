const express = require("express");
const router = express.Router();
const movieBookingController = require("../controllers/movieBooking.controller");

// 1. POST /api/v1/movie-bookings
router.post("/", movieBookingController.createMovieBooking);

// 2. GET /api/v1/my/movie-bookings (Customer history)
router.get("/my/movie-bookings", movieBookingController.getMyMovieBookings);
router.get("/my-bookings", movieBookingController.getMyMovieBookings);

// 3. GET /api/v1/movie-bookings/:bookingId
router.get("/:bookingId", movieBookingController.getMovieBooking);

module.exports = router;
