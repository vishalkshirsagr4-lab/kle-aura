import { useState, useRef } from "react";
import {
  Trophy,
  Award,
  Sparkles,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function TrophyCard({ onRegister, onViewRules }) {
  const [isRotating, setIsRotating] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef(null);

  const handleSpin360 = (e) => {
    e.stopPropagation();
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 1000);
  };

  const handlePointerMove = (e) => {
    if (!cardRef.current || isRotating) return;
    const r = cardRef.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -ny * 12, ry: nx * 12 });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  return (
    <article
      ref={cardRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 text-white shadow-xl shadow-amber-500/15 transition-all duration-300 md:col-span-2 lg:col-span-1 xl:col-span-2 ${
        isRotating ? "spin-360-active" : ""
      }`}
      style={{
        transform: isRotating
          ? "none"
          : `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Golden Aura Glow Effect */}
      <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400/20 via-yellow-400/20 to-amber-600/20 opacity-70 blur-xl group-hover:opacity-100 transition-opacity" />

      {/* Header Pill & 360 Rotation Button */}
      <div className="relative z-20 flex items-center justify-between p-3.5 sm:p-4 pb-2">
        <div className="flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-slate-950/85 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300 backdrop-blur-md shadow-md">
          <Trophy className="size-3.5 text-amber-400" />
          <span>General Championship Trophy</span>
        </div>

        {/* 360 Spin Trigger Button */}
        <button
          type="button"
          onClick={handleSpin360}
          className="flex items-center gap-1 rounded-full border border-amber-400/50 bg-slate-950/85 px-3 py-1 text-[11px] font-black text-amber-300 hover:bg-amber-400 hover:text-slate-950 shadow-md backdrop-blur-md transition-all active:scale-90"
          title="Click to spin trophy 360°"
          aria-label="Spin 360 degrees"
        >
          <RotateCw className="size-3" />
          <span>360° Spin</span>
        </button>
      </div>

      {/* Main Visual: Center Trophy Image */}
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 p-4 sm:p-5 pt-0">
        <div
          className="relative h-56 sm:h-64 w-44 sm:w-52 shrink-0 overflow-hidden rounded-2xl border-2 border-amber-400/40 bg-slate-950 shadow-2xl cursor-pointer"
          onClick={handleSpin360}
          title="Click to rotate 360°"
        >
          <img
            src="/images/trophy.jpg"
            alt="AI-AURA 2K26 Championship Trophy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
          {/* Subtle Golden Sheen */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-amber-400/10 pointer-events-none" />
          
          <div className="absolute bottom-2 left-2 right-2 rounded-xl bg-slate-950/80 p-1.5 text-center backdrop-blur-md border border-amber-400/30">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-300">
              KLE Rolling Trophy
            </span>
          </div>
        </div>

        {/* Trophy Details & Prize Breakdown */}
        <div className="flex flex-1 flex-col justify-between text-left">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[11px] font-extrabold text-amber-300 border border-amber-400/30">
                AI-AURA 2K26
              </span>
              <span className="text-xs font-bold text-slate-300">
                State Level Talent Hunt
              </span>
            </div>

            <h3 className="mt-2 text-lg sm:text-xl md:text-2xl font-black text-white leading-tight">
              KLE Society&apos;s BCA &amp; BBA College
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-amber-400">
              Mahalingpur — Event Date: 4 November 2026
            </p>

            <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-300">
              Compete across all 18 competitive events. The college with the highest aggregate points will be crowned the <strong className="text-amber-300">AI-AURA 2K26 General Champion</strong> and take home the prestigious rolling trophy!
            </p>

            {/* Prize Highlights Grid */}
            <div className="mt-3.5 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 p-2 text-amber-200">
                <Award className="size-4 text-amber-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold leading-tight">
                  Rolling Champion Trophy
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 p-2 text-amber-200">
                <Sparkles className="size-4 text-amber-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold leading-tight">
                  18 Event Trophies
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 p-2 text-amber-200">
                <ShieldCheck className="size-4 text-amber-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold leading-tight">
                  Official Certificates
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 p-2 text-amber-200">
                <CheckCircle2 className="size-4 text-amber-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold leading-tight">
                  Free Meals &amp; Entry
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 px-4 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-amber-500/30 transition-all hover:scale-102 hover:shadow-amber-500/50 active:scale-95"
            >
              <span>Register for Events Now</span>
              <ArrowRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleSpin360}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-amber-400/40 bg-slate-900/80 px-3.5 text-xs font-bold text-amber-300 transition-all hover:bg-amber-400/10"
            >
              <RotateCw className="size-3.5" />
              <span>Rotate 360°</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
