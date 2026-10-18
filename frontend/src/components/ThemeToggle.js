import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "aura-theme";
const read = () => {
  try {
    return localStorage.getItem(KEY) || "dark";
  } catch (e) {
    return "dark";
  }
};

// Dark (obsidian) by default; the choice is remembered on this device
function ThemeToggle() {
  const [theme, setTheme] = useState(read);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {
      /* storage unavailable */
    }
  }, [theme]);

  const dark = theme === "dark";
  return (
    <button
      type="button"
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-[1000] grid size-12 place-items-center rounded-full border border-border bg-surface text-2xl text-foreground shadow-xl transition hover:rotate-12 hover:scale-110"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun /> : <Moon />}
    </button>
  );
}

export default ThemeToggle;
