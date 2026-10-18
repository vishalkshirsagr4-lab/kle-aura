import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { api } from "../api";

const SHOW_MS = 6000; // each pop-up stays this long
const GAP_MS = 4000; // pause before the next one
const REFRESH_MS = 60000;

const ago = (iso) => {
  const m = Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 60000),
  );
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
};

// Rotating pop-ups built ONLY from real registrations (first name + college + event).
// With no registrations (or no server) nothing is shown.
function LiveRegistrations() {
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(-1);
  const [out, setOut] = useState(false);
  const [closed, setClosed] = useState(false);
  const itemsRef = useRef([]);

  const load = () =>
    api("/api/registrations/recent")
      .then((d) => {
        if (Array.isArray(d)) {
          setItems(d);
          itemsRef.current = d;
        }
      })
      .catch(() => {});

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    const onNew = () => load();
    window.addEventListener("aura:registered", onNew);
    return () => {
      clearInterval(id);
      window.removeEventListener("aura:registered", onNew);
    };
  }, []);

  useEffect(() => {
    if (closed || items.length === 0) return undefined;
    let t1, t2, t3;
    const cycle = (i) => {
      setOut(false);
      setIdx(i);
      t1 = setTimeout(() => setOut(true), SHOW_MS);
      t2 = setTimeout(() => setIdx(-1), SHOW_MS + 400);
      t3 = setTimeout(
        () => cycle((i + 1) % Math.max(1, itemsRef.current.length)),
        SHOW_MS + GAP_MS,
      );
    };
    t3 = setTimeout(() => cycle(0), 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [items.length, closed]);

  const cur = items[idx];
  if (closed || !cur) return null;
  return (
    <div
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-4 z-[950] max-w-[min(360px,calc(100vw-6rem))]"
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-3 rounded-2xl border border-border bg-surface/95 p-3 pr-4 text-foreground shadow-2xl shadow-black/40 backdrop-blur ${out ? "animate-live-out" : "animate-live-in"}`}
      >
        <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-extrabold text-white after:absolute after:-right-px after:-bottom-px after:size-3 after:animate-ping after:rounded-full after:border-2 after:border-slate-900 after:bg-emerald-600">
          {(cur.firstName || "?").charAt(0).toUpperCase()}
        </span>
        <span className="text-sm leading-snug">
          <b>{cur.firstName}</b> from {cur.college} registered for{" "}
          <b>{cur.event}</b>
          <small className="mt-1 block text-xs text-muted">
            {ago(cur.createdAt)}
          </small>
        </span>
        <button
          type="button"
          className="grid shrink-0 place-items-center rounded-full p-1.5 text-muted hover:bg-black/10 hover:text-foreground"
          aria-label="Hide registration pop-ups"
          onClick={() => setClosed(true)}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default LiveRegistrations;
