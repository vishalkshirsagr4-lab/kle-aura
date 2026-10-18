import { useState, useEffect, useRef } from "react";
import {
  CalendarDays as FaCalendarDays,
  GraduationCap as FaGraduationCap,
  ArrowRight as FaArrowRight,
  Trophy as FaTrophy,
  Landmark as FaBuildingColumns,
} from "lucide-react";
import { formatDash, formatShort, eventStart } from "../utils";
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
        className="relative mb-12 overflow-hidden rounded-[28px] bg-gradient-to-br from-obsidian via-primary to-primary px-5 py-12 text-center text-white shadow-[0_30px_70px_rgba(79,124,255,0.4)] sm:px-12 sm:py-20 [--px:0] [--py:0]"
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
          <span className="absolute -inset-[5%] bg-[url('../public/images/campus.jpg')] bg-cover bg-center opacity-60 [transform-style:preserve-3d] [transform:rotateX(calc(var(--py)*-6deg))_rotateY(calc(var(--px)*8deg))_translate3d(calc(var(--px)*-12px),calc(var(--py)*-8px),0)_scale(1.04)] transition-transform duration-300 after:absolute after:inset-0 after:bg-gradient-to-b after:from-obsidian/50 after:via-primary/35 after:to-obsidian/80" />
        </span>
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-0 size-full"
          aria-hidden="true"
        ></canvas>
        <span className="pointer-events-none absolute -left-24 -top-28 size-80 rounded-full bg-[#9db4ff] opacity-50 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-28 -right-20 size-72 rounded-full bg-cyan opacity-40 blur-3xl" />
        <span className="pointer-events-none absolute right-[18%] top-2/5 size-52 rounded-full bg-cyan opacity-25 blur-3xl" />

        <div className="relative z-10 mb-4 flex items-center justify-center gap-2 text-sm font-bold text-[#f5f7ff]">
          <FaBuildingColumns /> {COLLEGE.name}, {COLLEGE.place} presents
        </div>
        <div className="relative z-10 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 py-2 text-xs font-bold tracking-[0.16em] text-white backdrop-blur-lg">
          <FaGraduationCap /> PUC STUDENTS ONLY
        </div>
        <h1
          ref={titleRef}
          className="relative z-10 mt-5 bg-gradient-to-b from-white via-white to-[#9db4ff] bg-clip-text text-6xl font-black leading-none text-transparent drop-shadow-[0_6px_30px_rgba(182,138,255,0.55)] sm:text-8xl lg:text-[120px]"
        >
          AI-AURA
        </h1>
        <p className="relative z-10 mb-6 mt-2 text-lg text-[#f5f7ff] sm:text-2xl">
          18 events. One day. Your stage.
        </p>
        <div className="relative z-10 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-lg font-extrabold text-primary shadow-xl shadow-black/30 sm:text-xl">
          <FaCalendarDays /> {formatDash(info.eventDate)}
        </div>

        <div className="relative z-10 my-7 flex justify-center gap-2 sm:gap-4">
          <div className="min-w-16 rounded-2xl border border-white/25 bg-white/10 px-3 py-3 backdrop-blur-lg">
            <b className="block text-2xl font-extrabold leading-tight sm:text-4xl">
              {left.days}
            </b>
            <span className="text-xs uppercase tracking-wider text-[#9db4ff]">
              Days
            </span>
          </div>
          <div className="min-w-16 rounded-2xl border border-white/25 bg-white/10 px-3 py-3 backdrop-blur-lg">
            <b className="block text-2xl font-extrabold leading-tight sm:text-4xl">
              {pad(left.hours)}
            </b>
            <span className="text-xs uppercase tracking-wider text-[#9db4ff]">
              Hours
            </span>
          </div>
          <div className="min-w-16 rounded-2xl border border-white/25 bg-white/10 px-3 py-3 backdrop-blur-lg">
            <b className="block text-2xl font-extrabold leading-tight sm:text-4xl">
              {pad(left.mins)}
            </b>
            <span className="text-xs uppercase tracking-wider text-[#9db4ff]">
              Mins
            </span>
          </div>
          <div className="min-w-16 rounded-2xl border border-white/25 bg-white/10 px-3 py-3 backdrop-blur-lg">
            <b className="block text-2xl font-extrabold leading-tight sm:text-4xl">
              {pad(left.secs)}
            </b>
            <span className="text-xs uppercase tracking-wider text-[#9db4ff]">
              Secs
            </span>
          </div>
        </div>

        <a
          className="relative z-10 inline-flex items-center gap-3 rounded-full bg-gradient-to-br from-cyan to-[#9db4ff] px-9 py-4 font-extrabold text-obsidian shadow-xl shadow-primary/40 transition hover:-translate-y-1 hover:scale-[1.03]"
          href="#register"
        >
          Register now <FaArrowRight />
        </a>
        <a
          className="relative z-10 mt-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold text-white no-underline backdrop-blur hover:bg-white/20"
          href="#rules"
        >
          📘 Rules &amp; PDF
        </a>
        <div className="relative z-10 mt-5 flex justify-center">
          <SocialLinks info={info} />
        </div>
      </header>

      <section className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="tilt flex flex-col items-center rounded-2xl border border-border bg-surface p-5 text-center shadow-lg shadow-black/5 [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]">
          <FaTrophy className="mb-2 text-2xl text-accent" />
          <b className="text-3xl font-extrabold">18</b>
          <span className="text-sm font-semibold text-muted">Events</span>
        </div>
        <div className="tilt flex flex-col items-center rounded-2xl border border-border bg-surface p-5 text-center shadow-lg shadow-black/5 [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]">
          <FaCalendarDays className="mb-2 text-2xl text-accent" />
          <b className="text-3xl font-extrabold">1 Day</b>
          <span className="text-sm font-semibold text-muted">
            {formatShort(info.eventDate)}
          </span>
        </div>
        <div className="tilt flex flex-col items-center rounded-2xl border border-border bg-surface p-5 text-center shadow-lg shadow-black/5 [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]">
          <FaGraduationCap className="mb-2 text-2xl text-accent" />
          <b className="text-3xl font-extrabold">PUC</b>
          <span className="text-sm font-semibold text-muted">
            Students only
          </span>
        </div>
      </section>
    </>
  );
}

export default Hero;
