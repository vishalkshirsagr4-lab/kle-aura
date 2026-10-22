import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
// @ts-ignore
import backendApp from "./backend/server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = backendApp;
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.path.startsWith("/api/")) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      configFile: path.resolve(__dirname, "vite.config.js"),
      server: { middlewareMode: true },
      appType: "spa",
      root: path.resolve(__dirname, "frontend"),
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 AI-AURA server running on http://0.0.0.0:${PORT} (${isProduction ? "production" : "development"})`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
