import events from "../data/events";

// Endless ribbon of all 18 events (pauses on hover)
function Marquee() {
  const row = events.map((e) => {
    const Icon = e.icon;
    return (
      <span
        className="inline-flex items-center gap-2.5 whitespace-nowrap px-6 text-sm font-extrabold tracking-wide text-white"
        key={e.id}
      >
        <Icon className="text-amber-400" /> {e.name}
      </span>
    );
  });
  return (
    <div
      className="group -mx-4 my-5 overflow-hidden bg-gradient-to-r from-obsidian via-primary to-cyan py-4 shadow-xl sm:-mx-8 lg:-mx-10"
      aria-hidden="true"
    >
      <div className="flex w-max items-center animate-marquee motion-reduce:animate-none group-hover:[animation-play-state:paused]">
        {row}
        {row}
      </div>
    </div>
  );
}

export default Marquee;
