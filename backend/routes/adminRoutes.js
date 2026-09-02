const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const { dashboard, users, deleteUser } = require("../controllers/adminController");

// Dashboard
router.get("/dashboard", auth, admin, dashboard);

// Users
router.get("/users", auth, admin, users);

// Delete User
router.delete("/users/:id", auth, admin, deleteUser);

module.exports = router;
