const express = require("express");
const router = express.Router();

const eventController = require("../controllers/event.controller");
const bookingController = require("../controllers/eventBooking.controller");
const ticketController = require("../controllers/eventTicket.controller");
const verificationController = require("../controllers/ticketVerification.controller");

// Admin Events
router.post("/events", eventController.createEvent);
router.patch("/events/:eventId", eventController.updateEvent);
router.post("/events/:eventId/publish", eventController.publishEvent);
router.post("/events/:eventId/close-booking", eventController.closeBooking);

// Admin Event Tickets & Check-Ins
router.get("/events/:eventId/tickets", ticketController.adminGetEventTickets);
router.get("/events/:eventId/check-ins", verificationController.adminGetEventCheckIns);

// Admin Event Bookings
router.get("/event-bookings", bookingController.adminGetBookings);
router.get("/event-bookings/:bookingId", bookingController.getBooking);

// Admin Ticket Actions
router.post("/event-tickets/:ticketId/cancel", ticketController.adminCancelTicket);
router.post("/event-tickets/:ticketId/refund", ticketController.adminRefundTicket);

module.exports = router;
