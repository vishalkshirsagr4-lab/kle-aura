import { useState, useRef } from "react";
import {
  FileText,
  ArrowRight,
  Users,
  Clock,
  Heart,
  Share2,
  Check,
  RotateCw,
  Trophy,
  Calendar,
  PhoneCall,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Scale,
} from "lucide-react";

const GROUP_STYLES = {
  Stage: {
    headerGrad: "from-purple-600 via-indigo-600 to-purple-800",
    badge: "bg-purple-600 text-white",
    cardBorder: "border-purple-200 dark:border-purple-900/60 hover:border-purple-500",
    glow: "hover:shadow-purple-500/15",
    iconBg: "bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    accent: "#9333ea",
  },
  "Art & Craft": {
    headerGrad: "from-pink-600 via-rose-600 to-purple-700",
    badge: "bg-pink-600 text-white",
    cardBorder: "border-pink-200 dark:border-pink-900/60 hover:border-pink-500",
    glow: "hover:shadow-pink-500/15",
    iconBg: "bg-pink-50 dark:bg-pink-950/70 text-pink-600 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    accent: "#db2777",
  },
  Writing: {
    headerGrad: "from-blue-600 via-indigo-600 to-cyan-700",
    badge: "bg-blue-600 text-white",
    cardBorder: "border-blue-200 dark:border-blue-900/60 hover:border-blue-500",
    glow: "hover:shadow-blue-500/15",
    iconBg: "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    accent: "#2563eb",
  },
  "Quiz & Logic": {
    headerGrad: "from-indigo-600 via-blue-600 to-indigo-800",
    badge: "bg-indigo-600 text-white",
    cardBorder: "border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-500",
    glow: "hover:shadow-indigo-500/15",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    accent: "#4f46e5",
  },
  "AI & Digital": {
    headerGrad: "from-cyan-600 via-teal-600 to-blue-700",
    badge: "bg-cyan-600 text-white",
    cardBorder: "border-cyan-200 dark:border-cyan-900/60 hover:border-cyan-500",
    glow: "hover:shadow-cyan-500/15",
    iconBg: "bg-cyan-50 dark:bg-cyan-950/70 text-cyan-600 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    accent: "#0891b2",
  },
};

