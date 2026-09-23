const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/eventBooking.controller");

// 1. POST /api/v1/event-bookings (Create Booking)
router.post("/", bookingController.createBooking);

// 2. GET /api/v1/my/event-bookings (Customer Bookings)
router.get("/my/event-bookings", bookingController.getMyBookings);
router.get("/my-bookings", bookingController.getMyBookings);

// 3. GET /api/v1/event-bookings/:bookingId (Booking Details)
router.get("/:bookingId", bookingController.getBooking);

module.exports = router;
