const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title must be 120 characters or less"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message must be 1000 characters or less"],
    },
    category: {
      type: String,
      enum: ["general", "date", "important"],
      default: "general",
    },
    // Optional date shown on the card (YYYY-MM-DD)
    date: {
      type: String,
      trim: true,
      default: "",
      match: [/^(\d{4}-\d{2}-\d{2})?$/, "Date must be in YYYY-MM-DD format"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
