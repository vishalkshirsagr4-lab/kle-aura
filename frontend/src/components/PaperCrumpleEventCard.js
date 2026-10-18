import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { addPaperCard } from "../three/paperCardManager";
import { getPaperMaterial, GROUP_INK } from "../three/paperTexture";

/* One event tile. Renders a CSS "paper" card by default; when the shared
   VAT renderer is ready it adds paper folds, pointer tilt and press response.
   Touch users can press and drag to tilt it; the canvas never intercepts input. */

const CAN_HOVER =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function PaperFallbackLayer({ ev, rule }) {
  const ink = GROUP_INK[rule.group] || "#4f7cff";
  const Icon = ev.icon;
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 block overflow-hidden rounded-2xl bg-[#eceae2] text-ink"
    >
      <span
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent 0 38px,rgba(130,150,135,.28) 38px 40px),repeating-linear-gradient(90deg,transparent 0 38px,rgba(130,150,135,.28) 38px 40px)",
        }}
      />
      <span className="absolute inset-x-0 top-0 h-6 bg-white/45" />
      <span
        className="absolute right-2 top-2 text-4xl font-black leading-none sm:right-3 sm:text-[52px]"
        style={{ color: ink, opacity: 0.14 }}
      >
        {String(ev.id).padStart(2, "0")}
      </span>
      <span
        className="absolute left-2 top-2 max-w-[calc(100%-4rem)] truncate rounded-full px-2 py-1 text-[8px] font-bold tracking-wide text-white sm:left-3 sm:top-3 sm:px-2.5 sm:text-[10px]"
        style={{ background: ink }}
      >
        {(rule.group || "").toUpperCase()}
      </span>
      {rule.proposed && (
        <span className="absolute right-3 top-[27%] rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-amber-950">
          PROPOSED
        </span>
      )}
      <span
        className="absolute left-1/2 top-[38%] grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-dashed sm:size-[84px]"
        style={{
          borderColor: `${ink}88`,
          background: `${ink}1a`,
          color: ink,
        }}
      >
        <Icon className="size-8 sm:size-10" aria-hidden="true" />
      </span>
      <span className="absolute inset-x-3 bottom-[27%] line-clamp-2 font-hand text-xl font-bold leading-tight sm:inset-x-4 sm:text-[27px]">
        {ev.name}
      </span>
      <span className="absolute inset-x-3 bottom-[19%] truncate text-[9px] font-semibold sm:inset-x-4 sm:text-[11px]" style={{ color: ink }}>
        {rule.type}
      </span>
      <span className="absolute inset-x-4 bottom-2 flex justify-between text-[9px] font-semibold text-ink/45">
        <span>AI-AURA 2K26</span>
        <span>KLE BCA &amp; BBA</span>
      </span>
      <span
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(60,55,40,.14) 100%)",
        }}
      />
    </span>
  );
}

