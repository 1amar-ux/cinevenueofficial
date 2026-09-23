const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/eventBooking.controller");

const freePassController = require("../controllers/freePass.controller");

// 1. POST /api/v1/event-bookings (Create Booking)
router.post("/", bookingController.createBooking);

// 2. GET /api/v1/my/event-bookings (Customer Bookings)
router.get("/my/event-bookings", bookingController.getMyBookings);
router.get("/my-bookings", bookingController.getMyBookings);
router.get("/free-pass-requests", freePassController.publicGetMyRequests);

// 3. POST /api/v1/event-bookings/:bookingId/cancel-reservation
router.post("/:bookingId/cancel-reservation", async (req, res) => {
  try {
    const bookingService = require("../services/booking.service");
    const result = await bookingService.releaseBookingReservation(req.params.bookingId);
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 4. GET /api/v1/event-bookings/:bookingId (Booking Details)
router.get("/:bookingId", bookingController.getBooking);

module.exports = router;

