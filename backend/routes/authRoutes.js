const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");
const auth = require("../middleware/auth");

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Current Logged-in User
router.get("/me", auth, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id).select("-password");

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
