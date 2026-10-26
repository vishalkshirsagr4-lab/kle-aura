import { useEffect } from "react";

// Any element with className "tilt" leans toward the pointer in 3D
export default function useTilt() {
  useEffect(() => {
    const move = (e) => {
      if (e.pointerType === "touch" || !e.target.closest) return;
      const el = e.target.closest(".tilt");
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--rx", `${-py * 14}deg`);
      el.style.setProperty("--ry", `${px * 16}deg`);
      el.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
      el.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
    };
    const leave = (e) => {
      if (e.target.classList && e.target.classList.contains("tilt")) {
        e.target.style.setProperty("--rx", "0deg");
        e.target.style.setProperty("--ry", "0deg");
      }
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave, true);
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave, true);
    };
  }, []);
}
