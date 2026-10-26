import events from "./data/events";

export const DEFAULT_INFO = {
  eventDate: "2026-11-04",
  startTime: "09:00",
  endTime: "17:00",
  venue: "KLE Society's BCA & BBA College, Mahalingpur",
  instagram: "",
  youtube: "",
  facebook: "",
  linkedin: "",
  website: "https://www.klebcamahalingpur.com",
  bcaSocials: [
    {
      platform: "Instagram",
      url: "https://www.instagram.com/kle_bba_mahalingapur/",
    },
  ],
  bbaSocials: [{ platform: "X", url: "https://x.com/klebbamlp2026" }],
};

const parseISO = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// "2026-11-03" -> "3 – 11 – 2026"
export const formatDash = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${Number(d)} – ${Number(m)} – ${y}`;
};

// "2026-11-03" -> "3 Nov 2026"
export const formatShort = (iso) =>
  iso
    ? parseISO(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

// "09:00" -> "9AM", "17:30" -> "5:30PM"
export const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return m ? `${hh}:${String(m).padStart(2, "0")}${suffix}` : `${hh}${suffix}`;
};

export const eventStart = (info) => {
  const d = parseISO(info.eventDate);
  const [h, m] = (info.startTime || "09:00").split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
};

/* ---------------- CSV ---------------- */

export function toCSV(columns, rows) {
  const esc = (v) => {
    let s = v === null || v === undefined ? "" : String(v);
    // stop spreadsheet formula injection from student-typed text
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = columns.map((c) => esc(c.label)).join(",");
  const body = rows.map((r) => columns.map((c) => esc(r[c.key])).join(","));
  return "\uFEFF" + [head, ...body].join("\r\n"); // BOM so Excel reads UTF-8
}

export function downloadCSV(filename, columns, rows) {
  const blob = new Blob([toCSV(columns, rows)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------------- Stats ---------------- */

const norm = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");

export function buildStats(regs) {
  const emails = new Set();
  const colleges = new Map();
  const teams = new Map();
  const days = new Map();
  const evMap = new Map(
    events.map((e) => [e.name, { event: e.name, registrations: 0, teams: new Set() }])
  );

  regs.forEach((r) => {
    const email = norm(r.email);
    emails.add(email);

    const ck = norm(r.college);
    if (!colleges.has(ck)) {
      colleges.set(ck, {
        college: String(r.college || "").trim(),
        emails: new Set(),
        registrations: 0,
      });
    }
    const c = colleges.get(ck);
    c.emails.add(email);
    c.registrations += 1;

    if (!evMap.has(r.event)) {
      evMap.set(r.event, { event: r.event, registrations: 0, teams: new Set() });
    }
    const ev = evMap.get(r.event);
    ev.registrations += 1;

    const teamName = String(r.teamName || "").trim();
    if (teamName) {
      const tk = norm(r.event) + "|" + norm(teamName);
      ev.teams.add(tk);
      if (!teams.has(tk)) {
        teams.set(tk, {
          team: teamName,
          event: r.event,
          members: [],
          colleges: new Set(),
        });
      }
      const t = teams.get(tk);
      t.members.push(r.fullname);
      t.colleges.add(String(r.college || "").trim());
    }

    const day = new Date(r.createdAt).toLocaleDateString("en-CA"); // YYYY-MM-DD
    days.set(day, (days.get(day) || 0) + 1);
  });

  return {
    totalRegistrations: regs.length,
    totalStudents: emails.size,
    totalColleges: colleges.size,
    totalTeams: teams.size,
    collegeRows: [...colleges.values()]
      .map((c) => ({
        college: c.college,
        students: c.emails.size,
        registrations: c.registrations,
      }))
      .sort((a, b) => b.students - a.students || a.college.localeCompare(b.college)),
    eventRows: [...evMap.values()].map((e) => ({
      event: e.event,
      registrations: e.registrations,
      teams: e.teams.size,
    })),
    teamRows: [...teams.values()]
      .map((t) => ({
        team: t.team,
        event: t.event,
        memberCount: t.members.length,
        members: t.members.join("; "),
        colleges: [...t.colleges].join("; "),
      }))
      .sort((a, b) => a.event.localeCompare(b.event) || a.team.localeCompare(b.team)),
    timeline: [...days.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, count })),
  };
}
