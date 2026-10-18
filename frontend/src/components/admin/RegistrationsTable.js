import { useState, useMemo } from "react";
import { Search as FaMagnifyingGlass, Trash2 as FaTrash } from "lucide-react";
import events from "../../data/events";

function RegistrationsTable({ regs, onDelete }) {
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return regs.filter((r) => {
      if (eventFilter && r.event !== eventFilter) return false;
      if (!q) return true;
      return [r.fullname, r.email, r.college, r.phone, r.pucRoll, r.teamName]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [regs, query, eventFilter]);

  const confirmDelete = (r) => {
    if (window.confirm(`Delete the registration of ${r.fullname}?`)) {
      onDelete(r._id);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/5 sm:p-7">
      <div className="mb-3 flex flex-wrap gap-3">
        <div className="flex min-w-0 flex-1 basis-64 items-center gap-2 rounded-xl border border-border bg-field px-4 text-muted transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
          <FaMagnifyingGlass className="shrink-0" />
          <input
            className="min-w-0 flex-1 bg-transparent py-3 text-foreground outline-none placeholder:text-muted"
            placeholder="Search name, email, college, phone, roll, team"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="field-control w-auto min-w-40"
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
        >
          <option value="">All events</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.name}>
              {ev.name}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-3 text-sm text-muted">
        Showing {rows.length} of {regs.length} registrations
      </p>

      <div className="overflow-x-auto rounded-xl border border-border bg-field">
        <table className="min-w-[640px] w-full border-collapse text-sm">
          <thead>
            <tr>
              {[
                "#",
                "Name",
                "Email",
                "College",
                "Phone",
                "Event",
                "Roll no.",
                "Team",
                "Registered",
                "",
              ].map((label, index) => (
                <th
                  key={index}
                  className="whitespace-nowrap bg-gradient-to-br from-primary to-primary px-4 py-3 text-left text-xs font-bold uppercase text-white"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  className="border-t border-border px-4 py-8 text-center text-muted"
                >
                  No registrations found.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={r._id} className="hover:bg-accent/5">
                {[
                  i + 1,
                  r.fullname,
                  r.email,
                  r.college,
                  r.phone,
                  r.event,
                  r.pucRoll,
                  r.teamName || "—",
                  new Date(r.createdAt).toLocaleDateString(),
                ].map((cell, index) => (
                  <td
                    key={index}
                    className="border-t border-border px-4 py-3 align-top"
                  >
                    {cell}
                  </td>
                ))}
                <td className="border-t border-border px-4 py-3 align-top">
                  <button
                    className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-field text-rose-600 transition hover:bg-rose-600 hover:text-white"
                    onClick={() => confirmDelete(r)}
                    aria-label={`Delete ${r.fullname}`}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default RegistrationsTable;
