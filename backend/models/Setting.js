const mongoose = require("mongoose");

const URL_RE = /^(https?:\/\/\S+)?$/;

// Single document (key = "main") holding the event info shown to students
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    eventDate: {
      type: String,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Event date must be YYYY-MM-DD"],
    },
    startTime: {
      type: String,
      match: [/^\d{2}:\d{2}$/, "Start time must be HH:MM"],
    },
    endTime: {
      type: String,
      match: [/^\d{2}:\d{2}$/, "End time must be HH:MM"],
    },
    venue: { type: String, trim: true, maxlength: [120, "Venue is too long"] },
    // College social media links (optional, https only)
    instagram: { type: String, trim: true, match: [URL_RE, "Instagram link must start with http:// or https://"] },
    youtube: { type: String, trim: true, match: [URL_RE, "YouTube link must start with http:// or https://"] },
    facebook: { type: String, trim: true, match: [URL_RE, "Facebook link must start with http:// or https://"] },
    linkedin: { type: String, trim: true, match: [URL_RE, "LinkedIn link must start with http:// or https://"] },
    website: { type: String, trim: true, match: [URL_RE, "Website link must start with http:// or https://"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
