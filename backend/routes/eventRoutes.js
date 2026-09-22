const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

// Public routes
router.get("/", eventController.getEvents);
router.get("/:identifier", eventController.getEventBySlugOrId);

// Admin / Organizer routes
router.post("/", eventController.createEvent);
router.put("/:id", eventController.updateEvent);
router.post("/:id/ticket-types", eventController.addTicketType);

module.exports = router;
