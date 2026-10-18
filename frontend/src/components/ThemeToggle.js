import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "aura-theme-v2";
const read = () => {
  try {
    return localStorage.getItem(KEY) || "light";
  } catch (e) {
    return "light";
  }
};

// Light mode is the default; the choice is remembered on this device.
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
      className="fixed right-4 top-[calc(4.5rem+env(safe-area-inset-top,0px))] z-[1000] grid size-11 place-items-center rounded-xl border border-border bg-surface text-lg text-foreground shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun /> : <Moon />}
    </button>
  );
}

export default ThemeToggle;
