import {
  GraduationCap as FaUserGraduate,
  Users as FaPeopleGroup,
  Landmark as FaBuildingColumns,
  ClipboardList as FaClipboardList,
  Trophy as FaTrophy,
  Clock as FaClock,
} from "lucide-react";

function StatCard({ Icon, value, label, hue }) {
  const color = {
    h1: "bg-indigo-50 text-indigo-700",
    h2: "bg-violet-50 text-violet-700",
    h3: "bg-sky-50 text-sky-700",
    h4: "bg-emerald-50 text-emerald-700",
  }[hue];
  return (
    <div
      className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 text-foreground shadow-sm"
    >
      <div className={`flex size-13 shrink-0 items-center justify-center rounded-2xl text-2xl ${color}`}>
        <Icon />
      </div>
      <div>
        <b className="block text-3xl font-extrabold leading-tight">{value}</b>
        <span className="text-sm font-medium text-muted">{label}</span>
      </div>
    </div>
  );
}

function BarList({ rows, labelKey, valueKey, empty }) {
  const max = Math.max(1, ...rows.map((r) => r[valueKey]));
  if (rows.length === 0)
    return <p className="py-5 text-center text-muted">{empty}</p>;
  return (
    <ul className="grid list-none gap-4 p-0">
      {rows.map((r) => (
        <li key={r[labelKey]}>
          <div className="mb-1 flex justify-between gap-4 text-sm">
            <span>{r[labelKey]}</span>
            <b>{r[valueKey]}</b>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full min-w-1 rounded-full bg-gradient-to-r from-primary to-[#9db4ff]"
              style={{ width: `${(r[valueKey] / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Registrations per day (from real registration dates) drawn as an SVG area chart
function TrendChart({ regs }) {
  const byDay = {};
  regs.forEach((r) => {
    const d = (r.createdAt || "").slice(0, 10);
    if (d) byDay[d] = (byDay[d] || 0) + 1;
  });
  const days = Object.keys(byDay).sort();
  if (days.length < 2)
    return (
      <p className="py-5 text-center text-muted">
        The trend appears after registrations arrive on at least two different
        days.
      </p>
    );
  const vals = days.map((d) => byDay[d]);
  const max = Math.max(...vals);
  const W = 600,
    H = 160,
    P = 10;
  const pts = vals.map((v, i) => [
    P + (i * (W - 2 * P)) / (vals.length - 1),
    H - P - (v / max) * (H - 2 * P),
  ]);
  const line = pts.map((p) => p.join(",")).join(" ");
  return (
    <div>
      <svg
        className="h-40 w-full overflow-visible"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Registrations per day"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="tg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#4f46e5" stopOpacity=".35" />
            <stop offset="1" stopColor="#4f46e5" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`${P},${H - P} ${line} ${W - P},${H - P}`}
          fill="url(#tg)"
        />
        <polyline
          points={line}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle key={days[i]} cx={p[0]} cy={p[1]} r="4" fill="#06b6d4">
            <title>{`${days[i]}: ${vals[i]}`}</title>
          </circle>
        ))}
      </svg>
      <div className="mt-2 flex justify-between gap-3 text-xs text-muted">
        <span>{days[0]}</span>
        <b className="text-foreground">Peak: {max} / day</b>
        <span>{days[days.length - 1]}</span>
      </div>
    </div>
  );
}

function Overview({ stats, regs }) {
  const topEvents = [...stats.eventRows]
    .sort((a, b) => b.registrations - a.registrations)
    .slice(0, 8);
  const topColleges = stats.collegeRows.slice(0, 8);
  const recent = regs.slice(0, 6);

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          Icon={FaUserGraduate}
          value={stats.totalStudents}
          label="Students registered"
          hue="h1"
        />
        <StatCard
          Icon={FaPeopleGroup}
          value={stats.totalTeams}
          label="Teams registered"
          hue="h2"
        />
        <StatCard
          Icon={FaBuildingColumns}
          value={stats.totalColleges}
          label="Colleges coming"
          hue="h3"
        />
        <StatCard
          Icon={FaClipboardList}
          value={stats.totalRegistrations}
          label="Total registrations"
          hue="h4"
        />
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/5 sm:p-7">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <FaClock className="text-accent" /> Registrations over time
        </h2>
        <TrendChart regs={regs} />
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/5 sm:p-7">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <FaTrophy /> Registrations by event
          </h2>
          <BarList
            rows={topEvents}
            labelKey="event"
            valueKey="registrations"
            empty="No registrations yet."
          />
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/5 sm:p-7">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <FaBuildingColumns /> Students by college
          </h2>
          <BarList
            rows={topColleges}
            labelKey="college"
            valueKey="students"
            empty="No colleges yet."
          />
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/5 sm:p-7">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <FaClock /> Latest registrations
        </h2>
        {recent.length === 0 ? (
          <p className="py-5 text-center text-muted">No registrations yet.</p>
        ) : (
          <ul className="grid list-none gap-3 p-0">
            {recent.map((r) => (
              <li
                key={r._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-field p-4"
              >
                <div>
                  <b className="block">{r.fullname}</b>
                  <span className="text-sm text-muted">{r.college}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-border bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                    {r.event}
                  </span>
                  <small className="text-muted">
                    {new Date(r.createdAt).toLocaleString()}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Overview;
