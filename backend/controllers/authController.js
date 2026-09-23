const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "cinevenue_default_jwt_secret_token_2026";

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const query = [{ email: email.toLowerCase().trim() }];
    if (mobile) query.push({ mobile: mobile.trim() });

    const exists = await User.findOne({ $or: query });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "An account with this email or mobile number already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name ? name.trim() : "Movie Buff",
      email: email.toLowerCase().trim(),
      mobile: mobile ? mobile.trim() : undefined,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Sanitize user object to avoid returning password hash
    const userSafe = user.toObject();
    delete userSafe.password;

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      token,
      user: userSafe,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Login (supports email or 10-digit mobile number)
exports.login = async (req, res) => {
  try {
    const { email, identifier, password } = req.body;
    const loginId = (identifier || email || "").trim();

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Mobile and password are required",
      });
    }

    const user = await User.findOne({
      $or: [
        { email: loginId.toLowerCase() },
        { mobile: loginId },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const userSafe = user.toObject();
    delete userSafe.password;

    res.json({
      success: true,
      token,
      user: userSafe,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
