import { useState, useEffect, useRef, useCallback } from "react";
import {
  Trophy,
  Award,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  Utensils,
  Pause,
  Play,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
} from "lucide-react";

const ACHIEVEMENTS = [
  {
    id: 1,
    icon: Trophy,
    badge: "Grand Championship",
    title: "Rolling Trophy",
    metric: "1st of 50+ Colleges",
    desc: "Coveted rolling trophy for the PU college scoring the highest aggregate points across all 18 events.",
    tag: "Overall Winner",
    accent: "from-amber-400 to-yellow-500",
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  {
    id: 2,
    icon: Award,
    badge: "Runner-Up Honor",
    title: "Runner-Up Rolling Shield",
    metric: "2nd Best PU College",
    desc: "Prestigious rolling shield and medals awarded to the college securing 2nd highest points overall.",
    tag: "Championship Runner-Up",
    accent: "from-yellow-400 to-amber-600",
    glowColor: "rgba(251, 191, 36, 0.4)",
  },
  {
    id: 3,
    icon: Sparkles,
    badge: "18 Competitions",
    title: "18 Category Cups",
    metric: "36 Cups Total",
    desc: "Specially designed gold and crystal trophies awarded to 1st & 2nd place winners of every talent track.",
    tag: "Event Trophies",
    accent: "from-amber-300 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.45)",
  },
  {
    id: 4,
    icon: GraduationCap,
    badge: "Sponsored Entry",
    title: "Tech Certifications",
    metric: "100% Free Entry",
    desc: "Full scholarships and complimentary access to professional BCA & BBA software and management courses.",
    tag: "Career Boost",
    accent: "from-amber-400 to-indigo-500",
    glowColor: "rgba(129, 140, 248, 0.4)",
  },
  {
    id: 5,
    icon: ShieldCheck,
    badge: "Recognized State Honor",
    title: "Verified Certificates",
    metric: "All Participants",
    desc: "Official university-accredited participation certificates and finalist merit medals for all candidates.",
    tag: "Certificates & Medals",
    accent: "from-yellow-300 to-emerald-500",
    glowColor: "rgba(52, 211, 153, 0.4)",
  },
  {
    id: 6,
    icon: Utensils,
    badge: "College Hospitality",
    title: "Free Food & Travel",
    metric: "Zero Expense",
    desc: "Complimentary breakfast, nutritious lunch, event kit, and Mahalingpur bus station transport support.",
    tag: "VIP Hospitality",
    accent: "from-amber-400 to-rose-500",
    glowColor: "rgba(251, 113, 133, 0.4)",
  },
];

export default function TrophyOrbitShowcase({ onSelectEvent }) {
  const [angle, setAngle] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isTrophySpinning, setIsTrophySpinning] = useState(false);
  const [radius, setRadius] = useState({ rx: 380, rz: 220 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);
  const animFrameId = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const containerRef = useRef(null);

  // Responsive radius calculation
  useEffect(() => {
    const updateRadius = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // Mobile
        setRadius({ rx: 175, rz: 110 });
      } else if (width < 1024) {
        // Tablet
        setRadius({ rx: 270, rz: 165 });
      } else if (width < 1440) {
        // Standard Desktop
        setRadius({ rx: 370, rz: 210 });
      } else {
        // Large screen
        setRadius({ rx: 420, rz: 240 });
      }
    };

    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  // Smooth 60fps orbital physics loop
  useEffect(() => {
    const animate = (currentTime) => {
      const delta = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      if (!isPaused && !hoveredCard && !isDragging) {
        // Continuous smooth 360-degree rotation (full revolution in ~28 seconds)
        const speed = (2 * Math.PI) / 28;
        setAngle((prev) => (prev + speed * delta) % (2 * Math.PI));
      }

      animFrameId.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPaused, hoveredCard, isDragging]);

  // Touch and Mouse Drag to rotate orbit manually
  const onPointerDown = (e) => {
    setIsDragging(true);
    dragStartX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragStartAngle.current = angle;
  };

  const onPointerMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const dx = clientX - dragStartX.current;
      const deltaAngle = (dx / window.innerWidth) * (Math.PI * 1.5);
      setAngle((dragStartAngle.current + deltaAngle) % (2 * Math.PI));
    },
    [isDragging]
  );

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("touchmove", onPointerMove);
      window.addEventListener("touchend", onPointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, [isDragging, onPointerMove, onPointerUp]);

  // Manual step buttons
  const stepOrbit = (direction) => {
    const stepSize = (2 * Math.PI) / ACHIEVEMENTS.length;
    setAngle((prev) => prev + direction * stepSize);
  };

  const triggerTrophy360 = () => {
    setIsTrophySpinning(true);
    setTimeout(() => setIsTrophySpinning(false), 1200);
  };

  return (
    <section
      id="championship-showcase"
      ref={containerRef}
      className="relative my-10 sm:my-16 overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-[#06080e] via-[#0b1020] to-[#06080e] p-4 sm:p-8 lg:p-12 shadow-2xl shadow-amber-500/10 select-none"
    >
      {/* Background Starfield & Radial Golden Ambient Lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] sm:size-[850px] rounded-full bg-radial from-amber-500/15 via-yellow-500/5 to-transparent blur-3xl opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b08_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* ================= SECTION HEADER ================= */}
      <div className="relative z-20 text-center max-w-3xl mx-auto mb-6 sm:mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-500/15 px-3.5 py-1 text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 shadow-md backdrop-blur-md">
          <Trophy className="size-4 text-amber-400" />
          <span>The Grand Championship Arena</span>
          <Sparkles className="size-3.5 text-yellow-300" />
        </div>

        <h2 className="mt-3 text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          AI-AURA 2K26 <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Championship Trophy</span>
        </h2>

        <p className="mt-2 text-xs sm:text-base font-semibold text-amber-200/90 max-w-2xl mx-auto">
          KLE Society&apos;s BCA &amp; BBA College, Mahalingpur · State Level Tech &amp; Cultural Fest
        </p>

        <p className="mt-1 text-xs sm:text-sm text-slate-300">
          6 Prestigious Honors continuously orbiting the central AI Trophy. Hover to pause or drag to spin!
        </p>
      </div>

      {/* ================= 3D INTERACTIVE ORBIT ARENA ================= */}
      <div
        className="relative mx-auto flex h-[500px] xs:h-[540px] sm:h-[620px] md:h-[680px] lg:h-[720px] w-full items-center justify-center cursor-grab active:cursor-grabbing [perspective:1200px]"
        onPointerDown={onPointerDown}
      >
        {/* Orbital Platform Rings in Perspective */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [transform:rotateX(75deg)]">
          {/* Outer Orbit Track */}
          <div
            className="rounded-full border-2 border-dashed border-amber-400/25 shadow-[0_0_50px_rgba(245,158,11,0.15)] animate-[spin_60s_linear_infinite]"
            style={{
              width: `${radius.rx * 2}px`,
              height: `${radius.rz * 2}px`,
            }}
          />
          {/* Inner Pedestal Ring */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-400/40 bg-radial from-amber-500/25 via-amber-500/5 to-transparent"
            style={{
              width: `${radius.rx * 0.9}px`,
              height: `${radius.rz * 0.9}px`,
            }}
          />
        </div>

        {/* ================= CENTER PIECE: 3D FLOATING AI TROPHY ================= */}
        <div
          onClick={triggerTrophy360}
          className={`relative z-20 flex flex-col items-center justify-center cursor-pointer transition-transform duration-500 ${
            isTrophySpinning ? "spin-360-active" : ""
          }`}
          title="Click to spin the AI Trophy 360°"
        >
          {/* Floating Trophy Image with Ambient Glow */}
          <div className="relative animate-[float_4s_ease-in-out_infinite] flex items-center justify-center">
            {/* Golden Core Spotlight */}
            <div className="pointer-events-none absolute -inset-6 rounded-full bg-radial from-amber-400/40 via-yellow-400/15 to-transparent blur-2xl" />

            {/* The Transparent AI Trophy Image */}
            <img
              src="/images/trophy.png"
              alt="KLE BCA & BBA College AI Trophy"
              className="relative z-10 h-60 xs:h-64 sm:h-80 md:h-96 lg:h-[430px] w-auto max-w-full object-contain drop-shadow-[0_20px_45px_rgba(245,158,11,0.45)] transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Golden Trophy Pedestal Stamp */}
          <div className="relative z-20 -mt-3 sm:-mt-5 flex items-center gap-1.5 rounded-full border-2 border-amber-400/80 bg-slate-950/90 px-3 sm:px-4 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 shadow-xl backdrop-blur-md">
            <Sparkles className="size-3 text-amber-400" />
            <span>KLE Rolling Trophy 2K26</span>
            <RotateCw className="size-3 text-amber-400 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
        </div>

        {/* ================= 6 ORBITING ACHIEVEMENT CARDS ================= */}
        {ACHIEVEMENTS.map((card, idx) => {
          // Calculate orbital angle around the center (evenly spaced by 2pi / 6)
          const cardAngle = angle + (idx * (2 * Math.PI)) / ACHIEVEMENTS.length;
          const x = Math.sin(cardAngle) * radius.rx;
          const z = Math.cos(cardAngle) * radius.rz;
          const y = Math.sin(cardAngle * 2) * 14; // subtle wave bob

          // Normalize z (-radius.rz to +radius.rz) to compute depth, scale, and z-index
          const normZ = (z + radius.rz) / (2 * radius.rz); // 0 (back) to 1 (front)
          const isFront = z >= 0;
          const isHovered = hoveredCard === card.id;

          // Scale and opacity based on depth position
          const depthScale = isHovered ? 1.18 : 0.82 + normZ * 0.28;
          const depthOpacity = isHovered ? 1 : 0.65 + normZ * 0.35;
          const zIndex = isHovered ? 50 : isFront ? 30 : 10;

          const CardIcon = card.icon;

          return (
            <div
              key={card.id}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => {
                document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                transform: `translate3d(${x}px, ${y}px, ${z}px) scale(${depthScale})`,
                zIndex,
                opacity: depthOpacity,
                transition: isDragging
                  ? "none"
                  : isHovered
                  ? "transform 0.25s ease-out, box-shadow 0.25s, opacity 0.25s"
                  : "transform 0.1s linear, opacity 0.2s linear",
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 xs:w-56 sm:w-64 md:w-72 cursor-pointer will-change-transform"
            >
              <div
                className={`relative overflow-hidden rounded-2xl border bg-slate-950/85 p-3.5 sm:p-4 text-white backdrop-blur-xl transition-all duration-300 ${
                  isHovered
                    ? "border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_35px_rgba(245,158,11,0.5)]"
                    : isFront
                    ? "border-amber-500/40 shadow-xl shadow-black/80"
                    : "border-slate-800 shadow-md"
                }`}
              >
                {/* Glowing Aura Accent on Card Top */}
                <div
                  className={`pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br ${card.accent} opacity-20 blur-xl group-hover:opacity-40`}
                />

                {/* Card Header: Icon + Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`grid size-8 sm:size-9 place-items-center rounded-xl bg-gradient-to-br ${card.accent} text-slate-950 shadow-md`}
                    >
                      <CardIcon className="size-4 sm:size-5" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-300">
                      {card.badge}
                    </span>
                  </div>
                  <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[9px] font-black uppercase text-amber-200">
                    {card.tag}
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="mt-2 text-sm sm:text-base font-black text-white leading-snug">
                  {card.title}
                </h3>

                {/* Metric Highlight */}
                <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Star className="size-3 fill-amber-400" />
                  <span>{card.metric}</span>
                </div>

                {/* Description */}
                <p className="mt-1.5 text-[11px] sm:text-xs leading-relaxed text-slate-300 line-clamp-2">
                  {card.desc}
                </p>

                {/* Bottom CTA hint */}
                <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] font-bold text-amber-300">
                  <span>Click to Register</span>
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= CONTROLS & NAVIGATION ================= */}
      <div className="relative z-20 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-amber-500/20 pt-4">
        {/* Left: Interactive status */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <span className="size-2 rounded-full bg-amber-400 animate-ping" />
          <span>360° Circular Orbit Active</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-amber-400/90 hidden sm:inline">KLE BCA &amp; BBA Mahalingpur</span>
        </div>

        {/* Center/Right: Orbit Step & Play/Pause Controls */}
        <div className="flex items-center gap-2">
          {/* Rotate Previous */}
          <button
            type="button"
            onClick={() => stepOrbit(-1)}
            className="grid size-8 place-items-center rounded-xl border border-amber-400/30 bg-slate-900/80 text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition active:scale-95 shadow-md"
            title="Rotate Left"
            aria-label="Previous card"
          >
            <ChevronLeft className="size-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black shadow-md transition active:scale-95 ${
              isPaused
                ? "border-amber-400 bg-amber-400 text-slate-950"
                : "border-amber-400/40 bg-slate-900/90 text-amber-300 hover:bg-amber-400/10"
            }`}
            title={isPaused ? "Resume Orbit Rotation" : "Pause Orbit Rotation"}
          >
            {isPaused ? <Play className="size-3.5 fill-current" /> : <Pause className="size-3.5 fill-current" />}
            <span>{isPaused ? "Resume" : "Pause"}</span>
          </button>

          {/* Rotate Next */}
          <button
            type="button"
            onClick={() => stepOrbit(1)}
            className="grid size-8 place-items-center rounded-xl border border-amber-400/30 bg-slate-900/80 text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition active:scale-95 shadow-md"
            title="Rotate Right"
            aria-label="Next card"
          >
            <ChevronRight className="size-4" />
          </button>

          {/* 360 Spin Trophy Button */}
          <button
            type="button"
            onClick={triggerTrophy360}
            className="flex items-center gap-1 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-3 py-1.5 text-xs font-black text-amber-300 hover:from-amber-400 hover:to-yellow-400 hover:text-slate-950 transition active:scale-95 shadow-md"
            title="Spin Central AI Trophy 360°"
          >
            <RotateCw className="size-3" />
            <span className="hidden xs:inline">Spin Trophy</span>
          </button>
        </div>
      </div>
    </section>
  );
}
