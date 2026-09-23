const express = require("express");
const router = express.Router();
const verificationController = require("../controllers/ticketVerification.controller");

// 1. POST /api/v1/ticket-verification/verify (Validate without consuming)
router.post("/verify", verificationController.verifyTicket);

// 2. POST /api/v1/ticket-verification/check-in (Atomic check-in: VALID -> USED)
router.post("/check-in", verificationController.checkInTicket);
router.post("/scan", verificationController.checkInTicket); // alias

module.exports = router;
