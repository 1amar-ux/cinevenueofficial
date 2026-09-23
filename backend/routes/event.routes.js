const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");

const freePassController = require("../controllers/freePass.controller");

// Public Event Routes
router.get("/", eventController.getEvents);
router.get("/:eventId", eventController.getEvent);
router.get("/:eventId/tickets", eventController.getEventTickets);
router.post("/:eventId/free-pass-requests", freePassController.publicRequestFreePass);
router.get("/:eventId/free-pass-capacity", freePassController.adminGetFreePassCapacity);

module.exports = router;

