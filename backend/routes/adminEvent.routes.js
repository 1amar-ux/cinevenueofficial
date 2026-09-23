const express = require("express");
const router = express.Router();

const eventController = require("../controllers/event.controller");
const bookingController = require("../controllers/eventBooking.controller");
const ticketController = require("../controllers/eventTicket.controller");
const verificationController = require("../controllers/ticketVerification.controller");
const freePassController = require("../controllers/freePass.controller");

const upload = require("../middleware/upload");
const uploadController = require("../controllers/upload.controller");

// Admin Media Uploads
router.post("/uploads/event-poster", upload.single("poster"), uploadController.uploadEventPoster);
router.post("/uploads/event-banner", upload.single("banner"), uploadController.uploadEventBanner);
router.post("/uploads/image", upload.single("image"), uploadController.uploadGenericImage);

// Admin Events Management
router.get("/events", eventController.adminGetEvents);
router.post("/events", eventController.createEvent);
router.patch("/events/:eventId", eventController.updateEvent);
router.post("/events/:eventId/publish", eventController.publishEvent);
router.post("/events/:eventId/unpublish", eventController.unpublishEvent);
router.patch("/events/:eventId/status", eventController.changeEventStatus);
router.post("/events/:eventId/cancel", eventController.cancelEvent);
router.delete("/events/:eventId", eventController.deleteEvent);
router.post("/events/:eventId/close-booking", eventController.closeBooking);

// Admin Event Capacity & Ticket Limits
router.get("/events/:eventId/capacity", eventController.getEventCapacity);
router.patch("/events/:eventId/capacity", eventController.updateEventCapacity);
router.patch("/events/:eventId/ticket-types/:ticketTypeId", eventController.updateTicketType);
router.get("/events/:eventId/ticket-sales", eventController.getEventTicketSales);

// Admin Complimentary / Free Passes
router.post("/events/:eventId/free-passes", freePassController.adminIssueFreePass);
router.post("/events/:eventId/free-passes/bulk", freePassController.adminBulkIssueFreePasses);
router.get("/events/:eventId/free-passes", freePassController.adminGetFreePasses);
router.get("/events/:eventId/free-pass-capacity", freePassController.adminGetFreePassCapacity);
router.post("/events/:eventId/free-passes/:ticketId/cancel", freePassController.adminCancelFreePass);
router.post("/events/:eventId/free-passes/:ticketId/resend", freePassController.adminResendFreePass);

// Admin Pass Requests & Approvals
router.get("/events/:eventId/free-pass-requests", freePassController.adminGetPassRequests);
router.post("/free-pass-requests/:requestId/approve", freePassController.adminApprovePassRequest);
router.post("/free-pass-requests/:requestId/reject", freePassController.adminRejectPassRequest);

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
