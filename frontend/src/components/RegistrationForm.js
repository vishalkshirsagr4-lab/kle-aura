import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2 as DoneIcon, FileText as DoneFile } from "lucide-react";
import { PDF_URL } from "../data/rules";
import {
  User as FaUser,
  Mail as FaEnvelope,
  School as FaSchool,
  Phone as FaPhone,
  Trophy as FaTrophy,
  Contact as FaIdCard,
  CheckCircle2 as FaCircleCheck,
  Info as FaCircleInfo,
  Check as FaCheck,
  Users as FaPeopleGroup,
} from "lucide-react";
import events from "../data/events";
import { formatShort, formatTime } from "../utils";

const initialState = {
  fullname: "",
  email: "",
  college: "",
  phone: "",
  event: "",
  pucRoll: "",
  teamName: "",
};

const fields = [
  {
    name: "fullname",
    label: "Full name",
    type: "text",
    Icon: FaUser,
    placeholder: "Your full name",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    Icon: FaEnvelope,
    placeholder: "you@example.com",
  },
  {
    name: "college",
    label: "PUC College",
    type: "text",
    Icon: FaSchool,
    placeholder: "Your PUC college",
  },
  {
    name: "phone",
    label: "Phone",
    type: "tel",
    Icon: FaPhone,
    placeholder: "10-digit mobile number",
    maxLength: 10,
  },
  { name: "event", label: "Select event", type: "select", Icon: FaTrophy },
  {
    name: "pucRoll",
    label: "PUC Roll No.",
    type: "text",
    Icon: FaIdCard,
    placeholder: "Your PUC roll number",
  },
  {
    name: "teamName",
    label: "Team name (optional)",
    type: "text",
    Icon: FaPeopleGroup,
    placeholder: "Leave blank if you are registering solo",
    full: true,
  },
];

/* Portalled to <body>: the section it lives in sits inside a reveal transform,
   which would clamp this `fixed` backdrop to the form box and paint it under
   the sticky nav and toasts. */
const overlay = (node) => createPortal(node, document.body);

