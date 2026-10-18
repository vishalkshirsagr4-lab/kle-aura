const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    college: {
      type: String,
      required: [true, "College is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    event: {
      type: String,
      required: [true, "Event is required"],
      trim: true,
    },
    pucRoll: {
      type: String,
      required: [true, "PUC roll number is required"],
      trim: true,
    },
    // Optional: students registering for the same event with the same
    // team name are counted as one team. Blank = solo participant.
    teamName: {
      type: String,
      trim: true,
      default: "",
      maxlength: [60, "Team name must be 60 characters or less"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Registration", registrationSchema);
