const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/eventTicket.controller");

// 1. GET /api/v1/event-tickets/:ticketId
router.get("/:ticketId", ticketController.getTicket);

// 2. GET /api/v1/event-tickets/:ticketId/download
router.get("/:ticketId/download", ticketController.downloadTicket);
router.get("/:ticketId/pdf", ticketController.downloadTicket); // alias

// 3. POST /api/v1/event-tickets/:ticketId/resend
router.post("/:ticketId/resend", ticketController.resendTicketEmail);

module.exports = router;
