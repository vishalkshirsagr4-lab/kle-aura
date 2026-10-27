const express = require("express");
const mongoose = require("mongoose");
const Announcement = require("../models/Announcement");
const requireAdmin = require("../middleware/auth");
const memoryStore = require("../db/memoryStore");

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

const pick = (body = {}) => ({
  title: body.title,
  message: body.message,
  category: body.category || "general",
  date: body.date,
});

function handleError(res, error) {
  console.error("Announcement error:", error);
  if (error.name === "ValidationError") {
    const first = Object.values(error.errors)[0];
    return res.status(400).json({ success: false, message: first.message });
  }
  return res
    .status(500)
    .json({ success: false, message: "Server error. Please try again." });
}

// GET /api/announcements  (public — shown in the student portal)
router.get("/", async (req, res) => {
  try {
    if (isDbConnected()) {
      return res.json(await Announcement.find().sort({ createdAt: -1 }));
    }
  } catch (error) {
    console.warn("Announcement DB query error, using in-memory store:", error.message);
  }
  res.json(memoryStore.getAnnouncements());
});

// POST /api/announcements  (admin)
router.post("/", requireAdmin, async (req, res) => {
  const payload = pick(req.body);
  if (!payload.title || !payload.message) {
    return res.status(400).json({ success: false, message: "Title and message are required." });
  }

  try {
    if (isDbConnected()) {
      const created = await Announcement.create(payload);
      return res.status(201).json(created);
    }
  } catch (error) {
    console.warn("Announcement DB create error, using in-memory store:", error.message);
  }

  const newAnn = {
    _id: memoryStore.genId(),
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const list = [newAnn, ...memoryStore.getAnnouncements()];
  memoryStore.setAnnouncements(list);
  res.status(201).json(newAnn);
});

// PUT /api/announcements/:id  (admin)
router.put("/:id", requireAdmin, async (req, res) => {
  const payload = pick(req.body);
  try {
    if (isDbConnected() && mongoose.isValidObjectId(req.params.id)) {
      const updated = await Announcement.findByIdAndUpdate(
        req.params.id,
        payload,
        { new: true, runValidators: true }
      );
      if (updated) return res.json(updated);
    }
  } catch (error) {
    console.warn("Announcement DB update error, using in-memory store:", error.message);
  }

  const list = memoryStore.getAnnouncements();
  const idx = list.findIndex((a) => a._id === req.params.id);
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Announcement not found." });
  }
  list[idx] = { ...list[idx], ...payload, updatedAt: new Date().toISOString() };
  memoryStore.setAnnouncements(list);
  res.json(list[idx]);
});

// DELETE /api/announcements/:id  (admin)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    if (isDbConnected() && mongoose.isValidObjectId(req.params.id)) {
      const removed = await Announcement.findByIdAndDelete(req.params.id);
      if (removed) return res.json({ success: true });
    }
  } catch (error) {
    console.warn("Announcement DB delete error, using in-memory store:", error.message);
  }

  const list = memoryStore.getAnnouncements();
  const filtered = list.filter((a) => a._id !== req.params.id);
  memoryStore.setAnnouncements(filtered);
  res.json({ success: true });
});

module.exports = router;
