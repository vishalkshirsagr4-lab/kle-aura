import { Link } from "react-router-dom";
import {
  MapPin as FaLocationDot,
  Clock as FaClock,
  Users as FaUsers,
  ShieldCheck as FaUserShield,
  Landmark as FaBuildingColumns,
  Sparkles,
} from "lucide-react";
import { formatShort, formatTime } from "../utils";
import { COLLEGE } from "../data/college";
import SocialLinks from "./SocialLinks";
import { WEBSITES } from "../data/rules";

function Footer({ info }) {
  return (
    <footer className="flex flex-wrap justify-center gap-x-8 gap-y-3 border-t border-border pt-6 text-center text-sm text-muted">
      <div className="flex basis-full items-center justify-center gap-2 font-extrabold text-foreground">
        <FaBuildingColumns className="text-accent" /> {COLLEGE.name},{" "}
        {COLLEGE.place}
      </div>
      <SocialLinks info={info} />
      <span className="inline-flex items-center gap-2">
        <FaLocationDot /> {info.venue}
      </span>
      <span className="inline-flex items-center gap-2">
        <FaClock /> {formatShort(info.eventDate)} · {formatTime(info.startTime)}{" "}
        – {formatTime(info.endTime)}
      </span>
      <span className="inline-flex items-center gap-2">
        <FaUsers /> 18 events · PUC students only
      </span>
      <span className="flex basis-full flex-wrap justify-center gap-4">
        {WEBSITES.map((w) => (
          <a
            className="text-accent hover:underline"
            key={w.url}
            href={w.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {w.text}
          </a>
        ))}
      </span>
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-accent hover:underline"
      >
        <FaUserShield /> Admin portal
      </Link>
      <div className="basis-full border-t border-border/70 pt-4">
        <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          <Sparkles className="h-4 w-4 text-accent" />
          Designed &amp; developed by
        </p>
        <p className="mt-2 text-sm font-extrabold text-foreground">
          Iranna Mali <span className="px-1 text-accent">&amp;</span> Vishal K
        </p>
        <p className="mt-1 text-xs text-muted">3rd Semester Students</p>
      </div>
    </footer>
  );
}

export default Footer;
