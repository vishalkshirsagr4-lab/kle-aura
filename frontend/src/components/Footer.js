import { Link } from "react-router-dom";
import {
  MapPin as FaLocationDot,
  Clock as FaClock,
  Users as FaUsers,
  ShieldCheck as FaUserShield,
  Landmark as FaBuildingColumns,
  Code2,
  PhoneCall,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { formatShort, formatTime } from "../utils";
import { COLLEGE } from "../data/college";
import SocialLinks from "./SocialLinks";
import { WEBSITES } from "../data/rules";

function Footer({ info }) {
  return (
    <footer className="flex flex-wrap justify-center gap-x-8 gap-y-3 border-t border-border pt-8 pb-10 text-center text-sm text-muted">
      {/* College Title */}
      <div className="flex basis-full items-center justify-center gap-2 font-black text-foreground text-base">
        <FaBuildingColumns className="text-accent" /> {COLLEGE.name},{" "}
        {COLLEGE.place}
      </div>

      {/* Social Links */}
      <div className="basis-full flex justify-center">
        <SocialLinks info={info} />
      </div>

      {/* Event Logistics Quick Strip */}
      <span className="inline-flex items-center gap-2 font-medium">
        <FaLocationDot className="text-primary" /> {info.venue}
      </span>
      <span className="inline-flex items-center gap-2 font-medium">
        <FaClock className="text-primary" /> {formatShort(info.eventDate)} · {formatTime(info.startTime)}{" "}
        – {formatTime(info.endTime)}
      </span>
      <span className="inline-flex items-center gap-2 font-medium">
        <FaUsers className="text-accent" /> 18 Events · PUC Students Only
      </span>

      {/* Websites */}
      <span className="flex basis-full flex-wrap justify-center gap-4 text-xs font-semibold">
        {WEBSITES.map((w) => (
          <a
            className="text-primary hover:underline"
            key={w.url}
            href={w.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {w.text}
          </a>
        ))}
      </span>

      {/* Admin Portal Link */}
      <div className="basis-full">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-bold text-muted hover:text-accent hover:border-accent transition"
        >
          <FaUserShield className="size-3.5" />
          <span>Organizer &amp; Admin Portal</span>
        </Link>
      </div>

      {/* ================= ATTRACTIVE DEVELOPER CREDITS CARD ================= */}
      <div className="basis-full mt-6 pt-6 border-t border-border/80">
        <div className="mx-auto max-w-xl rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/[0.08] via-purple-500/[0.06] to-cyan-500/[0.08] p-5 sm:p-6 backdrop-blur-md shadow-lg shadow-indigo-500/5 transition-all hover:border-indigo-500/50 hover:shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            {/* Left: Info */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/40 bg-indigo-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                <Code2 className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Portal Architects &amp; Developers</span>
              </div>

              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Iranna M <span className="text-indigo-600 dark:text-indigo-400">&amp;</span> Vishal K
              </h4>

              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                BCA 3rd Semester · KLE Society&apos;s BCA &amp; BBA College
              </p>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mahalingpur — Event Tech &amp; Registration Portal
              </p>
            </div>

            {/* Right: Direct Call & WhatsApp Buttons */}
            <div className="flex sm:flex-col items-center gap-2 shrink-0">
              <a
                href="tel:9380929684"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-indigo-500/25 transition-all hover:scale-102 hover:shadow-lg active:scale-95"
                title="Call Developer / Tech Support"
              >
                <PhoneCall className="size-3.5" />
                <span>Call: 9380929684</span>
              </a>

              <a
                href="https://wa.me/919380929684?text=Hi%20Iranna%20%26%20Vishal,%20I%20have%20a%20query%20about%20the%20AI-AURA%202K26%20Portal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-950/40 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition-all hover:bg-emerald-500 hover:text-white active:scale-95"
                title="Chat on WhatsApp"
              >
                <MessageSquare className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp Support</span>
              </a>
            </div>
          </div>
        </div>

        {/* Scalability Badge for 600+ Students */}
        <div className="mt-4 text-center text-xs text-muted flex flex-wrap items-center justify-center gap-3">
          <span>© 2026 AI-AURA · KLE BCA &amp; BBA Mahalingpur</span>
          <span>•</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            ⚡ High-Capacity System: Built for 600+ Concurrent PUC Registrations
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
