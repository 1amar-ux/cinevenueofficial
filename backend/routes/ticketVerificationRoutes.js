const express = require("express");
const router = express.Router();
const eventTicketController = require("../controllers/eventTicketController");

// Scan and verify ticket QR at gate
router.post("/scan", eventTicketController.scanTicket);

// Gate Scan Audit History for an event
router.get("/history/:eventId", eventTicketController.getScanAuditTrail);

module.exports = router;
