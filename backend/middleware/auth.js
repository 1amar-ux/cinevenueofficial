const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access Denied",
    });
  }

  try {
    const secret = process.env.JWT_SECRET || "cinevenue_default_jwt_secret_token_2026";
    const decoded = jwt.verify(
      token.replace("Bearer ", "").trim(),
      secret
    );
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};
