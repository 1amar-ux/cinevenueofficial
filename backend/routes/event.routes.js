const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");

// Public Event Routes
router.get("/", eventController.getEvents);
router.get("/:eventId", eventController.getEvent);
router.get("/:eventId/tickets", eventController.getEventTickets);

module.exports = router;
