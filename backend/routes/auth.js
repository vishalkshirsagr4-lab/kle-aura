const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Compare secrets without leaking timing information
const digest = (v) => crypto.createHash("sha256").update(String(v)).digest();
const safeEqual = (a, b) => crypto.timingSafeEqual(digest(a), digest(b));

// Simple in-memory brute-force protection (per IP)
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function recentAttempts(ip) {
  const now = Date.now();
  const list = (attempts.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  attempts.set(ip, list);
  return list;
}

// POST /api/auth/login
router.post("/login", (req, res) => {
  const ip = req.ip;

  if (recentAttempts(ip).length >= MAX_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: "Too many failed attempts. Try again in 15 minutes.",
    });
  }

  const { username, password } = req.body || {};
  const userOk =
    typeof username === "string" &&
    safeEqual(username.trim().toLowerCase(), process.env.ADMIN_USERNAME.trim().toLowerCase());
  const passOk =
    typeof password === "string" && safeEqual(password, process.env.ADMIN_PASSWORD);

  if (!userOk || !passOk) {
    recentAttempts(ip).push(Date.now());
    return res
      .status(401)
      .json({ success: false, message: "Invalid username or password." });
  }

  attempts.delete(ip);
  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
  res.json({ success: true, token });
});

module.exports = router;
