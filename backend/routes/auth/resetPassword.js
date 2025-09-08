const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../../controllers/user.controller.js");
const { JWT_SECRET } = require("../../config/jwt.config.js");

router.post("/", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      error: true,
      message: "Token and password are required",
    });
  }

  // Verify and decode JWT
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(400).json({ error: true, message: "Invalid or expired token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(400).json({ error: true, message: "Reset link has expired, request a new one." });
  }
    const { email } = decoded;
  // Basic password validation  
  if (password.length < 8) {
    return res.status(400).json({
      error: true,
      message: "Password must be at least 8 characters long",
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update user password
  const userResponse = await users.update(email, { password: hashedPassword });
  if (userResponse.error) {
    return res.status(500).json(userResponse);
  }

  return res.json({ error: false, message: "Password reset successfully" });
});

module.exports = router;
