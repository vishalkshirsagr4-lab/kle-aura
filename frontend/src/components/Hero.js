import { useState, useEffect, useRef } from "react";
import {
  CalendarDays as FaCalendarDays,
  GraduationCap as FaGraduationCap,
  ArrowRight as FaArrowRight,
  Trophy as FaTrophy,
  Landmark as FaBuildingColumns,
  MapPin as FaLocationDot,
  Image as FaImage,
} from "lucide-react";
import { formatDash, eventStart } from "../utils";
import { COLLEGE } from "../data/college";
import { createHeroScene } from "../scenes3d";
import SocialLinks from "./SocialLinks";

function getTimeLeft(start) {
  const diff = Math.max(0, start - new Date());
  return {
    days: Math.floor(diff / 864e5),
    hours: Math.floor(diff / 36e5) % 24,
    mins: Math.floor(diff / 6e4) % 60,
    secs: Math.floor(diff / 1e3) % 60,
  };
}

const pad = (n) => String(n).padStart(2, "0");

function Hero({ info }) {
  const [left, setLeft] = useState(() => getTimeLeft(eventStart(info)));
  const canvasRef = useRef(null);
  const titleRef = useRef(null);

  // Real 3D shapes floating behind the title
  useEffect(() => {
    const dispose = createHeroScene(canvasRef.current);
    return () => {
      if (dispose) dispose();
    };
  }, []);

  // Mouse move / finger drag tilts the college photo in 3D (and the title on desktop)
  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.setProperty("--px", px.toFixed(3));
    e.currentTarget.style.setProperty("--py", py.toFixed(3));
    if (!titleRef.current || e.pointerType === "touch") return;
    titleRef.current.style.setProperty("--hx", `${-py * 16}deg`);
    titleRef.current.style.setProperty("--hy", `${px * 22}deg`);
  };
  const handleLeave = (e) => {
    e.currentTarget.style.setProperty("--px", "0");
    e.currentTarget.style.setProperty("--py", "0");
    if (!titleRef.current) return;
    titleRef.current.style.setProperty("--hx", "0deg");
    titleRef.current.style.setProperty("--hy", "0deg");
  };

  useEffect(() => {
    const start = eventStart(info);
    setLeft(getTimeLeft(start));
    const id = setInterval(() => setLeft(getTimeLeft(start)), 1000);
    return () => clearInterval(id);
  }, [info]);

  return (
    <>
      <header
        className="relative mb-12 grid min-h-[460px] grid-cols-1 items-center gap-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#101828] via-[#172554] to-[#312e81] px-6 py-10 text-left text-white shadow-[0_24px_64px_rgba(30,41,59,0.2)] sm:px-10 sm:py-12 md:grid-cols-[1.1fr_0.9fr] md:gap-6 lg:px-14 [--px:0] [--py:0]"
        onPointerDown={handleMove}
        onPointerMove={handleMove}
        onPointerUp={handleLeave}
        onPointerCancel={handleLeave}
        onPointerLeave={handleLeave}
      >
        <span
          className="absolute inset-0 z-0 overflow-hidden [perspective:900px] [perspective-origin:50%_40%]"
          aria-hidden="true"
        >
          <span className="absolute -inset-[5%] bg-[url('../public/images/campus.jpg')] bg-cover bg-center opacity-70 [transform-style:preserve-3d] [transform:rotateX(calc(var(--py)*-4deg))_rotateY(calc(var(--px)*6deg))_translate3d(calc(var(--px)*-10px),calc(var(--py)*-6px),0)_scale(1.04)] transition-transform duration-300 after:absolute after:inset-0 after:bg-gradient-to-r after:from-[#101828]/95 after:via-[#101828]/80 after:to-[#172554]/55" />
        </span>
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-0 size-full opacity-20"
          aria-hidden="true"
        ></canvas>
        <div className="relative z-10">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white/85">
            <FaBuildingColumns aria-hidden="true" />
            {COLLEGE.name}, {COLLEGE.place}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.12em] text-white backdrop-blur">
            <FaGraduationCap aria-hidden="true" /> PUC STUDENTS ONLY
          </div>
          <h1
            ref={titleRef}
            className="mt-5 bg-gradient-to-r from-white via-white to-indigo-200 bg-clip-text text-6xl font-black leading-[0.95] tracking-[-0.06em] text-transparent transition-transform duration-500 sm:text-7xl lg:text-8xl [transform:perspective(700px)_rotateX(var(--hx,0deg))_rotateY(var(--hy,0deg))]"
          >
            AI-AURA
          </h1>
          <p className="mb-6 mt-4 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
            18 events. One day. Your stage.
          </p>
          <div className="mb-7 grid gap-2 text-sm font-semibold text-white/85 sm:grid-cols-2">
            <span className="inline-flex min-w-0 items-start gap-2">
              <FaCalendarDays className="text-indigo-200" aria-hidden="true" />
              {formatDash(info.eventDate)}
            </span>
            <span className="inline-flex min-w-0 items-start gap-2 break-words">
              <FaLocationDot className="text-indigo-200" aria-hidden="true" />
              {info.venue}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-white px-6 py-3 font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
              href="#register"
            >
              Register now <FaArrowRight aria-hidden="true" />
            </a>
            <a
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white no-underline backdrop-blur transition hover:bg-white/15"
              href="#rules"
            >
              View rules
            </a>
            <button
              type="button"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/25 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={() => window.dispatchEvent(new Event("aura:open-poster"))}
            >
              <FaImage aria-hidden="true" /> View poster
            </button>
          </div>
          <div className="mt-6">
            <SocialLinks info={info} />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-lg justify-self-center rounded-3xl border border-white/15 bg-[#0b1020]/55 p-5 shadow-2xl backdrop-blur-md sm:p-7 lg:justify-self-end">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-200">
                Save the date
              </p>
              <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                {formatDash(info.eventDate)}
              </p>
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl text-indigo-200">
              <FaTrophy aria-hidden="true" />
            </span>
          </div>
          <p className="mb-3 text-sm font-medium text-white/70">
            The celebration begins in
          </p>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { value: left.days, label: "Days" },
              { value: pad(left.hours), label: "Hours" },
              { value: pad(left.mins), label: "Mins" },
              { value: pad(left.secs), label: "Secs" },
            ].map(({ value, label }) => (
              <div
                className="rounded-2xl border border-white/10 bg-white/[0.07] px-2 py-3 text-center"
                key={label}
              >
                <b className="block text-2xl font-bold leading-tight tabular-nums sm:text-3xl">
                  {value}
                </b>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-white/55 sm:text-xs">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-white/10 pt-4 text-sm text-white/65">
            Get ready to create, compete and make memories.
          </p>
        </div>
      </header>
    </>
  );
}

export default Hero;
