import { useState, useEffect, useCallback, useRef } from "react";
import {
  Presentation as FaChalkboardUser,
  Images as FaImages,
  X as FaXmark,
  ChevronLeft as FaChevronLeft,
  ChevronRight as FaChevronRight,
  Calendar as FaCalendarDay,
  Users as FaUsers,
  Building2 as FaBuilding,
} from "lucide-react";
import { SEMINARS, PHOTOS } from "../data/gallery";

// Seconds between automatic slides
const SLIDE_SECONDS = 10;

function CollegeGallery() {
  // one lightbox for both lists: { list, index }
  const [box, setBox] = useState(null);

  // ---- Seminar slider: moves one card every SLIDE_SECONDS, swipe/arrows also work ----
  const track = useRef(null);
  const paused = useRef(false);
  const [active, setActive] = useState(0);

  const step = () => {
    const el = track.current;
    if (!el || !el.firstElementChild) return 0;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 16;
    return el.firstElementChild.offsetWidth + gap;
  };
  const slide = useCallback((dir) => {
    const el = track.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const atStart = el.scrollLeft <= 4;
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (dir < 0 && atStart)
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: dir * step(), behavior: "smooth" });
  }, []);
  const goTo = (i) =>
    track.current &&
    track.current.scrollTo({ left: i * step(), behavior: "smooth" });
  const onScroll = () => {
    const w = step();
    if (w)
      setActive(
        Math.min(SEMINARS.length - 1, Math.round(track.current.scrollLeft / w)),
      );
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current && !document.hidden) slide(1);
    }, SLIDE_SECONDS * 1000);
    return () => clearInterval(id);
  }, [slide]);

  const items = box ? box.list : [];
  const cur = box ? items[box.index] : null;

  const move = useCallback(
    (d) =>
      setBox((b) =>
        b ? { ...b, index: (b.index + d + b.list.length) % b.list.length } : b,
      ),
    [],
  );

  useEffect(() => {
    if (!box) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setBox(null);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [box, move]);

  return (
    <section className="mb-14">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="flex items-center gap-2 border-l-[6px] border-accent pl-4 text-2xl font-extrabold sm:text-3xl">
          <FaChalkboardUser className="text-accent" /> EXPERT SEMINARS
        </h2>
        <p className="text-sm text-muted">
          Industry professionals from Bengaluru's top companies teach our
          students every semester
        </p>
      </div>

      <div
        className="relative"
        onPointerEnter={() => (paused.current = true)}
        onPointerLeave={() => (paused.current = false)}
        onTouchStart={() => (paused.current = true)}
        onTouchEnd={() => setTimeout(() => (paused.current = false), 4000)}
      >
        <button
          type="button"
          className="absolute left-0 top-[38%] z-10 grid size-11 place-items-center rounded-full bg-primary/85 text-white shadow-lg hover:bg-accent"
          aria-label="Previous seminar"
          onClick={() => slide(-1)}
        >
          <FaChevronLeft />
        </button>
        <div
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 py-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
          ref={track}
          onScroll={onScroll}
        >
          {SEMINARS.map((s, i) => (
            <article
              className="tilt flex basis-[min(300px,82%)] snap-start flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl shadow-black/10 backdrop-blur [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]"
              key={s.id}
            >
              <button
                type="button"
                className="block cursor-zoom-in overflow-hidden border-0 bg-white p-0"
                onClick={() => setBox({ list: SEMINARS, index: i })}
                aria-label={`Open poster: ${s.title}`}
              >
                <img
                  className="aspect-square w-full object-cover transition duration-500 hover:scale-105"
                  src={s.img}
                  alt={`${s.title} seminar poster`}
                  loading="lazy"
                />
              </button>
              <div className="p-4">
                <h3 className="mb-2 text-base font-bold">{s.title}</h3>
                <p className="text-sm font-medium">
                  <strong>{s.speaker}</strong> · {s.role}
                </p>
                <p className="my-2 flex items-center gap-2 text-sm font-medium text-muted">
                  <FaBuilding /> {s.org}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                    <FaCalendarDay /> {s.date}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                    <FaUsers /> {s.audience}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <button
          type="button"
          className="absolute right-0 top-[38%] z-10 grid size-11 place-items-center rounded-full bg-primary/85 text-white shadow-lg hover:bg-accent"
          aria-label="Next seminar"
          onClick={() => slide(1)}
        >
          <FaChevronRight />
        </button>
      </div>
      <div className="flex justify-center gap-2">
        {SEMINARS.map((s, i) => (
          <button
            type="button"
            key={s.id}
            className={`h-2.5 rounded-full transition-all ${i === active ? "w-7 bg-accent" : "w-2.5 bg-accent/30"}`}
            aria-label={`Go to seminar ${i + 1}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <div className="mb-6 mt-12 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="flex items-center gap-2 border-l-[6px] border-accent pl-4 text-2xl font-extrabold sm:text-3xl">
          <FaImages className="text-accent" /> CAMPUS MOMENTS
        </h2>
        <p className="text-sm text-muted">
          Our students, our campus and our achievements
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
        {PHOTOS.map((p, i) => (
          <button
            type="button"
            key={p.id}
            className={`relative min-h-60 cursor-zoom-in overflow-hidden rounded-2xl bg-obsidian p-0 shadow-xl shadow-black/10 ${p.wide ? "col-span-2 max-sm:col-span-1" : ""}`}
            onClick={() => setBox({ list: PHOTOS, index: i })}
            aria-label={p.caption}
          >
            <img
              className="block size-full object-cover transition duration-500 hover:scale-105"
              src={p.img}
              alt={p.caption}
              loading="lazy"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/90 to-transparent px-4 pb-4 pt-8 text-left text-sm font-semibold text-white">
              {p.caption}
            </span>
          </button>
        ))}
      </div>

      {cur && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-obsidian/95 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setBox(null)}
        >
          <button
            type="button"
            className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white/15 text-white"
            aria-label="Close"
            onClick={() => setBox(null)}
          >
            <FaXmark />
          </button>
          <button
            type="button"
            className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              move(-1);
            }}
          >
            <FaChevronLeft />
          </button>
          <figure
            className="m-0 max-w-[min(92vw,900px)] text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              className="max-h-[80vh] max-w-full rounded-2xl"
              src={cur.img}
              alt={cur.title || cur.caption}
            />
            <figcaption className="mt-3 font-semibold text-white">
              {cur.title || cur.caption} · {box.index + 1}/{items.length}
            </figcaption>
          </figure>
          <button
            type="button"
            className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              move(1);
            }}
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </section>
  );
}

export default CollegeGallery;
