import {
  Megaphone as FaBullhorn,
  CalendarDays as FaCalendarDays,
  AlertTriangle as FaTriangleExclamation,
} from "lucide-react";
import { formatShort } from "../utils";

const CATEGORY = {
  general: { Icon: FaBullhorn, label: "Update" },
  date: { Icon: FaCalendarDays, label: "Date" },
  important: { Icon: FaTriangleExclamation, label: "Important" },
};

function Announcements({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="flex items-center gap-2 border-l-[6px] border-accent pl-4 text-2xl font-extrabold sm:text-3xl">
          <FaBullhorn className="text-accent" /> ANNOUNCEMENTS
        </h2>
        <p className="text-sm text-muted">Latest updates from the organisers</p>
      </div>

      <div className="grid gap-4">
        {items.map((n) => {
          const cat = CATEGORY[n.category] || CATEGORY.general;
          const Icon = cat.Icon;
          const tone =
            n.category === "important" ? "border-rose-500" : "border-border";
          const iconTone =
            n.category === "date"
              ? "from-cyan to-primary"
              : n.category === "important"
                ? "from-red-600 to-red-700"
                : "from-accent to-primary";
          return (
            <article
              className={`flex gap-4 rounded-2xl border bg-surface p-4 shadow-lg shadow-black/5 backdrop-blur sm:p-5 ${tone}`}
              key={n._id}
            >
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl text-white ${iconTone}`}
              >
                <Icon />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold">{n.title}</h3>
                  <span className="rounded-full border border-border bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                    {cat.label}
                  </span>
                </div>
                <p className="whitespace-pre-line font-medium text-muted">
                  {n.message}
                </p>
                {n.date && (
                  <span className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-accent">
                    <FaCalendarDays /> {formatShort(n.date)}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Announcements;
