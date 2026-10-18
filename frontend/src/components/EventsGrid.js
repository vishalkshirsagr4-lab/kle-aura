import { Star as FaStar } from "lucide-react";
import events from "../data/events";

function EventsGrid({ onSelect }) {
  const handleSelect = (name) => {
    onSelect(name);
    const el = document.getElementById("register");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="section-heading">
          <FaStar className="text-accent" /> Explore the events
        </h2>
        <p className="text-sm text-muted">
          Tap an event to pick it in the form
        </p>
      </div>

      <div className="mb-14 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {events.map((ev) => {
          const Icon = ev.icon;
          return (
            <button
              type="button"
              className="tilt flex cursor-pointer flex-col gap-4 rounded-2xl border border-border bg-surface p-4 text-left text-foreground shadow-lg shadow-black/5 transition duration-300 hover:-translate-y-1.5 hover:border-accent hover:shadow-xl focus-visible:outline-none [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]"
              key={ev.id}
              onClick={() => handleSelect(ev.name)}
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-primary text-xl text-white shadow-lg shadow-accent/30">
                <Icon />
              </div>
              <div className="text-base font-bold leading-tight">{ev.name}</div>
              <span className="self-start rounded-full border border-border bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                {ev.category}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default EventsGrid;
