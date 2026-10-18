import { Link } from "react-router-dom";
import {
  MapPin as FaLocationDot,
  Clock as FaClock,
  Users as FaUsers,
  ShieldCheck as FaUserShield,
  Landmark as FaBuildingColumns,
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
    </footer>
  );
}

export default Footer;
