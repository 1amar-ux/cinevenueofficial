const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  addMovie,
  getMovies,
  getMovie,
  updateMovie,
  deleteMovie,
  searchMovies,
} = require("../controllers/movieController");

// Public Routes
router.get("/", getMovies);
router.get("/search", searchMovies);
router.get("/:id", getMovie);

// Protected Routes
router.post("/", auth, upload.single("poster"), addMovie);
router.put("/:id", auth, updateMovie);
router.delete("/:id", auth, deleteMovie);

module.exports = router;
