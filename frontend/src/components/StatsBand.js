import { useEffect, useRef, useState } from "react";
import {
  Star as FaStar,
  Layers as FaLayerGroup,
  Trophy as FaTrophy,
  Calendar as FaCalendarDay,
} from "lucide-react";

function Count({ to, run }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return undefined;
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 1400);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  return <>{n}</>;
}

const STATS = [
  { Icon: FaStar, to: 18, label: "Events to compete in" },
  { Icon: FaLayerGroup, to: 5, label: "Talent categories" },
  { Icon: FaTrophy, to: 4, label: "Prize categories" },
  { Icon: FaCalendarDay, to: 1, label: "Day to shine" },
];

function StatsBand() {
  const ref = useRef(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return setRun(true);
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setRun(true), io.disconnect()),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      className="my-6 mb-12 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
      ref={ref}
    >
      {STATS.map(({ Icon, to, label }, index) => {
        const tones = [
          "bg-indigo-50 text-indigo-700",
          "bg-violet-50 text-violet-700",
          "bg-amber-50 text-amber-700",
          "bg-cyan-50 text-cyan-800",
        ];
        return (
          <div
            key={label}
            className="flex min-h-32 flex-col items-start justify-center gap-1 rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
          >
            <span className={`mb-2 grid size-9 place-items-center rounded-xl ${tones[index]}`}>
              <Icon className="text-lg" />
            </span>
            <b className="text-3xl font-bold leading-none tracking-tight text-foreground">
              <Count to={to} run={run} />
            </b>
            <span className="text-left text-xs font-medium leading-snug text-muted sm:text-sm">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default StatsBand;
