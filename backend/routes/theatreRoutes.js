const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  addTheatre,
  getTheatres,
  getTheatresByCity,
  deleteTheatre,
} = require("../controllers/theatreController");

// Public Routes
router.get("/", getTheatres);
router.get("/city/:city", getTheatresByCity);

// Theatre Owner
router.post("/", auth, addTheatre);
router.delete("/:id", auth, deleteTheatre);

module.exports = router;
