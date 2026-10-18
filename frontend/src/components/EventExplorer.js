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
          .catch(() => setMode3d("fallback"));
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
          .catch(() => {
            if (!cancelled) setMode3d("fallback");
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
    const key = (e) => {
      if (e.key === "Escape") setSheet(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", key);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = "";
    };
  }, [sheet, step]);

  const handle3dFail = useCallback(() => setMode3d("fallback"), []);

  return (
    <section id="events" ref={sectionRef} className="scroll-mt-4">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="flex items-center gap-2 border-l-[6px] border-accent pl-4 text-2xl font-extrabold sm:text-3xl">
          <FaStar className="text-accent" /> 18 EVENTS. ONE STAGE.
        </h2>
        <p className="text-sm text-muted">
          Find where you shine, then tap any card to see the rules
        </p>
      </div>

      <div className="mb-5 rounded-2xl border border-border bg-surface p-5 shadow-xl shadow-black/10">
        <div className="mb-3 flex items-center gap-2 text-lg font-extrabold text-primary">
          <FaWandMagicSparkles className="text-cyan" /> Find your event in 10
          seconds
        </div>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 font-semibold transition hover:-translate-y-0.5 ${picked.includes(key) ? "border-transparent bg-gradient-to-br from-primary to-cyan text-white shadow-lg shadow-cyan/30" : "border-border bg-transparent text-foreground"}`}
              onClick={() => toggle(key)}
              aria-pressed={picked.includes(key)}
            >
              <Icon /> {label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm font-semibold text-muted" aria-live="polite">
          {picked.length === 0
            ? "Tap what describes you. We'll light up your best events."
            : `${matched.size} event${matched.size === 1 ? "" : "s"} match you. They are highlighted below.`}
        </p>
      </div>

      <div
        className="flex gap-2 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filter events"
      >
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={g === group}
            className={`min-h-11 shrink-0 rounded-full border px-4 py-2.5 font-semibold ${g === group ? "border-accent bg-accent text-white shadow-lg shadow-black/10" : "border-border bg-surface text-foreground"}`}
            onClick={() => setGroup(g)}
          >
            {g}
          </button>
        ))}
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] sm:gap-4 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]"
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

      {current && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-[1200] flex items-end justify-center bg-slate-900/75 backdrop-blur-sm md:items-center"
          onClick={() => setSheet(null)}
        >
          <div
            ref={sheetRef}
            className="flex max-h-[92vh] w-full max-w-[620px] flex-col overflow-hidden rounded-t-2xl bg-bg shadow-[0_-20px_60px_rgba(0,0,0,.45)] motion-reduce:opacity-100 md:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={currentEv.name}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative px-6 pb-5 pt-6 text-white"
              style={{ background: GRAD[current.group] }}
            >
              <button
                type="button"
                className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-black/35 text-white"
                aria-label="Close"
                onClick={() => setSheet(null)}
              >
                <FaXmark />
              </button>
              <span className="grid size-16 place-items-center rounded-2xl bg-white/25 text-3xl">
                {(() => {
                  const I = currentEv.icon;
                  return <I />;
                })()}
              </span>
              <small className="mt-3 block text-xs font-bold tracking-wide opacity-90">
                EVENT {String(current.id).padStart(2, "0")} OF 18 ·{" "}
                {current.type}
              </small>
              <h3 className="my-1 text-2xl font-extrabold leading-tight">
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
            <div className="overflow-y-auto px-6 pb-2 pt-5">
              <ul className="mb-4 grid list-none gap-3 p-0">
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
            <div className="flex items-center gap-3 border-t border-border px-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-3">
              <button
                type="button"
                className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-surface text-primary hover:bg-accent hover:text-white"
                aria-label="Previous event"
                onClick={() => step(-1)}
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-cyan to-[#9db4ff] px-4 py-3 font-extrabold text-obsidian"
                onClick={() => register(currentEv.name)}
              >
                Register for this event <FaArrowRight />
              </button>
              <button
                type="button"
                className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-surface text-primary hover:bg-accent hover:text-white"
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
