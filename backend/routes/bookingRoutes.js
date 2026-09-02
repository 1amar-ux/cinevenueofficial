const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createBooking,
  myBookings,
  cancelBooking,
} = require("../controllers/bookingController");

// Create Booking
router.post("/", auth, createBooking);

// Booking History
router.get("/my", auth, myBookings);

// Cancel Ticket
router.put("/cancel/:id", auth, cancelBooking);

module.exports = router;