function PaperCrumpleEventCard({ ev, rule, hit, dimmed, mode, onOpen, onFail }) {
  const elRef = useRef(null);
  const overlayRef = useRef(null);
  const handleRef = useRef(null);
  const hoverRef = useRef(false);
  const pressRef = useRef(false);
  const focusRef = useRef(false);
  const [threeReady, setThreeReady] = useState(false);

  const sync = () => {
    handleRef.current?.setInteraction({
      hover: hoverRef.current,
      pressed: pressRef.current,
      focused: focusRef.current,
    });
  };

  useEffect(() => {
    if (mode !== "3d" || !elRef.current) return undefined;
    const handle = addPaperCard({
      el: elRef.current,
      material: getPaperMaterial(ev, rule),
      onProgress: (p) => {
        const o = overlayRef.current;
        if (o) o.style.opacity = String(Math.max(0.82, 1 - p * 0.3));
      },
      onFail,
    });
    if (!handle) {
      onFail?.();
      return undefined;
    }
    handleRef.current = handle;
    setThreeReady(true);
    return () => {
      handle?.dispose();
      handleRef.current = null;
    };
  }, [mode, ev, rule, onFail]);

  // The interest filter dims non-matching cards. The 3D paper lives on the
  // shared canvas, so it needs its own signal to fade with the card.
  useEffect(() => {
    handleRef.current?.setDim(dimmed);
  }, [dimmed, mode]);

  const onEnter = (e) => {
    if (!CAN_HOVER || e.pointerType === "touch") return;
    hoverRef.current = true;
    sync();
  };
  const onLeave = () => {
    hoverRef.current = false;
    pressRef.current = false;
    handleRef.current?.resetTilt();
    elRef.current?.style.setProperty("--card-rx", "0deg");
    elRef.current?.style.setProperty("--card-ry", "0deg");
    sync();
  };
  const onDown = (e) => {
    pressRef.current = true;
    if (e.pointerType === "touch") setTiltFromPointer(e);
    sync();
  };
  const onUp = (e) => {
    pressRef.current = false;
    if (e.pointerType === "touch") {
      handleRef.current?.resetTilt();
      elRef.current?.style.setProperty("--card-rx", "0deg");
      elRef.current?.style.setProperty("--card-ry", "0deg");
    }
    sync();
  };
  const onFocus = () => {
    focusRef.current = true;
    sync();
  };
  const onBlur = () => {
    focusRef.current = false;
    sync();
  };
  const setTiltFromPointer = (e) => {
    const el = elRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    const touchScale = e.pointerType === "touch" ? 0.55 : 1;
    handleRef.current?.setTilt(
      nx * touchScale,
      ny * touchScale,
    );
    if (mode !== "3d" || !handleRef.current) {
      el.style.setProperty("--card-rx", `${-ny * 10 * touchScale}deg`);
      el.style.setProperty("--card-ry", `${nx * 10 * touchScale}deg`);
    }
  };
  const onMove = (e) => {
    if (CAN_HOVER && e.pointerType !== "touch") {
      setTiltFromPointer(e);
      return;
    }
    if (e.pointerType === "touch" && pressRef.current) setTiltFromPointer(e);
  };

  const is3d = mode === "3d" && threeReady;

  return (
    <button
      ref={elRef}
      type="button"
      data-paper-card="1"
      className={`event-card group relative aspect-[5/7] min-h-[184px] touch-manipulation overflow-hidden rounded-2xl text-left transition-[opacity,scale,box-shadow,transform] duration-200 sm:min-h-[208px] [transform:perspective(900px)_rotateX(var(--card-rx,0deg))_rotateY(var(--card-ry,0deg))] ${
        hit
          ? `${is3d ? "z-[41]" : "z-10"} scale-[1.03] animate-pulse-hit shadow-[0_0_0_3px_rgba(255,255,255,.85),0_0_0_7px_rgba(54,228,255,.85)]`
          : is3d
            ? "event-card--3d z-[41] shadow-xl shadow-black/20"
            : "event-card--fallback border border-black/10 bg-paper shadow-xl shadow-black/15 active:scale-[.985]"
      } ${dimmed ? "opacity-40 saturate-50" : ""}`}
      onClick={() => onOpen(rule.id)}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerMove={onMove}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label={`${ev.name}. ${rule.type}. View rules.`}
    >
      <span className="sr-only">
        {ev.name}. {rule.type}. {rule.chips.join(", ")}.{" "}
        {rule.proposed ? "Proposed event. " : ""}View rules and register.
      </span>

      {!is3d && <PaperFallbackLayer ev={ev} rule={rule} />}

      {/* in 3D mode this slot is transparent — the shared canvas paints
          the crumpling paper beneath this overlay */}
      {/* floats above the WebGL paper in 3D mode; sits on the CSS paper
          in fallback mode — the whole card remains the click target */}
      <span
        ref={overlayRef}
        className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-2.5 transition-opacity duration-200 sm:p-3 ${
          is3d ? "bg-gradient-to-t from-[#111827]/90 via-[#111827]/55 to-transparent pt-10 text-white sm:pt-14" : ""
        }`}
      >
        {is3d && (
          <span className="mr-1 min-w-0 flex-1 text-left">
            <span className="line-clamp-2 block text-[10px] font-extrabold leading-tight sm:text-sm">
              {ev.name}
            </span>
            <span className="mt-0.5 block truncate text-[9px] font-semibold text-white/75 sm:text-[11px]">
              {rule.type}
            </span>
          </span>
        )}
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1.5 text-[10px] font-extrabold shadow-sm backdrop-blur-sm transition-transform duration-200 sm:gap-1.5 sm:px-3 sm:text-[11px] ${
            is3d
              ? "border-white/30 bg-white/15 text-white"
              : "border-ink/20 bg-white/80 text-ink"
          }`}
        >
          View rules
          <ArrowRight className="size-3" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}

export default PaperCrumpleEventCard;
