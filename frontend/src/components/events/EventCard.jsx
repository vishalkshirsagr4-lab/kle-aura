import { useEffect, useRef, useState } from "react";
import {
  FileText,
  ArrowRight,
  Users,
  Clock,
  Sparkles,
  Trophy,
} from "lucide-react";
import { addPaperCard } from "../../three/paperCardManager";
import { getPaperMaterial, GROUP_INK } from "../../three/paperTexture";

const CAN_HOVER =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* CSS Poster Fallback when WebGL is unavailable or still loading */
function PosterFallback({ event, rule, ink }) {
  const Icon = event?.icon;
  const numStr = `#${String(event?.id || 0).padStart(2, "0")}`;
  const groupLabel = (rule?.group || event?.category || "").toUpperCase();

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-t-2xl bg-[#f9f8f4] p-3 text-slate-800"
    >
      {/* Subtle paper grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent 0 32px,rgba(148,163,184,.2) 32px 33px),repeating-linear-gradient(90deg,transparent 0 32px,rgba(148,163,184,.2) 32px 33px)",
        }}
      />
      {/* Framed border */}
      <div
        className="pointer-events-none absolute inset-2 rounded-xl border"
        style={{ borderColor: `${ink}33` }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <span
          className="rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm"
          style={{ background: ink }}
        >
          {groupLabel}
        </span>
        <span className="text-sm font-black tracking-tight" style={{ color: ink }}>
          {numStr}
        </span>
      </div>

      {/* Center Medallion */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <div
          className="grid size-16 place-items-center rounded-full border-2 border-dashed shadow-sm transition-transform duration-300 group-hover:scale-105 sm:size-20"
          style={{
            borderColor: `${ink}88`,
            background: `${ink}12`,
            color: ink,
          }}
        >
          {Icon && <Icon className="size-8 sm:size-10" aria-hidden="true" />}
        </div>
        <p className="mt-2.5 max-w-[90%] text-center text-xs font-bold leading-tight sm:text-sm line-clamp-2">
          {event?.name}
        </p>
        <span className="mt-0.5 text-[10px] font-semibold opacity-75" style={{ color: ink }}>
          {rule?.type}
        </span>
      </div>

      {/* Footer stamp */}
      <div className="relative z-10 flex items-center justify-between text-[9px] font-bold text-slate-500">
        <span>AI-AURA 2K26</span>
        <span>KLE BCA &amp; BBA</span>
      </div>
    </div>
  );
}

export default function EventCard({
  event,
  rule,
  hit = false,
  dimmed = false,
  mode = "3d",
  onViewRules,
  onRegister,
  onFail,
}) {
  const posterRef = useRef(null);
  const handleRef = useRef(null);
  const hoverRef = useRef(false);
  const pressRef = useRef(false);
  const [threeReady, setThreeReady] = useState(false);

  const ink = GROUP_INK[rule?.group] || "#4f46e5";

  const sync = () => {
    handleRef.current?.setInteraction({
      hover: hoverRef.current,
      pressed: pressRef.current,
    });
  };

  useEffect(() => {
    if (mode !== "3d" || !posterRef.current || !event) return undefined;

    const handle = addPaperCard({
      el: posterRef.current,
      material: getPaperMaterial(event, rule),
      onFail: () => {
        setThreeReady(false);
        onFail?.();
      },
    });

    if (!handle) {
      setThreeReady(false);
      onFail?.();
      return undefined;
    }

    handleRef.current = handle;
    setThreeReady(true);

    return () => {
      handle?.dispose();
      handleRef.current = null;
      setThreeReady(false);
    };
  }, [mode, event, rule, onFail]);

  useEffect(() => {
    handleRef.current?.setDim(dimmed);
  }, [dimmed, mode]);

  const onPointerEnter = (e) => {
    if (!CAN_HOVER || e.pointerType === "touch") return;
    hoverRef.current = true;
    sync();
  };

  const onPointerLeave = () => {
    hoverRef.current = false;
    pressRef.current = false;
    handleRef.current?.resetTilt();
    sync();
  };

  const onPointerDown = (e) => {
    pressRef.current = true;
    if (e.pointerType === "touch") updateTilt(e);
    sync();
  };

  const onPointerUp = (e) => {
    pressRef.current = false;
    if (e.pointerType === "touch") {
      handleRef.current?.resetTilt();
    }
    sync();
  };

  const updateTilt = (e) => {
    const el = posterRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    const touchScale = e.pointerType === "touch" ? 0.6 : 1;
    handleRef.current?.setTilt(nx * touchScale, ny * touchScale);
  };

  const onPointerMove = (e) => {
    if (CAN_HOVER && e.pointerType !== "touch") {
      updateTilt(e);
    } else if (e.pointerType === "touch" && pressRef.current) {
      updateTilt(e);
    }
  };

  const is3dActive = mode === "3d" && threeReady;

  return (
    <article
      data-event-card="true"
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-surface transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
        hit
          ? "border-accent ring-4 ring-accent/30 shadow-lg shadow-accent/20"
          : "border-border shadow-sm hover:border-accent/40"
      } ${dimmed ? "opacity-35 saturate-50" : "opacity-100"}`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerMove={onPointerMove}
    >
      {/* ================= POSTER AREA ================= */}
      <div className="relative aspect-[5/6] w-full overflow-hidden rounded-t-2xl bg-paper/40 border-b border-border/60">
        {/* Poster 3D Mesh anchor element */}
        <div
          ref={posterRef}
          className="relative size-full touch-manipulation select-none"
          role="img"
          aria-label={`${event?.name} official event poster sheet`}
        >
          {/* Fallback layer rendered when 3D is initializing or unsupported */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              is3dActive ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <PosterFallback event={event} rule={rule} ink={ink} />
          </div>

          {/* Interactive tactile badge on poster */}
          <div className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm backdrop-blur-sm dark:bg-slate-900/85 dark:text-slate-200">
            <Sparkles className="size-3 text-accent" />
            <span>3D Paper</span>
          </div>
        </div>
      </div>

      {/* ================= CARD BODY ================= */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* Category Badge & Proposed Tag */}
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs"
              style={{ background: ink }}
            >
              {rule?.group || event?.category}
            </span>
            {rule?.proposed && (
              <span className="inline-flex items-center rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-400 border border-amber-500/30">
                PROPOSED
              </span>
            )}
            <span className="ml-auto text-xs font-black text-muted">
              #{String(event?.id || 0).padStart(2, "0")}
            </span>
          </div>

          {/* Event Title */}
          <h3 className="text-base font-extrabold leading-snug tracking-tight text-foreground sm:text-lg line-clamp-2">
            {event?.name}
          </h3>

          {/* Type / Subtitle */}
          <p className="mt-1 text-xs font-semibold text-accent line-clamp-1">
            {rule?.type || event?.category}
          </p>

          {/* Description / Judging focus */}
          {rule?.judging && (
            <p className="mt-2 text-xs leading-relaxed text-muted line-clamp-2">
              <strong className="text-foreground/80">Focus:</strong> {rule.judging}
            </p>
          )}

          {/* Chips specs */}
          {rule?.chips && rule.chips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {rule.chips.map((chip, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-slate-100/70 dark:bg-slate-800/60 px-2 py-0.5 text-[10px] font-semibold text-foreground/85"
                >
                  {idx === 0 ? (
                    <Users className="size-2.5 text-muted" />
                  ) : idx === 1 ? (
                    <Clock className="size-2.5 text-muted" />
                  ) : (
                    <Trophy className="size-2.5 text-muted" />
                  )}
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border/70 pt-3.5">
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-2.5 py-2 text-xs font-bold text-foreground transition hover:border-accent hover:bg-accent/5 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={(e) => {
              e.stopPropagation();
              onViewRules?.(event.id);
            }}
            aria-label={`View rules for ${event.name}`}
          >
            <FileText className="size-3.5" />
            <span>View Rules</span>
          </button>

          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-accent to-primary px-2.5 py-2 text-xs font-bold text-white shadow-sm shadow-accent/20 transition hover:opacity-95 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={(e) => {
              e.stopPropagation();
              onRegister?.(event.name);
            }}
            aria-label={`Register for ${event.name}`}
          >
            <span>Register</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
