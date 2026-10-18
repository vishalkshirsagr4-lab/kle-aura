import { useState, useEffect, useCallback, useLayoutEffect, useRef, useMemo } from "react";
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
  Orbit,
  Search,
  Heart,
  Volume2,
  VolumeX,
  Share2,
  Check,
  Clock,
  Users,
  Compass,
  Play,
  Pause,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createPortal } from "react-dom";
import events from "../data/events";
import { RULES, GROUPS } from "../data/rules";
import EventCard from "./events/EventCard";
import ThreeDCarousel from "./events/ThreeDCarousel";
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

// Synthesized clean web audio click
function playTone(enabled, type = "click") {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "pop") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (_) {}
}

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
  const [previewEvent, setPreviewEvent] = useState(null); // event for full poster preview
  const [searchQuery, setSearchQuery] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [mode3d, setMode3d] = useState(
    prefersReduced() ? "fallback" : "pending",
  );
  const [showCarousel, setShowCarousel] = useState(false);
  const [showMatchmaker, setShowMatchmaker] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Saved / Bookmarked events stored in localStorage
  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("aura_saved_events") || "[]");
    } catch {
      return [];
    }
  });

  const toggleSave = useCallback((id) => {
    setSavedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      try {
        localStorage.setItem("aura_saved_events", JSON.stringify(next));
      } catch (_) {}
      return next;
    });
    playTone(soundEnabled, "pop");
  }, [soundEnabled]);

  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const sheetRef = useRef(null);
  const backdropRef = useRef(null);
  const lightboxRef = useRef(null);
  const assetStarted = useRef(false);

  const matched = new Set(
    INTERESTS.filter((i) => picked.includes(i.key)).flatMap((i) => i.ids),
  );

  // Filter list by category, search term, and saved state
  const list = useMemo(() => {
    return RULES.filter((r) => {
      // Category filter
      if (group === "Saved") {
        if (!savedIds.includes(r.id)) return false;
      } else if (group !== "All" && r.group !== group) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const ev = events.find((e) => e.id === r.id);
        const nameMatch = ev?.name.toLowerCase().includes(q);
        const catMatch = ev?.category.toLowerCase().includes(q);
        const groupMatch = r.group.toLowerCase().includes(q);
        const typeMatch = r.type.toLowerCase().includes(q);
        const taglineMatch = ev?.tagline?.toLowerCase().includes(q);
        const chipsMatch = r.chips?.some((c) => c.toLowerCase().includes(q));
        const rulesMatch = r.rules?.some((rl) => rl.toLowerCase().includes(q));
        return (
          nameMatch ||
          catMatch ||
          groupMatch ||
          typeMatch ||
          taglineMatch ||
          chipsMatch ||
          rulesMatch
        );
      }
      return true;
    });
  }, [group, searchQuery, savedIds]);

  const current = sheet ? RULES.find((r) => r.id === sheet) : null;
  const currentEv = sheet ? events.find((e) => e.id === sheet) : null;

  const toggle = (k) => {
    playTone(soundEnabled, "click");
    setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  };

  const handleGroupSelect = (g) => {
    playTone(soundEnabled, "click");
    setGroup(g);
  };

  const step = useCallback(
    (d) => {
      playTone(soundEnabled, "click");
      setSheet((id) => ((id - 1 + d + 18) % 18) + 1);
    },
    [soundEnabled],
  );

  const stepPreview = useCallback(
    (d) => {
      if (!previewEvent) return;
      playTone(soundEnabled, "click");
      const nextId = ((previewEvent.id - 1 + d + 18) % 18) + 1;
      const nextEv = events.find((e) => e.id === nextId);
      if (nextEv) setPreviewEvent(nextEv);
    },
    [previewEvent, soundEnabled],
  );

  const register = (name) => {
    playTone(soundEnabled, "pop");
    onSelect(name);
    setSheet(null);
    setPreviewEvent(null);
    setTimeout(() => {
      document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const handleSharePoster = (ev) => {
    const text = `Join ${ev.name} at AI-AURA 2K26 Festival (KLE BCA & BBA)! Details at https://kle-aura.vercel.app`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
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

  // 3D cascade entrance animation for event cards
  useLayoutEffect(() => {
    if (prefersReduced() || !gridRef.current) return undefined;

    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll("[data-event-card]");
      if (!cards || !cards.length) return;

      gsap.fromTo(
        cards,
        { opacity: 0, y: 32, rotateX: 12, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.03,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 90%",
            once: true,
          },
          clearProps: "opacity",
        },
      );
    }, gridRef);

    return () => ctx.revert();
  }, [group, searchQuery]);

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

  // Lightbox presentation animation
  useLayoutEffect(() => {
    if (!previewEvent || prefersReduced() || !lightboxRef.current) return undefined;
    gsap.fromTo(
      lightboxRef.current,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.28, ease: "power2.out" }
    );
  }, [previewEvent]);

  // Keyboard navigation & focus trap for detail modal & lightbox
  useEffect(() => {
    if (!sheet && !previewEvent) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") {
        setSheet(null);
        setPreviewEvent(null);
        return;
      }
      if (e.key === "ArrowRight") {
        if (sheet) step(1);
        if (previewEvent) stepPreview(1);
      }
      if (e.key === "ArrowLeft") {
        if (sheet) step(-1);
        if (previewEvent) stepPreview(-1);
      }
    };

    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [sheet, previewEvent, step, stepPreview]);

  const handle3dFail = useCallback(() => setMode3d("fallback"), []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: RULES.length, Saved: savedIds.length };
    GROUPS.forEach((g) => {
      if (g !== "All") {
        counts[g] = RULES.filter((r) => r.group === g).length;
      }
    });
    return counts;
  }, [savedIds]);

  return (
    <section id="events" ref={sectionRef} className="py-6 sm:py-10">
      {/* ================= COMPACT FESTIVAL HIGHLIGHTS RIBBON ================= */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.06] via-accent/[0.04] to-cyan/[0.06] p-2.5 sm:p-3 text-center">
        <div className="flex flex-col items-center justify-center p-1">
          <span className="text-lg sm:text-2xl font-black text-primary">18</span>
          <span className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider">
            Flagship Events
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-1 border-l border-border/50">
          <span className="text-lg sm:text-2xl font-black text-accent">₹50K+</span>
          <span className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider">
            Prizes &amp; Trophies
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-1 border-t sm:border-t-0 sm:border-l border-border/50">
          <span className="text-lg sm:text-2xl font-black text-cyan">5 Tracks</span>
          <span className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider">
            AI, Stage, Arts &amp; Logic
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-1 border-t sm:border-t-0 border-l border-border/50">
          <span className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            PU Colleges
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider">
            All PU Streams Open
          </span>
        </div>
      </div>

      {/* ================= SECTION HEADER & VIEW CONTROLS ================= */}
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="section-heading text-xl sm:text-2xl md:text-3xl font-black flex items-center gap-2">
            <Star className="text-accent fill-accent/20 size-6 sm:size-7" />
            <span>Explore the Events</span>
          </h2>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Discover 18 state-level competitions with interactive 3D cards.
          </p>
        </div>

        {/* Action controls: Play 3D Showcase & Interactive Audio */}
        <div className="flex items-center gap-2">
          {/* Play 3D Button */}
          <button
            type="button"
            onClick={() => {
              playTone(soundEnabled, "pop");
              setShowCarousel((prev) => !prev);
            }}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-extrabold shadow-xs transition-all duration-200 ${
              showCarousel
                ? "border-accent bg-accent text-white shadow-accent/25 ring-2 ring-accent/30"
                : "border-primary/40 bg-gradient-to-r from-primary/10 to-accent/10 text-primary hover:from-primary hover:to-accent hover:text-white"
            }`}
            title={showCarousel ? "Close 3D View" : "Play 3D Auto-Rotating Events Showcase"}
            aria-pressed={showCarousel}
          >
            {showCarousel ? (
              <Pause className="size-3.5 fill-current" />
            ) : (
              <Play className="size-3.5 fill-current" />
            )}
            <span>{showCarousel ? "Close 3D" : "Play 3D"}</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              playTone(next, "pop");
            }}
            className={`grid size-8 place-items-center rounded-xl border shadow-xs transition ${
              soundEnabled
                ? "border-accent bg-accent/15 text-accent"
                : "border-border bg-surface text-muted hover:text-foreground"
            }`}
            title={soundEnabled ? "Mute interactive audio" : "Enable interactive audio"}
            aria-label={soundEnabled ? "Audio On" : "Audio Off"}
          >
            {soundEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* ================= OPTIONAL 3D ORBIT SHOWCASE ================= */}
      {showCarousel && (
        <div className="mb-6 rounded-3xl border border-accent/30 bg-gradient-to-b from-primary/[0.04] to-surface p-3 sm:p-5 shadow-inner">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <Orbit className="size-3.5" />
              <span>Interactive 3D Carousel Arena</span>
            </span>
            <button
              type="button"
              onClick={() => setShowCarousel(false)}
              className="text-xs font-bold text-muted hover:text-foreground"
            >
              Close
            </button>
          </div>
          <ThreeDCarousel
            events={events}
            rules={RULES}
            savedIds={savedIds}
            onToggleSave={toggleSave}
            onPreviewPoster={setPreviewEvent}
            onViewRules={setSheet}
            onRegister={register}
          />
        </div>
      )}

      {/* ================= SEARCH & SMART FILTER BAR ================= */}
      <div className="mb-3.5 flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 18 events by title, keyword, team size, or rules..."
            className="w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-10 text-xs sm:text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid size-5 place-items-center rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
              aria-label="Clear search"
            >
              <FaXmark className="size-3" />
            </button>
          )}
        </div>

        {/* Quick Search Tag Pills + Matchmaker Button */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs text-muted shrink-0">
          <button
            type="button"
            onClick={() => setShowMatchmaker((prev) => !prev)}
            className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition shadow-xs flex items-center gap-1 ${
              showMatchmaker || picked.length > 0
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/80 bg-surface text-foreground/80 hover:border-primary/50"
            }`}
          >
            <FaWandMagicSparkles className="size-3 text-accent" />
            <span>Matchmaker</span>
            {picked.length > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.2 text-[9px] font-extrabold text-white">
                {matched.size}
              </span>
            )}
          </button>

          <span className="font-semibold text-[11px] uppercase tracking-wide ml-1">Quick:</span>
          {["AI", "Dance", "Quiz", "Art", "Stage"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSearchQuery(tag);
                playTone(soundEnabled, "click");
              }}
              className="rounded-lg border border-border/80 bg-surface px-2 py-1 text-[11px] font-bold text-foreground/80 hover:border-primary hover:text-primary transition shadow-xs"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* ================= COLLAPSIBLE INTEREST FINDER ================= */}
      {(showMatchmaker || picked.length > 0) && (
        <div className="mb-4 rounded-2xl border border-border bg-surface p-3.5 shadow-xs transition-all">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary sm:text-sm">
              <FaWandMagicSparkles className="text-accent size-3.5" />
              <span>Interactive Matchmaker: Tap your strengths</span>
            </div>
            {picked.length > 0 && (
              <button
                type="button"
                onClick={() => setPicked([])}
                className="text-[11px] font-semibold text-muted hover:text-foreground transition underline"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
            {INTERESTS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                className={`inline-flex min-h-9 w-full min-w-0 items-center justify-start gap-1.5 rounded-lg border px-2.5 py-1 text-left text-xs font-semibold leading-tight transition sm:w-auto ${
                  picked.includes(key)
                    ? "border-primary bg-primary text-white shadow-xs"
                    : "border-border bg-surface text-foreground hover:border-primary/50"
                }`}
                onClick={() => toggle(key)}
                aria-pressed={picked.includes(key)}
              >
                <Icon className="size-3.5 shrink-0" />
                <span className="truncate text-[11px] sm:text-xs">{label}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] font-medium text-muted" aria-live="polite">
            {picked.length === 0
              ? "Tap any interest above to illuminate matching competitions below."
              : `${matched.size} event${matched.size === 1 ? "" : "s"} matched your creative strengths and highlighted below.`}
          </p>
        </div>
      )}

      {/* ================= CATEGORY FILTER TABS WITH COUNTERS ================= */}
      <div
        className="mb-3.5 flex snap-x snap-mandatory gap-1.5 overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filter events by category"
      >
        {GROUPS.map((g) => {
          const count = categoryCounts[g] ?? 0;
          return (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={g === group}
              className={`min-h-9 shrink-0 snap-start rounded-xl border px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                g === group
                  ? "border-primary bg-primary text-white shadow-xs"
                  : "border-border bg-surface text-foreground hover:border-primary/40"
              }`}
              onClick={() => handleGroupSelect(g)}
            >
              <span>{g}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[9px] font-extrabold ${
                  g === group
                    ? "bg-white/25 text-white"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        {/* Saved / Bookmarked filter pill */}
        <button
          type="button"
          role="tab"
          aria-selected={group === "Saved"}
          className={`min-h-9 shrink-0 snap-start rounded-xl border px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
            group === "Saved"
              ? "border-rose-500 bg-rose-500 text-white shadow-xs"
              : "border-border bg-surface text-foreground hover:border-rose-400 hover:text-rose-500"
          }`}
          onClick={() => handleGroupSelect("Saved")}
        >
          <Heart className={`size-3 ${savedIds.length > 0 ? "fill-current" : ""}`} />
          <span>Saved</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[9px] font-extrabold ${
              group === "Saved"
                ? "bg-white/25 text-white"
                : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
            }`}
          >
            {savedIds.length}
          </span>
        </button>
      </div>

      {/* ================= RESULTS STATUS BAR ================= */}
      <div className="mb-3 flex items-center justify-between text-[11px] sm:text-xs text-muted">
        <span>
          Showing <strong className="text-foreground">{list.length}</strong> of 18 competitions
          {group !== "All" && ` in ${group}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        {list.length === 0 && (
          <button
            type="button"
            onClick={() => {
              setGroup("All");
              setSearchQuery("");
            }}
            className="text-primary font-bold hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* ================= EMPTY STATE ================= */}
      {list.length === 0 && (
        <div className="my-8 rounded-2xl border border-dashed border-border p-6 text-center bg-surface">
          <Compass className="mx-auto size-10 text-muted/60 mb-2" />
          <h3 className="text-sm sm:text-base font-extrabold text-foreground">
            {group === "Saved"
              ? "No saved competitions yet"
              : "No competitions found matching your search"}
          </h3>
          <p className="mt-1 text-xs text-muted max-w-md mx-auto">
            {group === "Saved"
              ? "Click the heart icon on any event card to shortlist your favourite competitions here!"
              : "Try searching for a different keyword like 'Dance', 'Quiz', or select 'All' categories."}
          </p>
          <button
            type="button"
            onClick={() => {
              setGroup("All");
              setSearchQuery("");
            }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
          >
            View All 18 Events
          </button>
        </div>
      )}

      {/* ================= RESPONSIVE COLUMNS & ROWS GRID ================= */}
      <div
        ref={gridRef}
        className="grid grid-cols-2 gap-2 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5"
      >
        {list.map((r) => {
          const ev = events.find((e) => e.id === r.id);
          const hit = matched.has(r.id);
          const dim = picked.length > 0 && !hit;
          const isSaved = savedIds.includes(r.id);
          return (
            <EventCard
              key={r.id}
              event={ev}
              rule={r}
              hit={hit}
              dimmed={dim}
              mode={mode3d}
              isSaved={isSaved}
              onToggleSave={toggleSave}
              onPreviewPoster={setPreviewEvent}
              onViewRules={setSheet}
              onRegister={register}
              onFail={handle3dFail}
            />
          );
        })}
      </div>

      {/* ================= HIGH-RES POSTER LIGHTBOX MODAL ================= */}
      {previewEvent &&
        overlay(
          <div
            className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/85 p-3 sm:p-6 backdrop-blur-md"
            onClick={() => setPreviewEvent(null)}
            role="presentation"
          >
            <div
              ref={lightboxRef}
              className="relative flex flex-col md:flex-row max-h-[92dvh] w-full max-w-[860px] overflow-hidden rounded-3xl bg-surface shadow-2xl border border-white/20 dark:border-slate-800"
              role="dialog"
              aria-modal="true"
              aria-label={previewEvent.name}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setPreviewEvent(null)}
                className="absolute right-3.5 top-3.5 z-50 grid size-9 place-items-center rounded-full bg-slate-950/70 text-white hover:bg-slate-950 transition shadow-lg"
                aria-label="Close poster preview"
              >
                <FaXmark className="size-4" />
              </button>

              {/* Left: High-Res Image Display */}
              <div className="relative md:w-1/2 h-[260px] sm:h-[340px] md:h-auto overflow-hidden bg-slate-950 flex items-center justify-center">
                {previewEvent.image ? (
                  <img
                    src={previewEvent.image}
                    alt={previewEvent.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-24 place-items-center rounded-full bg-primary/20 text-primary">
                    {previewEvent.icon && <previewEvent.icon className="size-12" />}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

                {/* Event number & category pill floating over image */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
                  <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-black uppercase tracking-wider shadow-md">
                    {previewEvent.category}
                  </span>
                  <span className="text-lg font-black drop-shadow-md">
                    #{String(previewEvent.id).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* Right: Detailed Competition Overview */}
              <div className="flex md:w-1/2 flex-col justify-between p-5 sm:p-6 overflow-y-auto">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                      {previewEvent.group}
                    </span>
                    <span className="text-xs text-muted font-bold">
                      AI-AURA 2K26 Festival
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-foreground leading-tight">
                    {previewEvent.name}
                  </h3>

                  {previewEvent.tagline && (
                    <p className="mt-1.5 text-xs text-accent font-semibold italic">
                      “{previewEvent.tagline}”
                    </p>
                  )}

                  {/* Specs & Rules summary */}
                  {(() => {
                    const r = RULES.find((item) => item.id === previewEvent.id);
                    return (
                      <div className="mt-4 space-y-3">
                        {r?.chips && (
                          <div className="flex flex-wrap gap-1.5">
                            {r.chips.map((chip, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 rounded-lg border border-border bg-slate-100/70 dark:bg-slate-800/60 px-2 py-1 text-xs font-semibold text-foreground/80"
                              >
                                {i === 0 ? (
                                  <Users className="size-3 text-muted" />
                                ) : (
                                  <Clock className="size-3 text-muted" />
                                )}
                                {chip}
                              </span>
                            ))}
                          </div>
                        )}

                        {r?.judging && (
                          <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs">
                            <strong className="text-accent font-bold">Judging Focus: </strong>
                            <span className="text-foreground/90">{r.judging}</span>
                          </div>
                        )}

                        {r?.rules && (
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                              Key Highlights:
                            </span>
                            <ul className="space-y-1 text-xs text-foreground/80">
                              {r.rules.slice(0, 3).map((rl, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <FaCircleCheck className="size-3.5 shrink-0 text-emerald-600 mt-0.5" />
                                  <span className="line-clamp-2">{rl}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Actions & Next / Prev */}
                <div className="mt-6 pt-4 border-t border-border flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSave(previewEvent.id)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition flex-1 ${
                        savedIds.includes(previewEvent.id)
                          ? "border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/60"
                          : "border-border bg-surface text-foreground hover:border-rose-400 hover:text-rose-500"
                      }`}
                    >
                      <Heart
                        className={`size-3.5 ${
                          savedIds.includes(previewEvent.id)
                            ? "fill-rose-500 text-rose-500"
                            : ""
                        }`}
                      />
                      <span>
                        {savedIds.includes(previewEvent.id) ? "Saved" : "Save Event"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSharePoster(previewEvent)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-foreground hover:border-primary hover:text-primary transition flex-1"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="size-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="size-3.5" />
                          <span>Share</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => stepPreview(-1)}
                      className="grid size-10 place-items-center rounded-xl border border-border bg-surface text-foreground hover:border-primary transition"
                      aria-label="Previous event"
                    >
                      <FaChevronLeft className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => register(previewEvent.name)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-primary px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-accent/20 transition hover:opacity-95"
                    >
                      <span>Register for {previewEvent.name}</span>
                      <FaArrowRight className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => stepPreview(1)}
                      className="grid size-10 place-items-center rounded-xl border border-border bg-surface text-foreground hover:border-primary transition"
                      aria-label="Next event"
                    >
                      <FaChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
        )}

      {/* ================= EVENT RULES MODAL ================= */}
      {current &&
        overlay(
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
              {/* Modal Header with Event Photography Background */}
              <div
                className="relative px-5 pb-5 pt-6 text-white sm:px-6 overflow-hidden"
                style={{
                  background:
                    GRAD[current.group] ||
                    "linear-gradient(135deg,#4f46e5,#7c3aed)",
                }}
              >
                {/* Background image overlay if available */}
                {currentEv?.image && (
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <img
                      src={currentEv.image}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                )}

                <button
                  type="button"
                  className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-black/35 text-white transition hover:bg-black/55 z-10"
                  aria-label="Close rules sheet"
                  onClick={() => setSheet(null)}
                >
                  <FaXmark className="size-5" />
                </button>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="grid size-14 place-items-center rounded-2xl bg-white/20 text-2xl shadow-sm sm:size-16 sm:text-3xl backdrop-blur-xs">
                    {(() => {
                      const I = currentEv?.icon;
                      return I ? <I /> : null;
                    })()}
                  </span>
                  <button
                    type="button"
                    onClick={() => currentEv && toggleSave(currentEv.id)}
                    className="grid size-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/35 transition"
                    title="Bookmark event"
                  >
                    <Heart
                      className={`size-4 ${
                        savedIds.includes(current.id)
                          ? "fill-white text-white"
                          : ""
                      }`}
                    />
                  </button>
                </div>

                <small className="relative z-10 mt-3 block text-xs font-bold tracking-wider opacity-90">
                  EVENT {String(current.id).padStart(2, "0")} OF 18 · {current.type}
                </small>

                <h3 className="relative z-10 my-1.5 max-w-[calc(100%-2.5rem)] text-xl font-black leading-tight sm:text-2xl">
                  {currentEv?.name}
                </h3>

                {currentEv?.tagline && (
                  <p className="relative z-10 text-xs text-white/85 italic mb-2">
                    “{currentEv.tagline}”
                  </p>
                )}

                <div className="relative z-10 flex flex-wrap gap-1.5 mt-2">
                  {current.proposed && (
                    <span className="rounded-md bg-amber-400 px-2.5 py-0.5 text-xs font-extrabold text-amber-950 shadow-xs">
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
                  Official Competition Guidelines
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
                  <span className="font-bold text-accent">Judging Focus:</span>{" "}
                  {current.judging}
                </div>

                {current.proposed && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs font-semibold text-amber-900 dark:text-amber-300">
                    <FaTriangleExclamation className="size-4 shrink-0" />
                    <span>
                      Proposed event format, subject to organizing committee final confirmation.
                    </span>
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
          </div>,
        )}
    </section>
  );
}

export default EventExplorer;
