import { useEffect, useRef, useState } from "react";
import {
  FileText,
  ArrowRight,
  Users,
  Clock,
  Sparkles,
  Heart,
  Eye,
  Share2,
  Check,
} from "lucide-react";
import { addPaperCard } from "../../three/paperCardManager";
import { getPaperMaterial, GROUP_INK } from "../../three/paperTexture";

const CAN_HOVER =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* Centered CSS Poster Fallback matching exact 1 : 1.414 aspect ratio */
function PosterFallback({ event, rule, ink, onPreview }) {
  const Icon = event?.icon;
  const numStr = `#${String(event?.id || 0).padStart(2, "0")}`;
  const groupLabel = (rule?.group || event?.category || "").toUpperCase();
  const hasImage = Boolean(event?.image);

  return (
    <div
      aria-hidden="true"
      onClick={onPreview}
      className="group/poster relative size-full flex flex-col justify-between overflow-hidden rounded-xl bg-[#faf9f6] text-slate-800 shadow-sm border border-slate-300/60 dark:border-slate-700/60 cursor-pointer"
    >
      {/* Background image or subtle paper grid */}
      {hasImage ? (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={event.image}
            alt={event.name}
            className="size-full object-cover transition-transform duration-500 group-hover/poster:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/40" />
        </div>
      ) : (
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,transparent 0 20px,rgba(148,163,184,.2) 20px 21px),repeating-linear-gradient(90deg,transparent 0 20px,rgba(148,163,184,.2) 20px 21px)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-1 rounded-lg border"
            style={{ borderColor: `${ink}40` }}
          />
        </>
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-1.5 sm:p-2">
        <span
          className="rounded px-1.5 py-0.2 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wide text-white shadow-xs backdrop-blur-xs"
          style={{ background: ink }}
        >
          {groupLabel}
        </span>
        <span
          className={`text-[10px] sm:text-xs font-black tracking-tight ${
            hasImage ? "text-white drop-shadow-md" : ""
          }`}
          style={hasImage ? {} : { color: ink }}
        >
          {numStr}
        </span>
      </div>

      {/* Center content */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center p-1.5 text-center">
        {!hasImage && (
          <div
            className="grid size-9 sm:size-11 place-items-center rounded-full border border-dashed shadow-xs mb-1"
            style={{
              borderColor: `${ink}88`,
              background: `${ink}12`,
              color: ink,
            }}
          >
            {Icon && <Icon className="size-4 sm:size-5" aria-hidden="true" />}
          </div>
        )}
        <p
          className={`text-[11px] sm:text-xs font-black leading-tight line-clamp-2 px-1 ${
            hasImage ? "text-white drop-shadow-md" : "text-slate-900"
          }`}
        >
          {event?.name}
        </p>
        <span
          className={`mt-0.5 text-[8px] sm:text-[9px] font-bold ${
            hasImage ? "text-white/80" : "opacity-85"
          }`}
          style={hasImage ? {} : { color: ink }}
        >
          {rule?.type}
        </span>
      </div>

      {/* Footer stamp */}
      <div
        className={`relative z-10 flex items-center justify-between px-2 py-1 text-[7px] sm:text-[8px] font-bold ${
          hasImage ? "text-white/70" : "text-slate-500"
        }`}
      >
        <span>AI-AURA</span>
        <span>KLE</span>
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
  isSaved = false,
  onToggleSave,
  onPreviewPoster,
  onViewRules,
  onRegister,
  onFail,
}) {
  const cardRef = useRef(null);
  const posterRef = useRef(null);
  const handleRef = useRef(null);
  const hoverRef = useRef(false);
  const pressRef = useRef(false);
  const [threeReady, setThreeReady] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [copied, setCopied] = useState(false);

  const ink = GROUP_INK[rule?.group] || event?.accentColor || "#4f46e5";

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
    return () => {
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, []);

  const onPointerEnter = (e) => {
    hoverRef.current = true;
    if (e.pointerType !== "touch") {
      updateTilt(e);
    }
    sync();
  };

  const onPointerLeave = () => {
    hoverRef.current = false;
    pressRef.current = false;
    setGlarePos((p) => ({ ...p, opacity: 0 }));
    if (cardRef.current) {
      cardRef.current.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)";
    }
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
      if (cardRef.current) {
        cardRef.current.style.transform =
          "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)";
      }
      setGlarePos((p) => ({ ...p, opacity: 0 }));
    }
    sync();
  };

  const updateTilt = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    const nx = (clientX - r.left) / r.width - 0.5;
    const ny = (clientY - r.top) / r.height - 0.5;

    // Specular glare position in %
    const gx = Math.round(((clientX - r.left) / r.width) * 100);
    const gy = Math.round(((clientY - r.top) / r.height) * 100);
    setGlarePos({ x: gx, y: gy, opacity: 0.85 });

    // CSS 3D Card rotation
    const rx = -ny * 10;
    const ry = nx * 10;
    el.style.transform = `perspective(1000px) rotateX(${rx.toFixed(
      2
    )}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px) scale(1.015)`;

    // Pass tilt to Three.js paper sheet inside the card
    const touchScale = e.pointerType === "touch" ? 0.7 : 1;
    handleRef.current?.setTilt(nx * touchScale, ny * touchScale);
  };

  const onPointerMove = (e) => {
    if (CAN_HOVER && e.pointerType !== "touch") {
      updateTilt(e);
    } else if (e.pointerType === "touch" && pressRef.current) {
      updateTilt(e);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const shareText = `Check out ${event.name} at AI-AURA 2K26 Festival (KLE BCA & BBA)!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText} - https://kle-aura.vercel.app`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const is3dActive = mode === "3d" && threeReady;


  return (
    <article
      ref={cardRef}
      data-event-card="true"
      className={`group relative flex flex-col justify-between rounded-2xl border bg-surface transition-all duration-200 [transform-style:preserve-3d] will-change-transform ${
        hit
          ? "border-accent ring-2 sm:ring-3 ring-accent/30 shadow-md shadow-accent/20"
          : "border-border/80 shadow-xs hover:border-accent/50 hover:shadow-lg"
      } ${dimmed ? "opacity-35 saturate-50" : "opacity-100"}`}
      style={{
        transform:
          "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)",
      }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerMove={onPointerMove}
    >
      {/* Dynamic Specular Sheen / Glare Layer */}
      <div
        className="pointer-events-none absolute inset-0 z-30 rounded-2xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 220px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.25), transparent 70%)`,
          opacity: glarePos.opacity,
        }}
      />

      {/* Floating Action Pills (Bookmark & Quick Zoom) */}
      <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 z-40 flex items-center gap-1 [transform:translateZ(25px)]">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.(event.id);
          }}
          className={`grid size-6 sm:size-7 place-items-center rounded-full border shadow-xs backdrop-blur-md transition-all duration-200 ${
            isSaved
              ? "border-rose-400/80 bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400"
              : "border-white/50 bg-white/80 text-muted hover:text-foreground hover:bg-white dark:border-slate-700/60 dark:bg-slate-900/80"
          }`}
          title={isSaved ? "Remove from bookmarks" : "Save / Shortlist event"}
          aria-label={isSaved ? "Saved" : "Save"}
        >
          <Heart
            className={`size-3 sm:size-3.5 transition-transform active:scale-125 ${
              isSaved ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreviewPoster?.(event);
          }}
          className="grid size-6 sm:size-7 place-items-center rounded-full border border-white/50 bg-white/80 text-muted hover:text-foreground hover:bg-white dark:border-slate-700/60 dark:bg-slate-900/80 shadow-xs backdrop-blur-md transition-all"
          title="Quick preview poster"
          aria-label="Preview poster"
        >
          <Eye className="size-3 sm:size-3.5" />
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="hidden xs:grid size-6 sm:size-7 place-items-center rounded-full border border-white/50 bg-white/80 text-muted hover:text-foreground hover:bg-white dark:border-slate-700/60 dark:bg-slate-900/80 shadow-xs backdrop-blur-md transition-all"
          title="Share event link"
          aria-label="Share"
        >
          {copied ? (
            <Check className="size-3 sm:size-3.5 text-emerald-600" />
          ) : (
            <Share2 className="size-3 sm:size-3.5" />
          )}
        </button>
      </div>

      {/* ================= COMPACT PROPORTIONED POSTER VIEWPORT ================= */}
      <div
        className="relative h-[115px] xs:h-[135px] sm:h-[155px] md:h-[170px] lg:h-[185px] w-full overflow-hidden rounded-t-2xl bg-gradient-to-b from-primary/[0.04] via-accent/[0.02] to-transparent dark:from-primary/[0.08] dark:via-accent/[0.03] dark:to-transparent border-b border-border/40 flex items-center justify-center p-1.5 sm:p-2 [transform:translateZ(20px)] [transform-style:preserve-3d] cursor-pointer"
        onClick={() => onPreviewPoster?.(event)}
      >
        {/* Poster 3D Mesh anchor element sized to exact 1 : 1.414 paper proportions */}
        <div
          ref={posterRef}
          className="relative h-[94%] aspect-[1/1.414] max-w-full mx-auto touch-manipulation select-none flex items-center justify-center"
          role="img"
          aria-label={`${event?.name} official event poster sheet`}
        >
          {/* Fallback layer rendered when 3D is initializing or unsupported */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              is3dActive ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <PosterFallback
              event={event}
              rule={rule}
              ink={ink}
              onPreview={() => onPreviewPoster?.(event)}
            />
          </div>

          {/* Integrated small 3D Paper badge inside the poster viewport */}
          <div className="pointer-events-none absolute bottom-1 left-1 z-10 flex items-center gap-0.5 rounded-full border border-primary/20 bg-white/95 dark:bg-slate-900/95 px-1.5 py-0.2 text-[8px] font-bold text-primary shadow-xs backdrop-blur-xs [transform:translateZ(15px)]">
            <Sparkles className="size-2 text-accent" />
            <span>3D</span>
          </div>
        </div>
      </div>

      {/* ================= COMPACT CARD BODY ================= */}
      <div className="flex flex-1 flex-col justify-between p-2 sm:p-3 [transform:translateZ(15px)] [transform-style:preserve-3d]">
        <div>
          {/* Category Badge & Event # */}
          <div className="mb-1 flex items-center justify-between gap-1 [transform:translateZ(10px)]">
            <div className="flex items-center gap-1 min-w-0">
              <span
                className="truncate rounded px-1.5 py-0.2 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs"
                style={{ background: ink }}
              >
                {rule?.group || event?.category}
              </span>
              {rule?.proposed && (
                <span className="shrink-0 rounded bg-amber-500/15 px-1 py-0.2 text-[8px] font-extrabold text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  NEW
                </span>
              )}
            </div>
            <span className="shrink-0 text-[10px] sm:text-xs font-black text-muted">
              #{String(event?.id || 0).padStart(2, "0")}
            </span>
          </div>

          {/* Event Title */}
          <h3 className="text-xs sm:text-sm font-extrabold leading-tight tracking-tight text-foreground line-clamp-1 [transform:translateZ(12px)]">
            {event?.name}
          </h3>

          {/* Event Tagline */}
          {event?.tagline && (
            <p className="mt-0.5 text-[10px] sm:text-xs text-muted line-clamp-1 italic">
              {event.tagline}
            </p>
          )}

          {/* Compact specs chips */}
          {rule?.chips && rule.chips.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1 [transform:translateZ(8px)]">
              {rule.chips.slice(0, 2).map((chip, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-0.5 rounded border border-border/70 bg-slate-100/70 dark:bg-slate-800/60 px-1 py-0.2 text-[8px] sm:text-[9px] font-medium text-foreground/80 truncate max-w-full"
                >
                  {idx === 0 ? (
                    <Users className="size-2 text-muted shrink-0" />
                  ) : (
                    <Clock className="size-2 text-muted shrink-0" />
                  )}
                  <span className="truncate">{chip}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-border/40 pt-1.5 sm:pt-2 [transform:translateZ(12px)]">
          <button
            type="button"
            className="inline-flex h-7 sm:h-8 items-center justify-center gap-1 rounded-lg border border-border bg-surface px-1.5 text-[10px] sm:text-xs font-bold text-foreground transition hover:border-accent hover:bg-accent/5 hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            onClick={(e) => {
              e.stopPropagation();
              onViewRules?.(event.id);
            }}
            aria-label={`View rules for ${event.name}`}
          >
            <FileText className="size-3 shrink-0" />
            <span>Rules</span>
          </button>

          <button
            type="button"
            className="inline-flex h-7 sm:h-8 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-accent to-primary px-1.5 text-[10px] sm:text-xs font-bold text-white shadow-xs transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            onClick={(e) => {
              e.stopPropagation();
              onRegister?.(event.name);
            }}
            aria-label={`Register for ${event.name}`}
          >
            <span>Register</span>
            <ArrowRight className="size-3 shrink-0" />
          </button>
        </div>
      </div>
    </article>
  );
}
