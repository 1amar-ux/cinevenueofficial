const express = require("express");
const router = express.Router();
const showtimeController = require("../controllers/showtime.controller");

// 1. GET /api/v1/showtimes
router.get("/", showtimeController.getShowtimes);

// 2. GET /api/v1/showtimes/:showtimeId/seats
router.get("/:showtimeId/seats", showtimeController.getShowtimeSeats);

// 3. POST /api/v1/showtimes/:showtimeId/seat-lock
router.post("/:showtimeId/seat-lock", showtimeController.lockSeats);

// 4. POST /api/v1/showtimes/:showtimeId/seat-unlock
router.post("/:showtimeId/seat-unlock", showtimeController.unlockSeats);

module.exports = router;
