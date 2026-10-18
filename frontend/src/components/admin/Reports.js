import { useState, useMemo } from "react";
import {
  ClipboardList as FaClipboardList,
  Trophy as FaTrophy,
  Landmark as FaBuildingColumns,
  Users as FaPeopleGroup,
  TrendingUp as FaChartLine,
  Download as FaDownload,
  Printer as FaPrint,
} from "lucide-react";
import { downloadCSV, formatShort } from "../../utils";

function buildReports(regs, stats) {
  return [
    {
      id: "all",
      title: "All registrations",
      Icon: FaClipboardList,
      file: "ai-aura-all-registrations.csv",
      columns: [
        { key: "no", label: "#" },
        { key: "fullname", label: "Full name" },
        { key: "email", label: "Email" },
        { key: "college", label: "College" },
        { key: "phone", label: "Phone" },
        { key: "event", label: "Event" },
        { key: "pucRoll", label: "PUC roll no." },
        { key: "teamName", label: "Team" },
        { key: "registeredOn", label: "Registered on" },
      ],
      rows: regs.map((r, i) => ({
        no: i + 1,
        fullname: r.fullname,
        email: r.email,
        college: r.college,
        phone: r.phone,
        event: r.event,
        pucRoll: r.pucRoll,
        teamName: r.teamName || "",
        registeredOn: new Date(r.createdAt).toLocaleString(),
      })),
    },
    {
      id: "events",
      title: "Event-wise report",
      Icon: FaTrophy,
      file: "ai-aura-event-wise.csv",
      columns: [
        { key: "event", label: "Event" },
        { key: "registrations", label: "Registrations" },
        { key: "teams", label: "Teams" },
      ],
      rows: stats.eventRows,
    },
    {
      id: "colleges",
      title: "College-wise report",
      Icon: FaBuildingColumns,
      file: "ai-aura-college-wise.csv",
      columns: [
        { key: "college", label: "College" },
        { key: "students", label: "Students" },
        { key: "registrations", label: "Registrations" },
      ],
      rows: stats.collegeRows,
    },
    {
      id: "teams",
      title: "Team report",
      Icon: FaPeopleGroup,
      file: "ai-aura-teams.csv",
      columns: [
        { key: "team", label: "Team name" },
        { key: "event", label: "Event" },
        { key: "memberCount", label: "Members" },
        { key: "members", label: "Member names" },
        { key: "colleges", label: "College(s)" },
      ],
      rows: stats.teamRows,
    },
    {
      id: "timeline",
      title: "Daily registrations",
      Icon: FaChartLine,
      file: "ai-aura-daily-registrations.csv",
      columns: [
        { key: "dateLabel", label: "Date" },
        { key: "count", label: "Registrations" },
      ],
      rows: stats.timeline.map((d) => ({
        dateLabel: formatShort(d.date),
        count: d.count,
      })),
    },
  ];
}

function Reports({ regs, stats }) {
  const [active, setActive] = useState("all");
  const reports = useMemo(() => buildReports(regs, stats), [regs, stats]);
  const report = reports.find((r) => r.id === active);

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3 print:hidden">
        {reports.map(({ id, title, Icon, rows }) => (
          <button
            key={id}
            className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-accent ${active === id ? "border-transparent bg-gradient-to-br from-primary to-accent text-white" : "border-border bg-surface text-foreground"}`}
            onClick={() => setActive(id)}
          >
            <Icon
              className={
                active === id ? "text-xl text-white" : "text-xl text-accent"
              }
            />
            <span>{title}</span>
            <small className={active === id ? "text-white/80" : "text-muted"}>
              {rows.length} rows
            </small>
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/5 sm:p-7 print:absolute print:left-0 print:top-0 print:w-full print:border-0 print:bg-white print:p-0 print:shadow-none print:visible">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
          <h2 className="mb-0 flex items-center gap-2 text-xl font-bold">
            <report.Icon /> {report.title}
          </h2>
          <div className="flex flex-wrap gap-3 print:hidden">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary to-accent px-5 py-3 font-bold text-white shadow-lg shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() =>
                downloadCSV(report.file, report.columns, report.rows)
              }
              disabled={report.rows.length === 0}
            >
              <FaDownload /> Download CSV
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-border bg-field px-5 py-3 font-bold text-foreground hover:border-accent"
              onClick={() => window.print()}
            >
              <FaPrint /> Print / PDF
            </button>
          </div>
        </div>

        <p className="mb-3 text-sm text-muted">
          AI-AURA · generated {new Date().toLocaleString()} ·{" "}
          {report.rows.length} rows
        </p>

        <div className="overflow-x-auto rounded-xl border border-border bg-field print:overflow-visible print:border-0">
          <table className="min-w-[640px] w-full border-collapse text-sm print:min-w-0 print:text-[11px]">
            <thead>
              <tr>
                {report.columns.map((c) => (
                  <th
                    key={c.key}
                    className="whitespace-nowrap bg-primary px-4 py-3 text-left text-xs font-bold uppercase text-white print:[print-color-adjust:exact]"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.rows.length === 0 && (
                <tr>
                  <td
                    colSpan={report.columns.length}
                    className="border-t border-border px-4 py-8 text-center text-muted"
                  >
                    Nothing to report yet.
                  </td>
                </tr>
              )}
              {report.rows.map((row, i) => (
                <tr key={i}>
                  {report.columns.map((c) => (
                    <td
                      key={c.key}
                      className="border-t border-border px-4 py-3 align-top"
                    >
                      {row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Reports;
