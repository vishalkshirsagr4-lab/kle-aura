import { useState, useEffect, useCallback, useLayoutEffect, useRef } from "react";
import {
  Star,
  X as FaXmark,
  ChevronLeft as FaChevronLeft,
  ChevronRight as FaChevronRight,
  CheckCircle2 as FaCircleCheck,
  ArrowRight as FaArrowRight,
  AlertTriangle as FaTriangleExclamation,
  Sparkles as FaWandMagicSparkles,
  Mic as FaMicrophone,
  Palette as FaPalette,
  Puzzle as FaPuzzlePiece,
  Bot as FaRobot,
  PenTool as FaPenNib,
  Video as FaVideo,
  Layers,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createPortal } from "react-dom";
import events from "../data/events";
import { RULES, GROUPS } from "../data/rules";
import EventCard from "./events/EventCard";
import { loadPaperAsset } from "../three/paperAsset";
import {
  initPaperCards,
  disposePaperCards,
} from "../three/paperCardManager";
import { disposePaperTextures } from "../three/paperTexture";

gsap.registerPlugin(ScrollTrigger);

const prefersReduced = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Portals keep dialogs at the top document layer above sticky navigation */
const overlay = (node) => createPortal(node, document.body);

// Interests -> matching event ids
const INTERESTS = [
  {
    key: "stage",
    label: "I love performing",
    Icon: FaMicrophone,
    ids: [2, 10, 11, 17, 18],
  },
  {
    key: "craft",
    label: "I'm creative with arts",
    Icon: FaPalette,
    ids: [3, 7, 12],
  },
  {
    key: "brain",
    label: "Puzzles & quizzes",
    Icon: FaPuzzlePiece,
    ids: [1, 5, 13, 4],
  },
  {
    key: "ai",
    label: "AI & tech enthusiast",
    Icon: FaRobot,
    ids: [13, 14, 15, 4],
  },
  {
    key: "words",
    label: "Creative writing",
    Icon: FaPenNib,
    ids: [6, 11, 16],
  },
  {
    key: "media",
    label: "Content creator",
    Icon: FaVideo,
    ids: [8, 9, 14, 15],
  },
];

const GRAD = {
  Stage: "linear-gradient(135deg,#6d3df0,#4f7cff)",
  "Art & Craft": "linear-gradient(135deg,#8b5cf6,#c06bff)",
  Writing: "linear-gradient(135deg,#2563eb,#36c6ff)",
  "Quiz & Logic": "linear-gradient(135deg,#3b4fe0,#4f7cff)",
  "AI & Digital": "linear-gradient(135deg,#0ea5c9,#36e4ff)",
};

