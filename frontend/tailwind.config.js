module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        accent: "#7c3aed",
        cyan: "#0891b2",
        navy: "#172554",
        obsidian: "#101828",
        bg: "var(--bg)",
        surface: "var(--surface)",
        border: "var(--border)",
        field: "var(--field)",
        foreground: "var(--text)",
        muted: "var(--muted)",
        paper: "#f2efe6",
        "paper-line": "rgba(120, 140, 125, 0.28)",
        ink: "#1d1d1b",
      },
      fontFamily: {
        sans: ["Inter", "Geist", "system-ui", "Segoe UI", "sans-serif"],
        hand: ["Caveat", "Comic Sans MS", "cursive"],
      },
      keyframes: {
        marquee: { to: { transform: "translateX(-50%)" } },
        liveIn: {
          from: { opacity: "0", transform: "translateX(-30px) scale(.95)" },
        },
        liveOut: {
          to: { opacity: "0", transform: "translateX(-30px) scale(.95)" },
        },
        pulseHit: {
          "50%": {
            boxShadow:
              "0 0 0 3px #fff, 0 0 0 9px rgba(6,182,212,.55), 0 22px 44px rgba(6,182,212,.45)",
          },
        },
        posterBar: { to: { transform: "scaleX(0)" } },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        "live-in": "liveIn .5s cubic-bezier(.2,.9,.3,1.1)",
        "live-out": "liveOut .4s ease forwards",
        "pulse-hit": "pulseHit 1.6s ease-in-out infinite",
        "poster-bar": "posterBar 12s linear forwards",
      },
    },
  },
  plugins: [],
};
