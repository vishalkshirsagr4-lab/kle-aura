import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "frontend"),
  publicDir: path.resolve(__dirname, "frontend/public"),
  plugins: [
    react({
      include: /\.(jsx|js|tsx|ts)$/,
    }),
  ],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  define: {
    "process.env.REACT_APP_API_URL": JSON.stringify(
      process.env.REACT_APP_API_URL || ""
    ),
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});
