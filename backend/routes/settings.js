const express = require("express");
const mongoose = require("mongoose");
const Setting = require("../models/Setting");
const requireAdmin = require("../middleware/auth");
const memoryStore = require("../db/memoryStore");

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

const REQUIRED = ["eventDate", "startTime", "endTime", "venue"];
const SOCIAL = ["instagram", "youtube", "facebook", "linkedin", "website"];
const DEPARTMENT_SOCIALS = ["bcaSocials", "bbaSocials"];
const SOCIAL_PLATFORMS = [
  "Instagram",
  "Facebook",
  "YouTube",
  "LinkedIn",
  "X",
  "Website",
  "WhatsApp",
  "Telegram",
  "Threads",
  "TikTok",
];

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// What the public can read: only fields that have a value
const publicView = (doc = {}) =>
  [...REQUIRED, ...SOCIAL, ...DEPARTMENT_SOCIALS].reduce((out, f) => {
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
  DEPARTMENT_SOCIALS.forEach((field) => {
    if (Array.isArray(body[field])) {
      out[field] = body[field]
        .filter((link) => link.platform || link.url)
        .map((link) => ({
          platform: link.platform.trim(),
          url: link.url.trim(),
        }));
    }
  });
  return out;
};

const validateDepartmentSocials = (body = {}) => {
  for (const field of DEPARTMENT_SOCIALS) {
    if (body[field] === undefined) continue;
    if (!Array.isArray(body[field])) {
      return `${field} must be a list of social links.`;
    }
    for (const link of body[field]) {
      if (!link || typeof link.platform !== "string" || typeof link.url !== "string") {
        return `Each ${field} entry must include a platform and URL.`;
      }
      if (!link.platform.trim() && !link.url.trim()) continue;
      if (!SOCIAL_PLATFORMS.includes(link.platform.trim())) {
        return `Choose a supported platform for ${field}.`;
      }
      if (!isHttpUrl(link.url.trim())) {
        return `Enter a valid http:// or https:// URL for ${link.platform}.`;
      }
    }
  }
  return null;
};

// GET /api/settings  (public — the student portal reads these)
router.get("/", async (req, res) => {
  try {
    if (isDbConnected()) {
      const doc = await Setting.findOne({ key: "main" }).lean();
      if (doc) return res.json(publicView(doc));
    }
  } catch (error) {
    console.warn("Settings DB query error, using in-memory store:", error.message);
  }
  res.json(publicView(memoryStore.getSettings()));
});

// PUT /api/settings  (admin)
router.put("/", requireAdmin, async (req, res) => {
  try {
    const socialError = validateDepartmentSocials(req.body);
    if (socialError) {
      return res.status(400).json({ success: false, message: socialError });
    }

    if (isDbConnected()) {
      try {
        const doc = await Setting.findOneAndUpdate(
          { key: "main" },
          { $set: writable(req.body) },
          { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        ).lean();
        return res.json(publicView(doc));
      } catch (dbErr) {
        console.warn("Settings DB update error, using in-memory store:", dbErr.message);
      }
    }

    const current = memoryStore.getSettings();
    const updated = {
      ...current,
      ...writable(req.body),
    };
    memoryStore.setSettings(updated);
    res.json(publicView(updated));
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
