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

/* Centered CSS Poster Fallback matching exact 1:1.4 aspect ratio */
function PosterFallback({ event, rule, ink }) {
  const Icon = event?.icon;
  const numStr = `#${String(event?.id || 0).padStart(2, "0")}`;
  const groupLabel = (rule?.group || event?.category || "").toUpperCase();

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto my-auto flex h-[92%] aspect-[5/7] flex-col justify-between overflow-hidden rounded-xl bg-[#f9f8f4] p-3 text-slate-800 shadow-md border border-slate-300/60 dark:border-slate-700/60"
    >
      {/* Subtle paper grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent 0 28px,rgba(148,163,184,.2) 28px 29px),repeating-linear-gradient(90deg,transparent 0 28px,rgba(148,163,184,.2) 28px 29px)",
        }}
      />
      {/* Framed inner border */}
      <div
        className="pointer-events-none absolute inset-1.5 rounded-lg border"
        style={{ borderColor: `${ink}33` }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <span
          className="rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-xs"
          style={{ background: ink }}
        >
          {groupLabel}
        </span>
        <span className="text-xs font-black tracking-tight" style={{ color: ink }}>
          {numStr}
        </span>
      </div>

      {/* Center Medallion */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center">
        <div
          className="grid size-14 place-items-center rounded-full border-2 border-dashed shadow-xs sm:size-16"
          style={{
            borderColor: `${ink}88`,
            background: `${ink}12`,
            color: ink,
          }}
        >
          {Icon && <Icon className="size-7 sm:size-8" aria-hidden="true" />}
        </div>
        <p className="mt-2 max-w-[92%] text-center text-[11px] font-extrabold leading-tight text-slate-900 sm:text-xs line-clamp-2">
          {event?.name}
        </p>
      </div>

      {/* Footer stamp */}
      <div className="relative z-10 flex items-center justify-between text-[8px] font-bold text-slate-500">
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
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        hit
          ? "border-accent ring-3 ring-accent/30 shadow-md shadow-accent/20"
          : "border-border shadow-xs hover:border-accent/40"
      } ${dimmed ? "opacity-35 saturate-50" : "opacity-100"}`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerMove={onPointerMove}
    >
      {/* ================= COMPACT POSTER AREA ================= */}
      <div className="relative h-48 sm:h-56 md:h-60 w-full overflow-hidden rounded-t-2xl bg-gradient-to-b from-slate-100/90 to-slate-200/50 dark:from-slate-800/80 dark:to-slate-900/60 border-b border-border/60 flex items-center justify-center">
        {/* Poster 3D Mesh anchor element */}
        <div
          ref={posterRef}
          className="relative size-full touch-manipulation select-none flex items-center justify-center"
          role="img"
          aria-label={`${event?.name} official event poster sheet`}
        >
          {/* Fallback layer rendered when 3D is initializing or unsupported */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              is3dActive ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <PosterFallback event={event} rule={rule} ink={ink} />
          </div>

          {/* Integrated small 3D Paper badge inside the poster viewport */}
          <div className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs backdrop-blur-xs">
            <Sparkles className="size-2.5 text-cyan-300" />
            <span>3D Paper</span>
          </div>
        </div>
      </div>

      {/* ================= STREAMLINED CARD BODY ================= */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4 md:p-5">
        <div>
          {/* Category Badge & Event # */}
          <div className="mb-2 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="truncate rounded-md px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-xs"
                style={{ background: ink }}
              >
                {rule?.group || event?.category}
              </span>
              {rule?.proposed && (
                <span className="shrink-0 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  PROPOSED
                </span>
              )}
            </div>
            <span className="shrink-0 text-xs font-black text-muted">
              #{String(event?.id || 0).padStart(2, "0")}
            </span>
          </div>

          {/* Event Title */}
          <h3 className="text-sm font-extrabold leading-snug tracking-tight text-foreground sm:text-base md:text-lg line-clamp-1 sm:line-clamp-2">
            {event?.name}
          </h3>

          {/* Description / Judging focus */}
          {rule?.judging && (
            <p className="mt-1 text-xs text-muted line-clamp-1 sm:line-clamp-2">
              <span className="font-semibold text-foreground/80">Focus:</span> {rule.judging}
            </p>
          )}

          {/* Chips specs */}
          {rule?.chips && rule.chips.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {rule.chips.slice(0, 3).map((chip, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-slate-100/70 dark:bg-slate-800/60 px-1.5 py-0.5 text-[10px] font-semibold text-foreground/80"
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
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
          <button
            type="button"
            className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-2.5 py-1.5 text-xs font-bold text-foreground transition hover:border-accent hover:bg-accent/5 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={(e) => {
              e.stopPropagation();
              onViewRules?.(event.id);
            }}
            aria-label={`View rules for ${event.name}`}
          >
            <FileText className="size-3.5 shrink-0" />
            <span>Rules</span>
          </button>

          <button
            type="button"
            className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-accent to-primary px-2.5 py-1.5 text-xs font-bold text-white shadow-xs shadow-accent/20 transition hover:opacity-95 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={(e) => {
              e.stopPropagation();
              onRegister?.(event.name);
            }}
            aria-label={`Register for ${event.name}`}
          >
            <span>Register</span>
            <ArrowRight className="size-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </article>
  );
}