function EventExplorer({ onSelect }) {
  const [group, setGroup] = useState("All");
  const [picked, setPicked] = useState([]);
  const [sheet, setSheet] = useState(null); // selected event id for details sheet
  const [mode3d, setMode3d] = useState(
    prefersReduced() ? "fallback" : "pending",
  );

  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const sheetRef = useRef(null);
  const backdropRef = useRef(null);
  const assetStarted = useRef(false);

  const matched = new Set(
    INTERESTS.filter((i) => picked.includes(i.key)).flatMap((i) => i.ids),
  );
  const list = RULES.filter((r) => group === "All" || r.group === group);
  const current = sheet ? RULES.find((r) => r.id === sheet) : null;
  const currentEv = sheet ? events.find((e) => e.id === sheet) : null;

  const toggle = (k) =>
    setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  const step = useCallback(
    (d) => setSheet((id) => ((id - 1 + d + 18) % 18) + 1),
    [],
  );

  const register = (name) => {
    onSelect(name);
    setSheet(null);
    setTimeout(() => {
      document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  // Lazy-load the Three.js VAT paper assets when approaching section
  useEffect(() => {
    if (prefersReduced()) return undefined;
    const el = sectionRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      if (el && !assetStarted.current) {
        assetStarted.current = true;
        loadPaperAsset()
          .then((animData) => {
            setMode3d(initPaperCards(animData) ? "3d" : "fallback");
          })
          .catch((error) => {
            console.warn("3D paper asset failed; using high-fidelity fallback.", error);
            setMode3d("fallback");
          });
      }
      return undefined;
    }

    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || assetStarted.current) return;
        assetStarted.current = true;
        io.disconnect();
        loadPaperAsset()
          .then((animData) => {
            if (cancelled) return;
            setMode3d(initPaperCards(animData) ? "3d" : "fallback");
          })
          .catch((error) => {
            if (cancelled) return;
            console.warn("3D paper asset failed; using high-fidelity fallback.", error);
            setMode3d("fallback");
          });
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);

  // Cleanup 3D resources on unmount
  useEffect(() => {
    return () => {
      disposePaperCards();
      disposePaperTextures();
    };
  }, []);

  // Restrained GSAP entrance animation for event cards
  useLayoutEffect(() => {
    if (prefersReduced() || !gridRef.current) return undefined;

    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll("[data-event-card]");
      if (!cards || !cards.length) return;

      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.035,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 90%",
            once: true,
          },
          clearProps: "opacity,transform",
        },
      );
    }, gridRef);

    return () => ctx.revert();
  }, [group]);

  // Modal sheet presentation animation
  useLayoutEffect(() => {
    if (!sheet || prefersReduced() || !sheetRef.current) return undefined;

    const tl = gsap.timeline();
    tl.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.22, ease: "power1.out" },
      0,
    ).fromTo(
      sheetRef.current,
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" },
      0,
    );

    return () => tl.kill();
  }, [sheet]);

  // Keyboard navigation & focus trap for detail modal
  useEffect(() => {
    if (!sheet) return undefined;
    const dialog = sheetRef.current;
    const opener =
      dialog && dialog.contains(document.activeElement)
        ? null
        : document.activeElement;
    dialog?.focus?.({ preventScroll: true });

    const FOCUSABLE =
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

    const onKey = (e) => {
      if (e.key === "Escape") {
        setSheet(null);
        return;
      }
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);

      if (e.key !== "Tab" || !dialog) return;
      const items = [...dialog.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const inside = dialog.contains(document.activeElement);

      if (e.shiftKey && (!inside || document.activeElement === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || document.activeElement === last)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (opener && typeof opener.focus === "function") {
        opener.focus({ preventScroll: true });
      }
    };
  }, [sheet, step]);

  const handle3dFail = useCallback(() => setMode3d("fallback"), []);

  return (
    <section id="events" ref={sectionRef} className="py-6 sm:py-8">
      {/* ================= SECTION HEADER ================= */}
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="section-heading text-xl sm:text-2xl">
            <Star className="text-accent fill-accent/20 size-6" /> Explore the Events
          </h2>
          <p className="mt-1.5 text-xs text-muted sm:text-sm">
            18 competitive tech, AI, art, and stage competitions designed for PUC students.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground/80 shadow-xs">
          <Layers className="size-3.5 text-accent" />
          <span>Interactive 3D Posters</span>
        </div>
      </div>

      {/* ================= INTEREST FINDER ================= */}
      <div className="mb-6 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-primary sm:text-base">
          <FaWandMagicSparkles className="text-cyan size-4" /> Find your perfect event in 10 seconds
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {INTERESTS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              className={`inline-flex min-h-11 w-full min-w-0 items-center justify-start gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold leading-tight transition hover:-translate-y-0.5 sm:w-auto sm:px-4 sm:text-sm ${
                picked.includes(key)
                  ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                  : "border-border bg-surface text-foreground hover:border-primary/50 hover:bg-primary/5"
              }`}
              onClick={() => toggle(key)}
              aria-pressed={picked.includes(key)}
            >
              <Icon className="size-4 shrink-0" /> <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs font-medium text-muted" aria-live="polite">
          {picked.length === 0
            ? "Tap an interest above to highlight matching competitions."
            : `${matched.size} event${matched.size === 1 ? "" : "s"} matched your interests and highlighted below.`}
        </p>
      </div>

      {/* ================= CATEGORY FILTER TABS ================= */}
      <div
        className="mb-6 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filter events by category"
      >
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={g === group}
            className={`min-h-11 shrink-0 snap-start rounded-xl border px-4 py-2.5 text-xs font-bold transition sm:text-sm ${
              g === group
                ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-primary/5"
            }`}
            onClick={() => setGroup(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* ================= RESPONSIVE EVENTS GRID ================= */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6"
      >
        {list.map((r) => {
          const ev = events.find((e) => e.id === r.id);
          const hit = matched.has(r.id);
          const dim = picked.length > 0 && !hit;
          return (
            <EventCard
              key={r.id}
              event={ev}
              rule={r}
              hit={hit}
              dimmed={dim}
              mode={mode3d}
              onViewRules={setSheet}
              onRegister={register}
              onFail={handle3dFail}
            />
          );
        })}
      </div>

      {/* ================= EVENT RULES MODAL ================= */}
      {current && overlay(
        <div
          ref={backdropRef}
          className="fixed inset-0 z-[1200] flex items-end justify-center bg-slate-900/80 p-0 sm:p-4 backdrop-blur-sm md:items-center"
          onClick={() => setSheet(null)}
          role="presentation"
        >
          <div
            ref={sheetRef}
            className="flex max-h-[92dvh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={currentEv?.name}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="relative px-5 pb-5 pt-6 text-white sm:px-6"
              style={{ background: GRAD[current.group] || "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
            >
              <button
                type="button"
                className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-black/30 text-white transition hover:bg-black/50"
                aria-label="Close rules sheet"
                onClick={() => setSheet(null)}
              >
                <FaXmark className="size-5" />
              </button>

              <span className="grid size-14 place-items-center rounded-2xl bg-white/20 text-2xl shadow-sm sm:size-16 sm:text-3xl">
                {(() => {
                  const I = currentEv?.icon;
                  return I ? <I /> : null;
                })()}
              </span>

              <small className="mt-3 block text-xs font-bold tracking-wider opacity-90">
                EVENT {String(current.id).padStart(2, "0")} OF 18 · {current.type}
              </small>

              <h3 className="my-1.5 max-w-[calc(100%-2.5rem)] text-xl font-black leading-tight sm:text-2xl">
                {currentEv?.name}
              </h3>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {current.proposed && (
                  <span className="rounded-md bg-amber-400 px-2.5 py-0.5 text-xs font-extrabold text-amber-950">
                    Proposed
                  </span>
                )}
                {current.chips.map((c) => (
                  <span
                    className="rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-bold backdrop-blur-xs"
                    key={c}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Content */}
            <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted mb-3">
                Official Competition Rules
              </h4>
              <ul className="mb-5 grid list-none gap-3 p-0 text-sm">
                {current.rules.map((t, idx) => (
                  <li className="flex gap-3 leading-relaxed text-foreground" key={idx}>
                    <FaCircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-foreground">
                <span className="font-bold text-accent">Judging Focus:</span> {current.judging}
              </div>

              {current.proposed && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs font-semibold text-amber-900 dark:text-amber-300">
                  <FaTriangleExclamation className="size-4 shrink-0" />
                  <span>Proposed event format, subject to organizing committee final confirmation.</span>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center gap-2 border-t border-border bg-slate-50/50 dark:bg-slate-900/50 p-3 sm:p-4">
              <button
                type="button"
                className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-surface text-primary transition hover:bg-accent hover:text-white"
                aria-label="Previous event rules"
                onClick={() => step(-1)}
              >
                <FaChevronLeft className="size-5" />
              </button>

              <button
                type="button"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-primary px-4 py-2.5 text-sm font-extrabold text-white shadow-md shadow-accent/25 transition hover:opacity-95"
                onClick={() => register(currentEv?.name)}
              >
                <span>Register for this Event</span>
                <FaArrowRight className="size-4" />
              </button>

              <button
                type="button"
                className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-surface text-primary transition hover:bg-accent hover:text-white"
                aria-label="Next event rules"
                onClick={() => step(1)}
              >
                <FaChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default EventExplorer;
