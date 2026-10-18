import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  FileText,
  ArrowRight,
  Eye,
  Heart,
  Trophy,
} from "lucide-react";
import { GROUP_INK } from "../../three/paperTexture";

export default function ThreeDCarousel({
  events = [],
  rules = [],
  savedIds = [],
  onToggleSave,
  onPreviewPoster,
  onViewRules,
  onRegister,
}) {
  const containerRef = useRef(null);
  const ringRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const startRotation = useRef(0);
  const rotationY = useRef(0);
  const targetRotationY = useRef(0);

  // Showcase up to 10 events in the 3D ring for optimal performance & visual balance
  const featured = events.slice(0, 10);
  const count = featured.length;
  const theta = count > 0 ? 360 / count : 0;

  // Compute 3D cylinder radius based on card width
  const [radius, setRadius] = useState(420);

  useEffect(() => {
    const updateRadius = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setRadius(Math.max(260, Math.round(130 / Math.tan(Math.PI / count))));
      } else if (w < 1024) {
        setRadius(Math.max(360, Math.round(150 / Math.tan(Math.PI / count))));
      } else {
        setRadius(Math.max(440, Math.round(165 / Math.tan(Math.PI / count))));
      }
    };
    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, [count]);

  // Continuous Auto-rotation using requestAnimationFrame
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const loop = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying && !isDragging) {
        targetRotationY.current -= 9.5 * dt;
      }

      // Smooth lerp to target rotation
      rotationY.current += (targetRotationY.current - rotationY.current) * 0.1;

      if (ringRef.current) {
        ringRef.current.style.transform = `rotateY(${rotationY.current}deg)`;
      }

      // Update current active index based on rotation
      const normalized = ((-rotationY.current % 360) + 360) % 360;
      const activeIdx = Math.round(normalized / theta) % count;
      setCurrentIndex((prev) => (prev !== activeIdx ? activeIdx : prev));

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isDragging, theta, count]);

  // Rotate to specific index
  const rotateToIndex = useCallback(
    (index) => {
      const diff = index - currentIndex;
      let stepDiff = diff;
      if (stepDiff > count / 2) stepDiff -= count;
      if (stepDiff < -count / 2) stepDiff += count;

      targetRotationY.current -= stepDiff * theta;
    },
    [currentIndex, count, theta]
  );

  const prev = () => {
    targetRotationY.current += theta;
  };

  const next = () => {
    targetRotationY.current -= theta;
  };

  // Drag / swipe controls
  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragStartX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startRotation.current = targetRotationY.current;
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = clientX - dragStartX.current;
    targetRotationY.current = startRotation.current + deltaX * 0.45;
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Snap to nearest card
    const snap = Math.round(targetRotationY.current / theta) * theta;
    targetRotationY.current = snap;
  };

  const activeEvent = featured[currentIndex] || featured[0];
  const activeRule = rules.find((r) => r.id === activeEvent?.id);
  const activeInk = GROUP_INK[activeRule?.group] || activeEvent?.accentColor || "#4f46e5";

  return (
    <div
      ref={containerRef}
      className="relative my-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/[0.04] via-surface to-surface p-4 sm:p-6 shadow-2xl select-none"
    >
      {/* Header Bar with Orbit Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5 text-accent animate-pulse" />
              <span>3D Orbit Arena</span>
            </span>
            <span className="text-xs font-semibold text-muted">
              Auto-rotating Showcase
            </span>
          </div>
          <h3 className="mt-1 text-lg sm:text-xl font-extrabold text-foreground">
            Swipe or Drag to Rotate Events
          </h3>
        </div>

        {/* Orbit Control Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground shadow-xs hover:border-accent hover:text-accent transition"
            aria-label={isPlaying ? "Pause auto-rotation" : "Play auto-rotation"}
          >
            {isPlaying ? (
              <>
                <Pause className="size-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="size-3.5" />
                <span>Play</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prev}
              className="grid size-8 place-items-center rounded-xl border border-border bg-surface text-foreground shadow-xs hover:border-accent hover:text-accent transition"
              aria-label="Previous card"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={next}
              className="grid size-8 place-items-center rounded-xl border border-border bg-surface text-foreground shadow-xs hover:border-accent hover:text-accent transition"
              aria-label="Next card"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Perspective Stage Viewport */}
      <div
        className="relative mx-auto my-4 flex h-[350px] sm:h-[400px] w-full items-center justify-center cursor-grab active:cursor-grabbing [perspective:1400px]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Floor 3D Grid reflection */}
        <div
          className="pointer-events-none absolute bottom-4 h-32 w-72 sm:w-96 rounded-full opacity-35 blur-xl transition-all duration-500"
          style={{
            background: `radial-gradient(ellipse at center, ${activeInk} 0%, transparent 70%)`,
            transform: "rotateX(75deg) translateZ(-60px)",
          }}
        />

        {/* 3D Rotating Ring */}
        <div
          ref={ringRef}
          className="relative size-0 [transform-style:preserve-3d]"
          style={{ transform: `rotateY(0deg)` }}
        >
          {featured.map((ev, i) => {
            const rule = rules.find((r) => r.id === ev.id);
            const ink = GROUP_INK[rule?.group] || ev.accentColor || "#4f46e5";
            const cardAngle = i * theta;
            const Icon = ev.icon;
            const isActive = i === currentIndex;
            const isSaved = savedIds.includes(ev.id);

            return (
              <div
                key={ev.id}
                onClick={(e) => {
                  e.stopPropagation();
                  rotateToIndex(i);
                }}
                className="absolute left-1/2 top-1/2 -ml-[115px] -mt-[150px] sm:-ml-[130px] sm:-mt-[170px] w-[230px] sm:w-[260px] h-[300px] sm:h-[340px] rounded-2xl border border-white/50 dark:border-slate-700/60 bg-surface/95 dark:bg-slate-900/95 shadow-xl transition-all duration-300 hover:shadow-2xl [transform-style:preserve-3d] flex flex-col justify-between p-3 overflow-hidden group/item cursor-pointer backdrop-blur-md"
                style={{
                  transform: `rotateY(${cardAngle}deg) translateZ(${radius}px) scale(${
                    isActive ? 1.05 : 0.93
                  })`,
                  boxShadow: isActive
                    ? `0 22px 40px -10px ${ink}50, 0 0 0 2px ${ink}`
                    : "0 10px 25px -8px rgba(0,0,0,0.15)",
                }}
              >
                {/* Specular sheen overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />

                {/* Card Top: Tag + ID + Bookmark */}
                <div className="flex items-center justify-between gap-1 [transform:translateZ(20px)]">
                  <span
                    className="truncate rounded-md px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs"
                    style={{ background: ink }}
                  >
                    {rule?.group || ev.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave?.(ev.id);
                      }}
                      className="grid size-6 place-items-center rounded-full bg-surface/80 text-muted hover:text-foreground transition"
                      title={isSaved ? "Saved" : "Save"}
                    >
                      <Heart
                        className={`size-3 ${
                          isSaved ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                    </button>
                    <span className="text-[11px] font-black text-muted">
                      #{String(ev.id).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Card Center: Rich Image Frame with 3D Pop */}
                <div
                  className="relative my-auto flex h-[155px] sm:h-[180px] w-full flex-col justify-end rounded-xl border border-border/60 overflow-hidden [transform:translateZ(30px)] transition-transform duration-300 group-hover/item:scale-[1.03]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewPoster?.(ev);
                  }}
                >
                  {ev.image ? (
                    <img
                      src={ev.image}
                      alt={ev.name}
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

                  {/* Eye preview floating overlay */}
                  <div className="absolute right-2 top-2 z-10 grid size-6 place-items-center rounded-full bg-slate-900/70 text-white backdrop-blur-xs shadow-xs opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <Eye className="size-3" />
                  </div>

                  <div className="relative z-10 p-2.5 text-white">
                    <div className="flex items-center gap-1.5 mb-1">
                      {Icon && <Icon className="size-3.5 text-accent" />}
                      <span className="text-[9px] font-bold text-accent uppercase tracking-wider">
                        {rule?.type || "Competition"}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black leading-tight drop-shadow-md line-clamp-1">
                      {ev.name}
                    </h4>
                    {ev.tagline && (
                      <p className="mt-0.5 text-[10px] text-white/80 line-clamp-1 italic">
                        {ev.tagline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Quick Actions */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-border/40 [transform:translateZ(20px)]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewRules?.(ev.id);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-[11px] font-bold text-foreground hover:border-accent hover:text-accent transition"
                  >
                    <FileText className="size-3" />
                    <span>Rules</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegister?.(ev.name);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-accent to-primary px-2 py-1 text-[11px] font-bold text-white shadow-xs hover:opacity-95 transition"
                  >
                    <span>Register</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Spotlight Card Footer Bar */}
      <div className="relative z-20 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface/90 p-3 sm:px-4 sm:py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          {activeEvent?.image ? (
            <img
              src={activeEvent.image}
              alt={activeEvent.name}
              className="size-11 rounded-xl object-cover border border-border shadow-xs shrink-0"
            />
          ) : (
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white font-extrabold shadow-xs"
              style={{ background: activeInk }}
            >
              #{activeEvent?.id}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-foreground truncate">
                {activeEvent?.name}
              </span>
              <span
                className="hidden sm:inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white"
                style={{ background: activeInk }}
              >
                {activeRule?.group}
              </span>
            </div>
            <p className="text-[11px] text-muted truncate">
              {activeEvent?.tagline ||
                (activeRule?.judging
                  ? `Focus: ${activeRule.judging}`
                  : activeRule?.type)}
            </p>
          </div>
        </div>

        {/* Indicator dots */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
          {featured.map((ev, i) => (
            <button
              key={ev.id}
              type="button"
              onClick={() => rotateToIndex(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentIndex
                  ? "w-6 h-2 bg-primary shadow-xs"
                  : "size-2 bg-muted/30 hover:bg-muted/60"
              }`}
              aria-label={`Jump to ${ev.name}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
