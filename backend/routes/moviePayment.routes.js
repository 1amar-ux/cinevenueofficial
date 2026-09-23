const express = require("express");
const router = express.Router();
const moviePaymentController = require("../controllers/moviePayment.controller");

// 1. POST /api/v1/movie-payments/create-order
router.post("/create-order", moviePaymentController.createMoviePaymentOrder);

// 2. POST /api/v1/movie-payments/verify
router.post("/verify", moviePaymentController.verifyMoviePayment);

module.exports = router;
