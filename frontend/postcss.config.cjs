const path = require("path");

// Explicit absolute config path so Tailwind works no matter which directory
// the Vite process was launched from (repo root via server.ts, or frontend/).
module.exports = {
  plugins: [
    require("tailwindcss")({ config: path.join(__dirname, "tailwind.config.cjs") }),
    require("autoprefixer"),
  ],
};
