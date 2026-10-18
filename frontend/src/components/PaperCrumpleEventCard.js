import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { addPaperCard } from "../three/paperCardManager";
import { getPaperMaterial, GROUP_INK } from "../three/paperTexture";

/* One event tile. Renders a CSS "paper" card by default; when the shared
   VAT paper-crumple renderer is ready it upgrades to the real 3D sheet:
   hover folds it, the pointer leans it, press crumples it deeper, and it
   springs back on release. All clicks/keyboard/aria behaviour is the
   same in both modes; the WebGL canvas never intercepts input. */

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
        className="absolute right-3 top-2 text-[52px] font-black leading-none"
        style={{ color: ink, opacity: 0.14 }}
      >
        {String(ev.id).padStart(2, "0")}
      </span>
      <span
        className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide text-white"
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
        className="absolute left-1/2 top-[38%] grid size-[84px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-dashed"
        style={{
          borderColor: `${ink}88`,
          background: `${ink}1a`,
          color: ink,
        }}
      >
        <Icon className="size-10" aria-hidden="true" />
      </span>
      <span className="absolute inset-x-4 bottom-[27%] font-hand text-[27px] font-bold leading-tight">
        {ev.name}
      </span>
      <span className="absolute inset-x-4 bottom-[19%] truncate text-[11px] font-semibold" style={{ color: ink }}>
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
        if (o) o.style.opacity = String(Math.max(0, 1 - p * 2.1));
      },
      onFail,
    });
    handleRef.current = handle;
    return () => {
      handle?.dispose();
      handleRef.current = null;
    };
  }, [mode, ev, rule, onFail]);

  const onEnter = (e) => {
    if (!CAN_HOVER || e.pointerType === "touch") return;
    hoverRef.current = true;
    sync();
  };
  const onLeave = () => {
    hoverRef.current = false;
    pressRef.current = false;
    handleRef.current?.resetTilt();
    sync();
  };
  const onDown = () => {
    pressRef.current = true;
    sync();
  };
  const onUp = () => {
    pressRef.current = false;
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
  const onMove = (e) => {
    if (!CAN_HOVER || e.pointerType === "touch") return;
    const el = elRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    handleRef.current?.setTilt(
      (e.clientX - r.left) / r.width - 0.5,
      (e.clientY - r.top) / r.height - 0.5,
    );
  };

  const is3d = mode === "3d";

  return (
    <button
      ref={elRef}
      type="button"
      data-paper-card="1"
      className={`group relative aspect-[5/7] min-h-[208px] touch-manipulation overflow-hidden rounded-2xl text-left transition-[opacity,scale,box-shadow] duration-300 ${
        hit
          ? "z-10 scale-[1.03] animate-pulse-hit shadow-[0_0_0_3px_rgba(255,255,255,.85),0_0_0_7px_rgba(54,228,255,.85)]"
          : is3d
            ? "shadow-xl shadow-black/20 hover:shadow-2xl focus-visible:shadow-2xl"
            : "border border-black/10 bg-paper shadow-xl shadow-black/15 hover:-translate-y-1.5 hover:rotate-[-0.6deg] hover:scale-[1.02] active:scale-[.98] motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-0 motion-reduce:hover:scale-100"
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
      <span ref={overlayRef} className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-white/80 px-3 py-1.5 text-[11px] font-extrabold text-ink shadow-sm backdrop-blur-sm transition-transform duration-200 group-hover:translate-x-0.5">
          View rules
          <ArrowRight className="size-3" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}

export default PaperCrumpleEventCard;
