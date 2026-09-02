const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createPayment,
  verifyPayment,
} = require("../controllers/paymentController");

router.post("/create", auth, createPayment);
router.post("/verify", auth, verifyPayment);

module.exports = router;