export default function EventCard({
  event,
  rule,
  hit = false,
  dimmed = false,
  isSaved = false,
  onToggleSave,
  onViewRules,
  onRegister,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, opacity: 0 });
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  const Icon = event?.icon;
  const numStr = `#${String(event?.id || 0).padStart(2, "0")}`;
  const groupName = rule?.group || event?.group || event?.category || "General";
  const styleTheme = GROUP_STYLES[groupName] || {
    headerGrad: "from-indigo-600 via-purple-600 to-blue-700",
    badge: "bg-indigo-600 text-white",
    cardBorder: "border-slate-200 dark:border-slate-800 hover:border-indigo-500",
    glow: "hover:shadow-indigo-500/15",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    accent: "#4f46e5",
  };

  const teamChip = rule?.chips?.[0] || "Individual";
  const durationChip = rule?.chips?.[1] || "As scheduled";

  // Coordinators data from rule
  const facultyCoord = rule?.facultyCoordinator || rule?.facultyCoordinators?.[0] || {
    name: "Prof. S. I. Patil",
    phone: "8904601004",
  };
  const studentCoord = rule?.studentCoordinator || rule?.studentCoordinators?.[0] || {
    name: "Student Desk",
    phone: "9353966996",
  };

  // 3D Tilt Effect
  const handlePointerMove = (e) => {
    if (!cardRef.current || isSpinning) return;
    const r = cardRef.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    const gx = Math.round(((e.clientX - r.left) / r.width) * 100);
    const gy = Math.round(((e.clientY - r.top) / r.height) * 100);
    setTilt({
      rx: -ny * 7,
      ry: nx * 7,
      gx,
      gy,
      opacity: 0.1,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, opacity: 0 });
  };

  const handleSpin360 = (e) => {
    e.stopPropagation();
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
    }, 800);
  };

  const handleFlipCard = (e) => {
    e.stopPropagation();
    setIsFlipped((prev) => !prev);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const shareText = `Check out ${event?.name} at AI-AURA 2K26 Festival (KLE BCA & BBA Mahalingpur)!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText} - ${window.location.origin}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article
      ref={cardRef}
      data-event-card="true"
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border bg-white dark:bg-slate-900 transition-all duration-300 [transform-style:preserve-3d] ${
        hit
          ? "border-indigo-500 ring-2 ring-indigo-500/40 shadow-xl shadow-indigo-500/20"
          : `shadow-md hover:shadow-2xl ${styleTheme.cardBorder} ${styleTheme.glow}`
      } ${dimmed ? "opacity-35 saturate-50" : "opacity-100"} ${
        isSpinning ? "spin-360-active" : ""
      }`}
      style={{
        transform: isSpinning
          ? "none"
          : `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-2px)`,
        transition: isSpinning ? "none" : "transform 0.15s ease-out, box-shadow 0.25s, border-color 0.25s",
      }}
    >
      {/* Specular Sheen */}
      <div
        className="pointer-events-none absolute inset-0 z-30 rounded-3xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 280px at ${tilt.gx}% ${tilt.gy}%, rgba(255, 255, 255, 0.4), transparent 70%)`,
          opacity: tilt.opacity,
        }}
      />

      {/* ================= CARD FRONT (TEXT-FIRST, HIGH CONTRAST) ================= */}
      {!isFlipped ? (
        <div className="flex flex-1 flex-col justify-between">
          {/* ================= DISTINCT TOP TRACK HEADER BANNER ================= */}
          <div
            className={`relative bg-gradient-to-r ${styleTheme.headerGrad} px-4 py-3 sm:px-5 sm:py-3.5 text-white flex items-center justify-between shadow-xs`}
          >
            {/* Left: Category Badge & Event Number */}
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/25 border border-white/40 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-white backdrop-blur-md shadow-xs">
                {groupName}
              </span>
              <span className="rounded-full bg-black/35 border border-white/25 px-2 py-0.5 text-[11px] font-black tracking-tight text-white/95 backdrop-blur-md">
                {numStr}
              </span>
              {rule?.proposed && (
                <span className="rounded-md border border-amber-300/80 bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase text-slate-950 shadow-xs">
                  NEW
                </span>
              )}
            </div>

            {/* Right: Action Toolbar (Spin, Heart, Share) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* 360 Spin */}
              <button
                type="button"
                onClick={handleSpin360}
                className="grid size-7 sm:size-8 place-items-center rounded-full border border-white/30 bg-black/25 text-amber-300 hover:bg-amber-400 hover:text-slate-950 shadow-xs backdrop-blur-md transition-all active:scale-90"
                title="Spin Card 360°"
                aria-label="Spin 360 degrees"
              >
                <RotateCw className="size-3.5" />
              </button>

              {/* Bookmark / Heart */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave?.(event?.id);
                }}
                className={`grid size-7 sm:size-8 place-items-center rounded-full border shadow-xs backdrop-blur-md transition-all active:scale-90 ${
                  isSaved
                    ? "border-rose-400 bg-rose-500 text-white shadow-sm"
                    : "border-white/30 bg-black/25 text-white hover:bg-white hover:text-slate-900"
                }`}
                title={isSaved ? "Saved to your list" : "Save / Shortlist event"}
                aria-label={isSaved ? "Saved" : "Save"}
              >
                <Heart className={`size-3.5 ${isSaved ? "fill-white" : ""}`} />
              </button>

              {/* Share Link */}
              <button
                type="button"
                onClick={handleShare}
                className="grid size-7 sm:size-8 place-items-center rounded-full border border-white/30 bg-black/25 text-white hover:bg-white hover:text-slate-900 shadow-xs backdrop-blur-md transition-all active:scale-90"
                title="Share event link"
                aria-label="Share"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-300" />
                ) : (
                  <Share2 className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* ================= CARD BODY ================= */}
          <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
            <div>
              {/* Event Header: Icon + Title + Track Subtitle */}
              <div className="flex items-start gap-3">
                {Icon && (
                  <div
                    className={`grid size-12 shrink-0 place-items-center rounded-2xl border shadow-sm ${styleTheme.iconBg}`}
                  >
                    <Icon className="size-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    {rule?.type || event?.category || "State Competition"}
                  </span>
                  <h3 className="text-base sm:text-lg font-black leading-snug tracking-tight text-slate-900 dark:text-white transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {event?.name}
                  </h3>
                </div>
              </div>

              {/* Tagline / Subtitle */}
              {event?.tagline && (
                <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2">
                  {event.tagline}
                </p>
              )}

              {/* Timing, Format & Award Highlights Box */}
              <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-2.5">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Clock className="size-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="truncate">Time: {durationChip}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Users className="size-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="truncate">Team: {teamChip}</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700/60 pt-2 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                    <Calendar className="size-3 shrink-0" />
                    <span>4 Nov 2026</span>
                  </span>
                  {/* Official Honors - NO PRIZE POOL / NO CASH */}
                  <span className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400">
                    <Trophy className="size-3 shrink-0" />
                    <span>Trophy &amp; Certificates</span>
                  </span>
                </div>
              </div>

              {/* ================= RULES & REGULATIONS LIST ================= */}
              <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 p-2.5 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    <FileText className="size-3 text-indigo-600 dark:text-indigo-400" />
                    <span>Rules &amp; Regulations</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleFlipCard}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>All rules</span>
                    <ChevronRight className="size-2.5" />
                  </button>
                </div>

                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                  {rule?.rules?.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="size-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 mt-1.5" />
                      <span className="line-clamp-2">{r}</span>
                    </li>
                  ))}
                </ul>

                {/* Judging Focus */}
                {rule?.judging && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-1 text-[11px] text-amber-900 dark:text-amber-200">
                    <Scale className="size-3 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="truncate">
                      <strong>Judging:</strong> {rule.judging}
                    </span>
                  </div>
                )}
              </div>

              {/* ================= FACULTY & STUDENT COORDINATORS ================= */}
              <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-2.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                  <Sparkles className="size-2.5 text-amber-500" />
                  <span>Event In-Charge Coordinators</span>
                </div>

                {/* Stacked Layout for clear legibility and touch targets */}
                <div className="space-y-1.5 text-xs">
                  {/* Faculty Coordinator */}
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-900 p-2 shadow-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="grid size-7 place-items-center rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shrink-0">
                        <GraduationCap className="size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block leading-none">
                          Faculty
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate block mt-0.5">
                          {facultyCoord.name}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`tel:${facultyCoord.phone}`}
                      className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 px-2 py-1 text-[11px] font-black text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition shrink-0"
                      title={`Call Faculty Coordinator: ${facultyCoord.phone}`}
                    >
                      <PhoneCall className="size-2.5" />
                      <span>{facultyCoord.phone}</span>
                    </a>
                  </div>

                  {/* Student Coordinator */}
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-900 p-2 shadow-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="grid size-7 place-items-center rounded-md bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 shrink-0">
                        <Users className="size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block leading-none">
                          Student
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate block mt-0.5">
                          {studentCoord.name}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`tel:${studentCoord.phone}`}
                      className="inline-flex items-center gap-1 rounded-md bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/80 px-2 py-1 text-[11px] font-black text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition shrink-0"
                      title={`Call Student Coordinator: ${studentCoord.phone}`}
                    >
                      <PhoneCall className="size-2.5" />
                      <span>{studentCoord.phone}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= ACTION BUTTONS FOOTER ================= */}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
              {/* 360 Flip for Full Rules Button */}
              <button
                type="button"
                onClick={handleFlipCard}
                className="inline-flex h-9 sm:h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
                title="Flip to view complete guidelines"
              >
                <RotateCw className="size-3 shrink-0" />
                <span>360° Rules</span>
              </button>

              {/* View Full Details Modal Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewRules?.(event?.id);
                }}
                className="inline-flex h-9 sm:h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
              >
                <FileText className="size-3 shrink-0" />
                <span>Details</span>
              </button>

              {/* Register Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegister?.(event?.name);
                }}
                className="inline-flex h-9 sm:h-10 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 px-2 text-[11px] sm:text-xs font-black text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
              >
                <span>Register</span>
                <ArrowRight className="size-3 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= CARD BACK (COMPREHENSIVE RULES & SPECS) ================= */
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 bg-slate-950 text-white rounded-2xl sm:rounded-3xl border border-slate-800">
          <div>
            {/* Back Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase text-white ${styleTheme.badge}`}>
                  {groupName}
                </span>
                <span className="text-xs font-black text-amber-300">
                  {numStr} • Full Rules
                </span>
              </div>

              <button
                type="button"
                onClick={handleFlipCard}
                className="flex items-center gap-1 rounded-full border border-white/20 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white hover:text-slate-900 transition-all"
              >
                <RotateCw className="size-3" />
                <span>Front View</span>
              </button>
            </div>

            {/* Event Name */}
            <h4 className="mt-3 text-base sm:text-lg font-black text-white leading-tight">
              {event?.name}
            </h4>

            {/* Duration & Team Badges */}
            <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-lg bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-1 font-bold text-indigo-300 flex items-center gap-1">
                <Clock className="size-3" />
                <span>Duration: {durationChip}</span>
              </span>
              <span className="rounded-lg bg-purple-500/20 border border-purple-400/30 px-2.5 py-1 font-bold text-purple-300 flex items-center gap-1">
                <Users className="size-3" />
                <span>Team: {teamChip}</span>
              </span>
            </div>

            {/* All Rules List */}
            <div className="mt-3.5 space-y-2 text-xs text-slate-300 max-h-52 overflow-y-auto pr-1">
              {rule?.rules?.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <p className="leading-relaxed text-slate-200">{r}</p>
                </div>
              ))}
            </div>

            {/* Themes or Topics if available */}
            {(rule?.themes || rule?.topics) && (
              <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900 p-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Announced Themes / Topics:
                </span>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {(rule.themes || rule.topics).map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-200 border border-slate-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Judging Criterion */}
            {rule?.judging && (
              <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/15 p-2 text-xs text-amber-200">
                <strong>Judging:</strong> {rule.judging}
              </div>
            )}

            {/* Coordinators on Back */}
            <div className="mt-3 space-y-1.5 text-[11px] border-t border-slate-800 pt-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] block">Faculty Coordinator:</span>
                  <span className="font-bold text-white text-xs">{facultyCoord.name}</span>
                </div>
                <a href={`tel:${facultyCoord.phone}`} className="text-amber-400 hover:underline font-bold text-xs">
                  📞 {facultyCoord.phone}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] block">Student Coordinator:</span>
                  <span className="font-bold text-white text-xs">{studentCoord.name}</span>
                </div>
                <a href={`tel:${studentCoord.phone}`} className="text-amber-400 hover:underline font-bold text-xs">
                  📞 {studentCoord.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Back Action Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleFlipCard}
              className="h-9 px-3 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              ↺ Front View
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRegister?.(event?.name);
              }}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-black text-white shadow-md hover:shadow-indigo-500/30"
            >
              Register Now →
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
