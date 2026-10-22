import express from "express";
import mongoose from "mongoose";
import Announcement from "../models/Announcement.js";
import requireAdmin from "../middleware/auth.js";

const router = express.Router();

const pick = (body = {}) => ({
  title: body.title,
  message: body.message,
  category: body.category,
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
    res.json(await Announcement.find().sort({ createdAt: -1 }));
  } catch (error) {
    handleError(res, error);
  }
});

// POST /api/announcements  (admin)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const created = await Announcement.create(pick(req.body));
    res.status(201).json(created);
  } catch (error) {
    handleError(res, error);
  }
});

// PUT /api/announcements/:id  (admin)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid id." });
    }
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      pick(req.body),
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found." });
    }
    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
});

// DELETE /api/announcements/:id  (admin)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid id." });
    }
    const removed = await Announcement.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found." });
    }
    res.json({ success: true });
  } catch (error) {
    handleError(res, error);
  }
});

export default router;
