import {
  BookOpen as FaBookOpen,
  FileText as FaFilePdf,
  Download as FaDownload,
  HardDrive as FaGoogleDrive,
  Clock as FaClock,
  Contact as FaIdCard,
  Gavel as FaGavel,
  AlertTriangle as FaTriangleExclamation,
  Trophy as FaTrophy,
  Medal as FaMedal,
  Crown as FaCrown,
  Award as FaAward,
  Phone as FaPhone,
  Globe as FaGlobe,
  ArrowRight as FaArrowRight,
  MapPin as FaLocationDot,
} from "lucide-react";
import {
  PDF_URL,
  DRIVE_URL,
  WEBSITES,
  GENERAL,
  PRIZES,
  CONTACTS,
} from "../data/rules";

const GENERAL_ICON = { id: FaIdCard, clock: FaClock, gavel: FaGavel };
const PRIZE_ICON = [FaTrophy, FaMedal, FaCrown, FaAward];

// Download card, general rules, prizes, contacts and college websites
function RulesSection() {
  return (
    <section id="rules" className="mb-14 scroll-mt-4">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="flex items-center gap-2 border-l-[6px] border-accent pl-4 text-2xl font-extrabold sm:text-3xl">
          <FaBookOpen className="text-accent" /> RULES & GUIDELINES
        </h2>
        <p className="text-sm text-muted">
          Everything you need to know before event day
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-gradient-to-br from-obsidian via-primary to-accent p-5 text-white shadow-xl shadow-black/10 sm:p-6">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/15 text-3xl">
          <FaFilePdf />
        </div>
        <div className="min-w-60 flex-1">
          <h3 className="mb-1 text-xl font-bold">
            AI-AURA 2K26 Rules Brochure
          </h3>
          <p className="text-sm opacity-90">
            All 18 events, rules, judging focus and guidelines in one PDF. Save
            it on your phone.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-cyan to-[#9db4ff] px-6 py-3 font-extrabold text-obsidian"
            href={PDF_URL}
            download="AI-AURA-2K26-Rules-and-Regulations.pdf"
          >
            <FaDownload /> Download PDF
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-full border border-white/55 px-5 py-3 font-bold text-white no-underline hover:bg-white/15"
            href={DRIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGoogleDrive /> Open in Drive
          </a>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-4">
        {GENERAL.map((g) => {
          const Icon = GENERAL_ICON[g.icon];
          return (
            <div
              className="rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/5"
              key={g.title}
            >
              <div className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-accent to-cyan text-xl text-white">
                <Icon />
              </div>
              <h3 className="mb-2 mt-3 font-bold text-primary">{g.title}</h3>
              <ul className="grid list-disc gap-2 pl-5 text-sm leading-relaxed marker:text-accent">
                {g.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="my-4 flex items-center gap-3 rounded-xl bg-amber-500/20 p-4 text-sm font-semibold">
        <FaTriangleExclamation className="shrink-0 text-amber-600" /> The event
        schedule and proposed rules for new events are subject to confirmation
        by the organising committee.
      </p>

      <div className="my-5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
        {PRIZES.map((p, i) => {
          const Icon = PRIZE_ICON[i];
          return (
            <div
              className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-5 text-center font-bold text-white shadow-lg shadow-amber-500/30"
              key={p}
            >
              <Icon className="text-3xl" />
              <span>{p}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/5">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-primary">
            <FaPhone /> Event contacts
          </h3>
          {CONTACTS.map((c) => (
            <a
              className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-accent/10 p-3 text-foreground no-underline transition hover:translate-x-1 hover:bg-accent/20"
              key={c.phone}
              href={`tel:${c.phone}`}
            >
              <span className="flex flex-col">
                <b>{c.name}</b>
                <small className="text-muted">{c.role}</small>
              </span>
              <em className="font-bold not-italic text-accent">{c.phone}</em>
            </a>
          ))}
          <p className="mt-3 flex items-center gap-2 text-sm text-muted">
            <FaLocationDot /> KLE Society's BCA & BBA College, Mahalingpur
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/5">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-primary">
            <FaGlobe /> Visit our colleges
          </h3>
          {WEBSITES.map((w) => (
            <a
              className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-accent/10 p-3 text-foreground no-underline transition hover:translate-x-1 hover:bg-accent/20"
              key={w.url}
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex flex-col">
                <b>{w.label}</b>
                <small className="text-muted">{w.text}</small>
              </span>
              <FaArrowRight className="text-accent" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RulesSection;