function RegistrationForm({ selectedEvent, info }) {
  const perks = [
    "Open to PUC students only",
    "Choose from 18 talent events",
    `${formatShort(info.eventDate)} · ${formatTime(info.startTime)} – ${formatTime(info.endTime)}`,
    "Team event? Use the same team name for every member",
  ];

  const [formData, setFormData] = useState(initialState);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);
  const doneRef = useRef(null);

  // Move focus into the confirmation dialog and hand it back on close
  useEffect(() => {
    if (!done) return undefined;
    const opener = document.activeElement;
    doneRef.current?.focus?.({ preventScroll: true });
    return () => {
      if (opener && typeof opener.focus === "function") {
        opener.focus({ preventScroll: true });
      }
    };
  }, [done]);

  // When a card is tapped in the events grid, pre-select that event
  useEffect(() => {
    if (selectedEvent && selectedEvent.name) {
      setFormData((prev) => ({ ...prev, event: selectedEvent.name }));
    }
  }, [selectedEvent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear warnings while typing, keep success visible
    setMessage((prev) => (prev && prev.type === "warning" ? null : prev));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullname, email, college, phone, event, pucRoll } = formData;

    if (
      !fullname.trim() ||
      !email.trim() ||
      !college.trim() ||
      !phone.trim() ||
      !event.trim() ||
      !pucRoll.trim()
    ) {
      setMessage({
        type: "warning",
        text: "Please fill in all fields before submitting.",
      });
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setMessage({
        type: "warning",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setMessage({
        type: "warning",
        text: "Phone number must be exactly 10 digits.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setMessage({
        type: "success",
        text: `Registered! ${fullname}, you are confirmed for "${event}". Take a screenshot of this message for your records.`,
      });
      setDone({ name: fullname, event });
      window.dispatchEvent(new Event("aura:registered"));
      setFormData(initialState);
    } catch (error) {
      setMessage({ type: "warning", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="mb-12 grid scroll-mt-24 grid-cols-1 overflow-hidden rounded-3xl border border-border bg-surface shadow-lg shadow-slate-900/5 lg:grid-cols-[0.8fr_1.2fr]"
      id="register"
    >
      <aside className="relative overflow-hidden bg-gradient-to-br from-[#312e81] via-primary to-accent p-7 text-white before:absolute before:-bottom-24 before:-right-20 before:size-64 before:rounded-full before:bg-white before:opacity-10 before:blur-3xl sm:p-9 lg:p-10">
        <div className="relative z-10">
          <h2 className="mb-2 text-3xl font-extrabold">Reserve your spot</h2>
          <p className="mb-5 text-white/90">
            Pick your event, fill in your details and you're in.
          </p>
          <ul className="grid list-none gap-3 p-0">
            {perks.map((perk) => (
              <li key={perk}>
                <FaCheck className="mt-0.5 size-6 shrink-0 rounded-full bg-white/20 p-1.5" />{" "}
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="p-6 sm:p-10">
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map(
              ({ name, label, type, Icon, placeholder, maxLength, full }) => (
                <div
                  className={`flex flex-col gap-2 ${full ? "sm:col-span-2" : ""}`}
                  key={name}
                >
                  <label
                    className="flex items-center gap-2 text-sm font-bold tracking-wide text-muted"
                    htmlFor={name}
                  >
                    <Icon className="text-accent" /> {label}
                  </label>
                  {type === "select" ? (
                    <select
                      className="field-control"
                      id={name}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                    >
                      <option value="">-- Choose an event --</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.name}>
                          {ev.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="field-control"
                      id={name}
                      type={type}
                      name={name}
                      placeholder={placeholder}
                      maxLength={maxLength}
                      value={formData[name]}
                      onChange={handleChange}
                    />
                  )}
                </div>
              ),
            )}
          </div>

          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-md shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            <FaCircleCheck />
            {loading ? "Submitting..." : "Confirm registration"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-5 flex items-start gap-3 rounded-xl border-l-[6px] bg-field p-4 font-semibold text-foreground ${message.type === "success" ? "border-emerald-600" : "border-amber-500"}`}
            role="status"
          >
            {message.type === "success" ? <FaCircleCheck /> : <FaCircleInfo />}
            <span>{message.text}</span>
          </div>
        )}
      </div>
      {done && overlay(
        <div
          className="fixed inset-0 z-[1300] grid place-items-center bg-obsidian/80 p-4 backdrop-blur-md"
          onClick={() => setDone(null)}
        >
          <div
            ref={doneRef}
            className="animate-sheet-up relative w-full max-w-[460px] rounded-3xl border border-border bg-[radial-gradient(30rem_14rem_at_50%_-10%,rgba(79,124,255,.3),transparent_70%)] bg-surface p-6 text-center text-foreground shadow-2xl sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Registration confirmed"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 grid size-[72px] place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-cyan text-3xl text-white shadow-[0_0_0_8px_rgba(22,163,74,.15),0_0_40px_rgba(54,228,255,.35)]">
              <DoneIcon />
            </div>
            <h3 className="mb-2 text-2xl font-extrabold">
              You're in, {String(done.name).split(" ")[0]}!
            </h3>
            <p className="mb-4 text-muted">
              Registered for <b>{done.event}</b>.
            </p>
            <ul className="mb-5 grid list-none gap-2 p-0 text-left text-sm">
              <li className="flex gap-2 rounded-xl bg-primary/10 p-3">
                <DoneIcon className="mt-0.5 shrink-0 text-cyan" /> Registration
                begins at 9:00 AM on event day.
              </li>
              <li className="flex gap-2 rounded-xl bg-primary/10 p-3">
                <DoneIcon className="mt-0.5 shrink-0 text-cyan" /> Carry your
                valid college ID and Aadhaar card.
              </li>
              <li className="flex gap-2 rounded-xl bg-primary/10 p-3">
                <DoneIcon className="mt-0.5 shrink-0 text-cyan" /> Report at
                least 15 minutes before your event.
              </li>
            </ul>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-cyan to-[#9db4ff] px-6 py-3 font-extrabold text-obsidian"
                href={PDF_URL}
                download="AI-AURA-2K26-Rules-and-Regulations.pdf"
              >
                <DoneFile /> Download rules
              </a>
              <button
                type="button"
                className="rounded-full border border-border px-5 py-3 font-bold text-foreground hover:bg-field"
                onClick={() => setDone(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default RegistrationForm;
