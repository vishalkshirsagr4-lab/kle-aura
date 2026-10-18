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
      className="my-4 mb-10 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4"
      ref={ref}
    >
      {STATS.map(({ Icon, to, label }, index) => {
        const tones = [
          "from-obsidian to-primary",
          "from-red-600 to-cyan",
          "from-amber-500 to-amber-600",
          "from-teal-700 to-cyan",
        ];
        return (
          <div
            key={label}
            className={`relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-xl shadow-black/20 ${tones[index]}`}
          >
            <Icon className="text-2xl opacity-90" />
            <b className="text-4xl font-extrabold leading-none">
              <Count to={to} run={run} />
            </b>
            <span className="text-center text-sm font-semibold opacity-90">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default StatsBand;
