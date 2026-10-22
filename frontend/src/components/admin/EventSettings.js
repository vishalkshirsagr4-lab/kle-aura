import { useState, useEffect } from "react";
import {
  CalendarDays as FaCalendarDays,
  Clock as FaClock,
  MapPin as FaLocationDot,
  Save as FaFloppyDisk,
  CheckCircle2 as FaCircleCheck,
  Info as FaCircleInfo,
  Plus as FaPlus,
  Trash2 as FaTrash,
  Instagram as FaInstagram,
  Youtube as FaYoutube,
  Facebook as FaFacebook,
  Linkedin as FaLinkedin,
  Globe as FaGlobe,
} from "lucide-react";
import { api } from "../../api";
import { DEFAULT_INFO } from "../../utils";
import { SOCIAL_PLATFORMS } from "../../data/college";

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

  const updateDepartmentSocial = (field, index, key, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field] || []).map((link, i) =>
        i === index ? { ...link, [key]: value } : link
      ),
    }));
    setMsg(null);
  };

  const addDepartmentSocial = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), { platform: "Instagram", url: "" }],
    }));
    setMsg(null);
  };

  const removeDepartmentSocial = (field, index) => {
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
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
    for (const [department, links] of [
      ["BCA", form.bcaSocials || []],
      ["BBA", form.bbaSocials || []],
    ]) {
      for (const link of links) {
        if (!link.platform && !link.url) continue;
        try {
          const url = new URL(link.url);
          if (!["http:", "https:"].includes(url.protocol)) throw new Error();
        } catch {
          setMsg({
            type: "warning",
            text: `Enter a valid http:// or https:// URL for each ${department} social link.`,
          });
          return;
        }
      }
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
          College-wide social media (leave blank to hide)
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

        {[
          { field: "bcaSocials", label: "BCA social media" },
          { field: "bbaSocials", label: "BBA social media" },
        ].map(({ field, label }) => (
          <fieldset className="grid gap-3 rounded-xl border border-border p-4" key={field}>
            <legend className="px-1 font-bold text-muted">{label}</legend>
            {(form[field] || []).map((link, index) => {
              const platform = SOCIAL_PLATFORMS.find(
                (item) => item.name === link.platform
              ) || SOCIAL_PLATFORMS[0];
              const id = `${field}-${index}`;
              return (
                <div className="grid gap-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto]" key={id}>
                  <label className="sr-only" htmlFor={`${id}-platform`}>
                    {label} platform
                  </label>
                  <select
                    className="field-control"
                    id={`${id}-platform`}
                    value={link.platform}
                    onChange={(event) =>
                      updateDepartmentSocial(field, index, "platform", event.target.value)
                    }
                  >
                    {SOCIAL_PLATFORMS.map((item) => (
                      <option key={item.name} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                  <label className="sr-only" htmlFor={`${id}-url`}>
                    {label} {link.platform} URL
                  </label>
                  <input
                    className="field-control"
                    id={`${id}-url`}
                    type="url"
                    placeholder={platform.placeholder}
                    value={link.url}
                    onChange={(event) =>
                      updateDepartmentSocial(field, index, "url", event.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-3 font-semibold text-muted transition hover:border-red-400 hover:text-red-600"
                    onClick={() => removeDepartmentSocial(field, index)}
                    aria-label={`Remove ${label} link ${index + 1}`}
                  >
                    <FaTrash /> <span className="sm:sr-only">Remove</span>
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center gap-2 justify-self-start rounded-lg border border-primary/30 px-3 font-semibold text-primary transition hover:bg-primary/5"
              onClick={() => addDepartmentSocial(field)}
            >
              <FaPlus /> Add {label.replace(" social media", "")} link
            </button>
          </fieldset>
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
