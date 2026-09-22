const express = require("express");
const router = express.Router();
const eventBookingController = require("../controllers/eventBookingController");

// Create Razorpay Order
router.post("/create-order", eventBookingController.createOrder);

// Verify Signature & Confirm Booking
router.post("/verify-payment", eventBookingController.verifyPayment);

// Customer Bookings
router.get("/my-bookings", eventBookingController.getUserBookings);

// Booking Details
router.get("/:id", eventBookingController.getBooking);

module.exports = router;
