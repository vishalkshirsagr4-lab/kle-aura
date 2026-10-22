import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
// @ts-ignore - backend/server.js is CommonJS and has no type declarations
import backendApp from "./backend/server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Repo-root .env holds every runtime variable (PORT, MONGO_URI, admin login...).
dotenv.config({ path: path.resolve(__dirname, ".env") });

const FRONTEND_DIR = path.resolve(__dirname, "frontend");
const DIST_DIR = path.resolve(__dirname, "dist");

async function startServer() {
  // The API routes are already mounted on this app by backend/server.js.
  const app = backendApp;
  const PORT = Number(process.env.PORT || 3000);
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    app.use(express.static(DIST_DIR));
    app.get("*", (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.path.startsWith("/api/")) return next();
      res.sendFile(path.join(DIST_DIR, "index.html"), (err) => {
        if (err && !res.headersSent) {
          res.status(404).send("Frontend bundle missing. Run `npm run build` first.");
        }
      });
    });
  } else {
    const vite = await createViteServer({
      configFile: path.resolve(FRONTEND_DIR, "vite.config.js"),
      server: { middlewareMode: true },
      appType: "spa",
      root: FRONTEND_DIR,
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `🚀 AI-AURA server running on http://0.0.0.0:${PORT} (${
        isProduction ? "production" : "development"
      })`
    );
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
