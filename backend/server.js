require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const registrationRoutes = require("./routes/registrations");
const authRoutes = require("./routes/auth");
const announcementRoutes = require("./routes/announcements");
const settingsRoutes = require("./routes/settings");

// Admin login needs these — fail early with a clear message
["ADMIN_USERNAME", "ADMIN_PASSWORD", "JWT_SECRET"].forEach((name) => {
  if (!process.env[name]) {
    console.error(`❌ Missing ${name} in backend/.env`);
    process.exit(1);
  }
});

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "AI-AURA API is running 🚀" });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai-aura";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
