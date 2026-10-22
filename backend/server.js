const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");

// The repo-root .env is the single source of truth for every variable.
// backend/.env is still honoured as a fallback so the API can be run on its own.
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, ".env") });

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // Sandbox environment may restrict DNS overrides
}

const registrationRoutes = require("./routes/registrations");
const authRoutes = require("./routes/auth");
const announcementRoutes = require("./routes/announcements");
const settingsRoutes = require("./routes/settings");

// Dev-only fallbacks. Always set real values in the repo-root .env.
process.env.ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
process.env.JWT_SECRET = process.env.JWT_SECRET || "ai-aura-dev-secret-key-2026";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "AI-AURA API is running 🚀" });
});

// Database connection with fallback
mongoose.set("bufferCommands", false);
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) =>
      console.warn("⚠️ MongoDB connection failed, in-memory store active:", err.message)
    );
} else {
  console.log("ℹ️ No MONGO_URI provided, in-memory store active");
}

// Database offline error middleware
app.use((err, req, res, next) => {
  if (
    err.name === "MongooseError" ||
    err.name === "MongoNetworkError" ||
    (err.message && err.message.includes("buffering timed out"))
  ) {
    console.warn("[AI Studio] Database offline — fallback handling");
    if (req.method === "GET") {
      return res.json(req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {});
    }
    return res
      .status(503)
      .json({ error: "Service temporarily unavailable (database offline)" });
  }
  next(err);
});

// Port used when the API runs on its own (`npm run dev:api`).
// The unified server (`npm run dev`) mounts this app on the root PORT instead.
const PORT = Number(process.env.API_PORT || 5000);
if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 API server running on http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;
