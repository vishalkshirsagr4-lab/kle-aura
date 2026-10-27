const express = require("express");
const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const requireAdmin = require("../middleware/auth");
const memoryStore = require("../db/memoryStore");

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// POST /api/registrations  (public — students register)
router.post("/", async (req, res) => {
  try {
    const { fullname, email, college, phone, event, pucRoll, teamName } =
      req.body || {};

    const required = { fullname, email, college, phone, event, pucRoll };
    const allPresent = Object.values(required).every(
      (v) => typeof v === "string" && v.trim() !== ""
    );
    if (!allPresent) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits.",
      });
    }

    if (isDbConnected()) {
      const registration = new Registration({
        ...required,
        teamName: typeof teamName === "string" ? teamName : "",
      });
      const saved = await registration.save();
      return res.status(201).json({
        success: true,
        message: "Registration successful!",
        data: saved,
      });
    }

    const newReg = {
      _id: memoryStore.genId(),
      ...required,
      teamName: typeof teamName === "string" ? teamName : "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = [newReg, ...memoryStore.getRegistrations()];
    memoryStore.setRegistrations(list);

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      data: newReg,
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.name === "ValidationError") {
      const first = Object.values(error.errors)[0];
      return res.status(400).json({ success: false, message: first.message });
    }
    return res.status(500).json({
      success: false,
      message: "Server error while saving registration.",
    });
  }
});

// GET /api/registrations/recent  (public) — only first name, college and event.
// No email, phone or roll number is ever returned here.
router.get("/recent", async (req, res) => {
  try {
    if (isDbConnected()) {
      const rows = await Registration.find({}, "fullname college event createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      return res.json(
        rows.map((r) => ({
          firstName: String(r.fullname || "").trim().split(/\s+/)[0],
          college: r.college,
          event: r.event,
          createdAt: r.createdAt,
        }))
      );
    }
  } catch (error) {
    console.warn("Recent registrations DB query error, using in-memory store:", error.message);
  }

  const rows = memoryStore.getRegistrations().slice(0, 10);
  res.json(
    rows.map((r) => ({
      firstName: String(r.fullname || "").trim().split(/\s+/)[0],
      college: r.college,
      event: r.event,
      createdAt: r.createdAt,
    }))
  );
});

// GET /api/registrations  (admin only — contains student personal data)
router.get("/", requireAdmin, async (req, res) => {
  try {
    if (isDbConnected()) {
      const registrations = await Registration.find().sort({ createdAt: -1 });
      return res.json(registrations);
    }
  } catch (error) {
    console.warn("Registrations DB query error, using in-memory store:", error.message);
  }
  res.json(memoryStore.getRegistrations());
});

// DELETE /api/registrations/:id  (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    if (isDbConnected() && mongoose.isValidObjectId(req.params.id)) {
      const removed = await Registration.findByIdAndDelete(req.params.id);
      if (removed) {
        return res.json({ success: true, message: "Registration deleted." });
      }
    }
  } catch (error) {
    console.warn("Registrations DB delete error, using in-memory store:", error.message);
  }

  const list = memoryStore.getRegistrations();
  const exists = list.some((r) => r._id === req.params.id);
  if (!exists && !isDbConnected()) {
    return res.status(404).json({ success: false, message: "Registration not found." });
  }
  memoryStore.setRegistrations(list.filter((r) => r._id !== req.params.id));
  res.json({ success: true, message: "Registration deleted." });
});

module.exports = router;
