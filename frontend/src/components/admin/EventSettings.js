import { useState, useEffect } from "react";
import {
  CalendarDays as FaCalendarDays,
  Clock as FaClock,
  MapPin as FaLocationDot,
  Save as FaFloppyDisk,
  CheckCircle2 as FaCircleCheck,
  Info as FaCircleInfo,
  Instagram as FaInstagram,
  Youtube as FaYoutube,
  Facebook as FaFacebook,
  Linkedin as FaLinkedin,
  Globe as FaGlobe,
} from "lucide-react";
import { api } from "../../api";
import { DEFAULT_INFO } from "../../utils";

const SOCIAL_FIELDS = [
  {
    name: "instagram",
    label: "Instagram",
    Icon: FaInstagram,
    placeholder: "https://instagram.com/your-college",
  },
  {
    name: "youtube",
    label: "YouTube",
    Icon: FaYoutube,
    placeholder: "https://youtube.com/@your-college",
  },
  {
    name: "facebook",
    label: "Facebook",
    Icon: FaFacebook,
    placeholder: "https://facebook.com/your-college",
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    Icon: FaLinkedin,
    placeholder: "https://linkedin.com/school/your-college",
  },
  {
    name: "website",
    label: "Website",
    Icon: FaGlobe,
    placeholder: "https://your-college-website.edu",
  },
];

function EventSettings({ onUnauthorized }) {
  const [form, setForm] = useState(DEFAULT_INFO);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/api/settings")
      .then((data) => setForm({ ...DEFAULT_INFO, ...data }))
      .catch((err) => setMsg({ type: "warning", text: err.message }));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.eventDate ||
      !form.startTime ||
      !form.endTime ||
      !form.venue.trim()
    ) {
      setMsg({
        type: "warning",
        text: "Please fill in the date, times and venue.",
      });
      return;
    }
    setSaving(true);
    try {
      await api("/api/settings", { method: "PUT", body: form, auth: true });
      setMsg({
        type: "success",
        text: "Saved. The student portal now shows the new details.",
      });
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setMsg({ type: "warning", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="max-w-2xl rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/5 sm:p-7">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <FaCalendarDays className="text-accent" /> Event info and social links
      </h2>
      <p className="mb-5 text-sm text-muted">
        The date, time and venue appear in the hero, countdown, registration
        panel and footer. Social links appear in the campus section and footer.
      </p>

      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="eventDate"
            className="flex items-center gap-2 font-semibold text-muted"
          >
            <FaCalendarDays /> Event date
          </label>
          <input
            className="field-control"
            id="eventDate"
            name="eventDate"
            type="date"
            value={form.eventDate}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="startTime"
              className="flex items-center gap-2 font-semibold text-muted"
            >
              <FaClock /> Start time
            </label>
            <input
              className="field-control"
              id="startTime"
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="endTime"
              className="flex items-center gap-2 font-semibold text-muted"
            >
              <FaClock /> End time
            </label>
            <input
              className="field-control"
              id="endTime"
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="venue"
            className="flex items-center gap-2 font-semibold text-muted"
          >
            <FaLocationDot /> Venue
          </label>
          <input
            className="field-control"
            id="venue"
            name="venue"
            maxLength={120}
            value={form.venue}
            onChange={handleChange}
          />
        </div>

        <h3 className="mt-2 text-base font-bold text-muted">
          College social media (leave blank to hide)
        </h3>
        {SOCIAL_FIELDS.map(({ name, label, Icon, placeholder }) => (
          <div className="flex flex-col gap-2" key={name}>
            <label
              htmlFor={name}
              className="flex items-center gap-2 font-semibold text-muted"
            >
              <Icon /> {label}
            </label>
            <input
              className="field-control"
              id={name}
              name={name}
              type="url"
              placeholder={placeholder}
              value={form[name] || ""}
              onChange={handleChange}
            />
          </div>
        ))}

        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white shadow-md shadow-primary/15 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaFloppyDisk /> {saving ? "Saving..." : "Save"}
        </button>
      </form>

      {msg && (
        <div
          className={`mt-5 flex items-start gap-3 rounded-xl border-l-[6px] bg-field p-4 font-semibold text-foreground ${msg.type === "success" ? "border-emerald-600" : "border-amber-500"}`}
          role="status"
        >
          {msg.type === "success" ? <FaCircleCheck /> : <FaCircleInfo />}
          <span>{msg.text}</span>
        </div>
      )}
    </section>
  );
}

export default EventSettings;
