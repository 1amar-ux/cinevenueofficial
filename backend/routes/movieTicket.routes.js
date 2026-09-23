const express = require("express");
const router = express.Router();
const movieTicketController = require("../controllers/movieTicket.controller");
const movieVerificationController = require("../controllers/movieVerification.controller");

// 1. GET /api/v1/movie-tickets/:ticketId
router.get("/:ticketId", movieTicketController.getMovieTicket);

// 2. GET /api/v1/movie-tickets/:ticketId/download
router.get("/:ticketId/download", movieTicketController.downloadMovieTicket);

// 3. POST /api/v1/movie-tickets/:ticketId/resend
router.post("/:ticketId/resend", movieTicketController.resendMovieTicket);

// 4. POST /api/v1/movie-tickets/verify
router.post("/verify", movieVerificationController.verifyMovieTicket);

// 5. POST /api/v1/movie-tickets/check-in
router.post("/check-in", movieVerificationController.checkInMovieTicket);

module.exports = router;
