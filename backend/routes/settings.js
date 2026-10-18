const express = require("express");
const Setting = require("../models/Setting");
const requireAdmin = require("../middleware/auth");

const router = express.Router();

const REQUIRED = ["eventDate", "startTime", "endTime", "venue"];
const SOCIAL = ["instagram", "youtube", "facebook", "linkedin", "website"];

// What the public can read: only fields that have a value
const publicView = (doc = {}) =>
  [...REQUIRED, ...SOCIAL].reduce((out, f) => {
    if (doc[f]) out[f] = doc[f];
    return out;
  }, {});

// What the admin can write: event fields must be non-empty,
// social links may be cleared by sending an empty string
const writable = (body = {}) => {
  const out = {};
  REQUIRED.forEach((f) => {
    if (typeof body[f] === "string" && body[f].trim()) out[f] = body[f].trim();
  });
  SOCIAL.forEach((f) => {
    if (typeof body[f] === "string") out[f] = body[f].trim();
  });
  return out;
};

// GET /api/settings  (public — the student portal reads these)
router.get("/", async (req, res) => {
  try {
    const doc = await Setting.findOne({ key: "main" }).lean();
    res.json(publicView(doc || {}));
  } catch (error) {
    console.error("Settings error:", error);
    res.status(500).json({ success: false, message: "Could not load settings." });
  }
});

// PUT /api/settings  (admin)
router.put("/", requireAdmin, async (req, res) => {
  try {
    const doc = await Setting.findOneAndUpdate(
      { key: "main" },
      { $set: writable(req.body) },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    res.json(publicView(doc));
  } catch (error) {
    console.error("Settings error:", error);
    if (error.name === "ValidationError") {
      const first = Object.values(error.errors)[0];
      return res.status(400).json({ success: false, message: first.message });
    }
    res.status(500).json({ success: false, message: "Could not save settings." });
  }
});

module.exports = router;
