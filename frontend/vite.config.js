import { defineConfig, loadEnv, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Frontend build config. `npm run build` runs from this folder, so paths are
// resolved relative to this file (never to the process CWD).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");

  return {
    root: __dirname,
    publicDir: path.resolve(__dirname, "public"),
    plugins: [
      {
        name: "treat-js-files-as-jsx",
        async transform(code, id) {
          if (
            !id.includes("node_modules") &&
            (id.endsWith(".js") || id.endsWith(".jsx")) &&
            id.includes("/src/")
          ) {
            return transformWithEsbuild(code, id, {
              loader: "jsx",
              jsx: "automatic",
            });
          }
          return null;
        },
      },
      react(),
    ],
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          ".js": "jsx",
        },
      },
    },
    define: {
      // Public value: only the backend origin, never credentials.
      "process.env.REACT_APP_API_URL": JSON.stringify(
        env.REACT_APP_API_URL || ""
      ),
    },
    build: {
      // The Express server serves this folder in production.
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
    },
    server: {
      host: "0.0.0.0",
      port: 3000,
      // Used only when the API runs on its own (`npm run dev:api`).
      proxy: {
        "/api": {
          target: env.VITE_PROXY_TARGET || "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: "0.0.0.0",
      port: 3000,
    },
  };
});
