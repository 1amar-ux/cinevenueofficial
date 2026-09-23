const express = require("express");
const router = express.Router();
const theatreController = require("../controllers/theatre.controller");

// 1. GET /api/v1/theatres
router.get("/", theatreController.getTheatres);

// 2. GET /api/v1/theatres/:theatreId
router.get("/:theatreId", theatreController.getTheatre);

module.exports = router;
