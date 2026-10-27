require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // Sandbox environment may restrict DNS overrides
}

const registrationRoutes = require("./routes/registrations");
const authRoutes = require("./routes/auth");
const announcementRoutes = require("./routes/announcements");
const settingsRoutes = require("./routes/settings");

// Default credentials if not supplied via env
process.env.ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
process.env.JWT_SECRET = process.env.JWT_SECRET || "ai-aura-dev-secret-key-2026";

const app = express();

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  // Vercel production and preview domains
  if (/^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i.test(origin)) return true;
  // Google AI Studio preview and development environments
  if (/^https:\/\/([a-z0-9-]+\.)*run\.app$/i.test(origin)) return true;
  // Render backend & frontend domains
  if (/^https:\/\/([a-z0-9-]+\.)*onrender\.com$/i.test(origin)) return true;
  // Local development on any port
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true;
  // Custom configured frontend origins
  if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return true;
  if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return true;
  return false;
};

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    // Allow non-production environments to operate smoothly
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    // Silently deny unpermitted origins without throwing 500 error
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
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
  const maskedUri = MONGO_URI.replace(/:([^:@]+)@/, ":****@");
  mongoose
    .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log(`✅ Connected to MongoDB (${maskedUri})`))
    .catch((err) =>
      console.warn(`⚠️ MongoDB connection failed (${maskedUri}):`, err.message)
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

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
