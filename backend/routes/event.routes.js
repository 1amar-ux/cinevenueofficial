const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");

const freePassController = require("../controllers/freePass.controller");

// Public Event Routes
router.get("/", eventController.getEvents);
router.get("/upcoming", eventController.getUpcomingEvents);
router.get("/ongoing", eventController.getOngoingEvents);
router.get("/completed", eventController.getCompletedEvents);
router.get("/free", eventController.getFreeEvents);
router.get("/paid", eventController.getPaidEvents);

router.get("/:eventId", eventController.getEvent);
router.get("/:eventId/tickets", eventController.getEventTickets);
router.post("/:eventId/free-pass-requests", freePassController.publicRequestFreePass);
router.get("/:eventId/free-pass-capacity", freePassController.adminGetFreePassCapacity);

module.exports = router;

