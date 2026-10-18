import { useState, useEffect, useCallback, useLayoutEffect, useRef } from "react";
import {
  Star as FaStar,
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
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createPortal } from "react-dom";
import events from "../data/events";
import { RULES, GROUPS } from "../data/rules";
import PaperCrumpleEventCard from "./PaperCrumpleEventCard";
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

/* Portals keep dialogs at the page layer, above sticky navigation, toasts,
   and the shared card canvas. */
const overlay = (node) => createPortal(node, document.body);

// Interests -> matching event ids (used by the "Find your event" picker)
const INTERESTS = [
  {
    key: "stage",
    label: "I love performing",
    Icon: FaMicrophone,
    ids: [2, 10, 11, 17, 18],
  },
  {
    key: "craft",
    label: "I'm creative with my hands",
    Icon: FaPalette,
    ids: [3, 7, 12],
  },
  {
    key: "brain",
    label: "I love puzzles & quizzes",
    Icon: FaPuzzlePiece,
    ids: [1, 5, 13, 4],
  },
  {
    key: "ai",
    label: "I'm into AI & tech",
    Icon: FaRobot,
    ids: [13, 14, 15, 4],
  },
  { key: "words", label: "I love words", Icon: FaPenNib, ids: [6, 11, 16] },
  { key: "media", label: "I make content", Icon: FaVideo, ids: [8, 9, 14, 15] },
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
  const [sheet, setSheet] = useState(null); // event id
  // "pending" -> CSS paper cards; "3d" -> shared VAT paper-crumple renderer
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
    setTimeout(
      () =>
        document
          .getElementById("register")
          ?.scrollIntoView({ behavior: "smooth" }),
      80,
    );
  };

  // Lazy-boot the3D paper system once the section nears the viewport
  useEffect(() => {
    if (prefersReduced()) return undefined;
    const el = sectionRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      // no IO: boot right away
      if (el && !assetStarted.current) {
        assetStarted.current = true;
        loadPaperAsset()
          .then((animData) => {
            setMode3d(initPaperCards(animData) ? "3d" : "fallback");
          })
          .catch((error) => {
            console.error(
              "Unable to load event-card 3D assets; using CSS cards instead.",
              error,
            );
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
            console.error(
              "Unable to load event-card 3D assets; using CSS cards instead.",
              error,
            );
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

  // Tear the shared renderer down when the portal unmounts
  useEffect(
    () => () => {
      disposePaperCards();
      disposePaperTextures();
    },
    [],
  );

  // One-time staggered card entrance when the grid first scrolls into view
  useLayoutEffect(() => {
    if (prefersReduced() || !gridRef.current) return undefined;
    const ctx = gsap.context(() => {
      const cards = gridRef.current.querySelectorAll("[data-paper-card]");
      if (!cards.length) return;
      gsap.set(cards, { opacity: 0, y: 30, rotate: -1.2 });
      ScrollTrigger.create({
        trigger: gridRef.current,
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            rotate: 0,
            duration: 0.55,
            stagger: 0.045,
            ease: "power2.out",
            clearProps: "transform,opacity",
          });
        },
      });
    }, gridRef);
    return () => ctx.revert();
  }, []);

  // GSAP sheet presentation (skipped for reduced motion -> CSS handles it)
  useLayoutEffect(() => {
    if (!sheet || prefersReduced() || !sheetRef.current) return undefined;
    const tl = gsap.timeline();
    tl.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "power1.out" },
      0,
    ).fromTo(
      sheetRef.current,
      { y: 48, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.42, ease: "power3.out" },
      0,
    );
    return () => {
      tl.kill();
    };
  }, [sheet]);

  useEffect(() => {
    if (!sheet) return undefined;
    const dialog = sheetRef.current;
    // Stepping between events re-runs this effect; only remember the opener
    // while focus is still outside the sheet.
    const opener =
      dialog && dialog.contains(document.activeElement)
        ? null
        : document.activeElement;
    dialog?.focus?.({ preventScroll: true });
    const FOCUSABLE =
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const key = (e) => {
      if (e.key === "Escape") {
        setSheet(null);
        return;
      }
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key !== "Tab" || !dialog) return;
      // Keep keyboard focus inside the sheet while it is modal
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
    window.addEventListener("keydown", key);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = "";
      if (opener && typeof opener.focus === "function") {
        opener.focus({ preventScroll: true });
      }
    };
  }, [sheet, step]);

  const handle3dFail = useCallback(() => setMode3d("fallback"), []);

  return (
    <section id="events" ref={sectionRef}>
      <div className="mb-5 flex flex-col items-start gap-2 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-4">
        <h2 className="section-heading text-lg sm:text-xl">
          <FaStar className="text-accent" /> Explore the events
        </h2>
        <p className="text-xs leading-relaxed text-muted sm:text-sm">
          Tap any card for its rules. On phones, press and drag for a paper-like tilt.
        </p>
      </div>

      <div className="mb-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:mb-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-base font-bold text-primary sm:text-lg">
          <FaWandMagicSparkles className="text-cyan" /> Find your event in 10
          seconds
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {INTERESTS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              className={`inline-flex min-h-11 w-full min-w-0 items-center justify-start gap-2 rounded-xl border px-2.5 py-2.5 text-left text-[11px] font-semibold leading-tight transition hover:-translate-y-0.5 sm:w-auto sm:px-4 sm:text-sm ${picked.includes(key) ? "border-primary bg-primary text-white shadow-md shadow-primary/20" : "border-border bg-surface text-foreground hover:border-primary/50 hover:bg-primary/5"}`}
              onClick={() => toggle(key)}
              aria-pressed={picked.includes(key)}
            >
              <Icon className="size-4" /> <span className="min-w-0">{label}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold leading-relaxed text-muted sm:text-sm" aria-live="polite">
          {picked.length === 0
            ? "Tap what describes you. We'll light up your best events."
            : `${matched.size} event${matched.size === 1 ? "" : "s"} match you. They are highlighted below.`}
        </p>
      </div>

      <div
        className="mb-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filter events"
      >
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={g === group}
            className={`min-h-11 shrink-0 snap-start rounded-xl border px-3 py-2.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${g === group ? "border-primary bg-primary text-white shadow-md shadow-primary/20" : "border-border bg-surface text-foreground hover:border-primary/50"}`}
            onClick={() => setGroup(g)}
          >
            {g}
          </button>
        ))}
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] sm:gap-4 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]"
      >
        {list.map((r) => {
          const ev = events.find((e) => e.id === r.id);
          const hit = matched.has(r.id);
          const dim = picked.length > 0 && !hit;
          return (
            <PaperCrumpleEventCard
              key={r.id}
              ev={ev}
              rule={r}
              hit={hit}
              dimmed={dim}
              mode={mode3d}
              onOpen={setSheet}
              onFail={handle3dFail}
            />
          );
        })}
      </div>

      {current && overlay(
        <div
          ref={backdropRef}
          className="fixed inset-0 z-[1200] flex items-end justify-center bg-slate-900/75 backdrop-blur-sm md:items-center"
          onClick={() => setSheet(null)}
        >
          <div
            ref={sheetRef}
            className="flex max-h-[min(92dvh,900px)] w-full max-w-[620px] flex-col overflow-hidden rounded-t-2xl bg-bg shadow-[0_-20px_60px_rgba(0,0,0,.45)] motion-reduce:opacity-100 md:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={currentEv.name}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative px-4 pb-4 pt-5 text-white sm:px-6 sm:pb-5 sm:pt-6"
              style={{ background: GRAD[current.group] }}
            >
              <button
                type="button"
                className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-black/35 text-white"
                aria-label="Close"
                onClick={() => setSheet(null)}
              >
                <FaXmark />
              </button>
              <span className="grid size-14 place-items-center rounded-2xl bg-white/25 text-2xl sm:size-16 sm:text-3xl">
                {(() => {
                  const I = currentEv.icon;
                  return <I />;
                })()}
              </span>
              <small className="mt-3 block text-xs font-bold tracking-wide opacity-90">
                EVENT {String(current.id).padStart(2, "0")} OF 18 ·{" "}
                {current.type}
              </small>
              <h3 className="my-1 max-w-[calc(100%-2.75rem)] text-xl font-extrabold leading-tight sm:text-2xl">
                {currentEv.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {current.proposed && (
                  <em className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold not-italic text-amber-950">
                    Proposed
                  </em>
                )}
                {current.chips.map((c) => (
                  <em
                    className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold not-italic"
                    key={c}
                  >
                    {c}
                  </em>
                ))}
              </div>
            </div>
            <div className="min-h-0 overflow-y-auto overscroll-contain px-4 pb-2 pt-4 sm:px-6 sm:pt-5">
              <ul className="mb-4 grid list-none gap-3 p-0 text-sm sm:text-base">
                {current.rules.map((t) => (
                  <li
                    className="flex gap-2.5 leading-relaxed text-foreground"
                    key={t}
                  >
                    <FaCircleCheck className="mt-1 shrink-0 text-emerald-600" />{" "}
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <p className="rounded-xl bg-accent/10 p-3 text-sm text-foreground">
                <b>Judging focus:</b> {current.judging}
              </p>
              {current.proposed && (
                <p className="flex items-center gap-2 rounded-xl bg-amber-500/20 p-3 text-sm font-semibold text-amber-900">
                  <FaTriangleExclamation /> Proposed format, subject to
                  organising committee approval.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 border-t border-border px-3 pb-[calc(.75rem+env(safe-area-inset-bottom,0px))] pt-3 sm:gap-3 sm:px-5 sm:pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
              <button
                type="button"
                className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-surface text-primary hover:bg-accent hover:text-white sm:size-11"
                aria-label="Previous event"
                onClick={() => step(-1)}
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-br from-cyan to-[#9db4ff] px-2 py-3 text-xs font-extrabold text-obsidian sm:gap-2 sm:px-4 sm:text-base"
                onClick={() => register(currentEv.name)}
              >
                <span className="truncate">Register for this event</span> <FaArrowRight />
              </button>
              <button
                type="button"
                className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-surface text-primary hover:bg-accent hover:text-white sm:size-11"
                aria-label="Next event"
                onClick={() => step(1)}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default EventExplorer;
