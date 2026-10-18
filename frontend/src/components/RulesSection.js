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
    <section id="rules" className="mb-10 scroll-mt-24 sm:mb-14">
      <div className="mb-5 flex flex-col items-start gap-2 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-4">
        <h2 className="section-heading text-lg sm:text-xl">
          <FaBookOpen className="text-accent" /> Rules & guidelines
        </h2>
        <p className="text-xs leading-relaxed text-muted sm:text-sm">
          Everything you need to know before event day
        </p>
      </div>

      <div className="flex flex-col items-start gap-4 rounded-2xl bg-gradient-to-br from-obsidian via-primary to-accent p-4 text-white shadow-lg shadow-primary/15 sm:flex-row sm:flex-wrap sm:items-center sm:p-6">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-2xl sm:size-16 sm:text-3xl">
          <FaFilePdf />
        </div>
        <div className="min-w-0 flex-1 sm:min-w-60">
          <h3 className="mb-1 text-lg font-bold sm:text-xl">
            AI-AURA 2K26 Rules Brochure
          </h3>
          <p className="text-sm leading-relaxed opacity-90">
            All 18 events, rules, judging focus and guidelines in one PDF. Save
            it on your phone.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
          <a
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-cyan to-[#9db4ff] px-5 py-3 text-sm font-extrabold text-obsidian transition-transform active:scale-[.98] sm:px-6 sm:text-base"
            href={PDF_URL}
            download="AI-AURA-2K26-Rules-and-Regulations.pdf"
          >
            <FaDownload /> Download PDF
          </a>
          <a
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/55 px-5 py-3 text-sm font-bold text-white no-underline transition-colors hover:bg-white/15 sm:text-base"
            href={DRIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGoogleDrive /> Open in Drive
          </a>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-[repeat(auto-fit,minmax(270px,1fr))] sm:gap-4">
        {GENERAL.map((g) => {
          const Icon = GENERAL_ICON[g.icon];
          return (
            <div
              className="rounded-2xl border border-border bg-surface p-4 shadow-lg shadow-black/5 sm:p-5"
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
      <p className="my-4 flex items-start gap-3 rounded-xl bg-amber-500/20 p-3 text-xs font-semibold leading-relaxed sm:items-center sm:p-4 sm:text-sm">
        <FaTriangleExclamation className="shrink-0 text-amber-600" /> The event
        schedule and proposed rules for new events are subject to confirmation
        by the organising committee.
      </p>

      <div className="my-4 grid grid-cols-2 gap-2.5 sm:my-5 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] sm:gap-4">
        {PRIZES.map((p, i) => {
          const Icon = PRIZE_ICON[i];
          return (
            <div
              className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-3 text-center text-sm font-bold text-white shadow-lg shadow-amber-500/30 sm:min-h-0 sm:p-5 sm:text-base"
              key={p}
            >
              <Icon className="text-3xl" />
              <span>{p}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-4">
        <div className="min-w-0 rounded-2xl border border-border bg-surface p-4 shadow-lg shadow-black/5 sm:p-5">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-primary">
            <FaPhone /> Event contacts
          </h3>
          {CONTACTS.map((c) => (
            <a
              className="mb-2 flex min-h-16 min-w-0 flex-col items-start justify-center gap-1 rounded-xl bg-accent/10 p-3 text-foreground no-underline transition-colors hover:bg-accent/20 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              key={c.phone}
              href={`tel:${c.phone}`}
            >
              <span className="flex min-w-0 flex-col">
                <b>{c.name}</b>
                <small className="text-muted">{c.role}</small>
              </span>
              <em className="font-bold not-italic text-accent sm:whitespace-nowrap">{c.phone}</em>
            </a>
          ))}
          <p className="mt-3 flex items-center gap-2 text-sm text-muted">
            <FaLocationDot /> KLE Society's BCA & BBA College, Mahalingpur
          </p>
        </div>
        <div className="min-w-0 rounded-2xl border border-border bg-surface p-4 shadow-lg shadow-black/5 sm:p-5">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-primary">
            <FaGlobe /> Visit our colleges
          </h3>
          {WEBSITES.map((w) => (
            <a
              className="mb-2 flex min-h-16 min-w-0 items-center justify-between gap-3 rounded-xl bg-accent/10 p-3 text-foreground no-underline transition-colors hover:bg-accent/20"
              key={w.url}
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex min-w-0 flex-col">
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
