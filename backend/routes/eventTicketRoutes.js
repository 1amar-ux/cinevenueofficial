const express = require("express");
const router = express.Router();
const eventTicketController = require("../controllers/eventTicketController");

// Get Single Ticket details
router.get("/:ticketId", eventTicketController.getTicket);

// Download PDF Ticket Pass
router.get("/:ticketId/pdf", eventTicketController.downloadTicketPdf);

module.exports = router;
