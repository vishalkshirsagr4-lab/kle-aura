import { useState, useEffect, useCallback } from "react";
import {
  Megaphone as FaBullhorn,
  CalendarDays as FaCalendarDays,
  AlertTriangle as FaTriangleExclamation,
  Plus as FaPlus,
  Save as FaFloppyDisk,
  Pen as FaPen,
  Trash2 as FaTrash,
  CheckCircle2 as FaCircleCheck,
  Info as FaCircleInfo,
  X as FaXmark,
} from "lucide-react";
import { api } from "../../api";
import { formatShort } from "../../utils";

const CATEGORY = {
  general: { Icon: FaBullhorn, label: "Update" },
  date: { Icon: FaCalendarDays, label: "Date" },
  important: { Icon: FaTriangleExclamation, label: "Important" },
};

const EMPTY = { title: "", message: "", category: "general", date: "" };

function AnnouncementsManager({ onUnauthorized }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await api("/api/announcements"));
    } catch (err) {
      setMsg({ type: "warning", text: err.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMsg(null);
  };

  const reset = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      setMsg({ type: "warning", text: "Title and message are required." });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api(`/api/announcements/${editingId}`, {
          method: "PUT",
          body: form,
          auth: true,
        });
      } else {
        await api("/api/announcements", {
          method: "POST",
          body: form,
          auth: true,
        });
      }
      setMsg({
        type: "success",
        text: editingId
          ? "Announcement updated."
          : "Announcement published to the student portal.",
      });
      reset();
      load();
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setMsg({ type: "warning", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (n) => {
    setEditingId(n._id);
    setForm({
      title: n.title,
      message: n.message,
      category: n.category,
      date: n.date || "",
    });
    setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (n) => {
    if (!window.confirm(`Delete "${n.title}"?`)) return;
    try {
      await api(`/api/announcements/${n._id}`, {
        method: "DELETE",
        auth: true,
      });
      if (editingId === n._id) reset();
      load();
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setMsg({ type: "warning", text: err.message });
    }
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1fr_1.2fr]">
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/5 sm:p-7">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <FaBullhorn className="text-accent" />{" "}
          {editingId ? "Edit announcement" : "New announcement"}
        </h2>
        <p className="mb-5 text-sm text-muted">
          Everything you post here appears in the student portal instantly.
        </p>

        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="font-semibold text-muted">
              Title
            </label>
            <input
              className="w-full rounded-full border-2 border-border bg-field px-5 py-3 text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
              id="title"
              name="title"
              maxLength={120}
              placeholder="e.g. Reporting time changed"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="font-semibold text-muted">
              Message
            </label>
            <textarea
              className="w-full resize-y rounded-2xl border-2 border-border bg-field px-5 py-3 text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
              id="message"
              name="message"
              rows="4"
              maxLength={1000}
              placeholder="Write the announcement"
              value={form.message}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="category" className="font-semibold text-muted">
                Type
              </label>
              <select
                className="w-full rounded-full border-2 border-border bg-field px-5 py-3 text-foreground outline-none focus:border-accent"
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="general">Update</option>
                <option value="date">Date / schedule</option>
                <option value="important">Important</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="date" className="font-semibold text-muted">
                Date (optional)
              </label>
              <input
                className="w-full rounded-full border-2 border-border bg-field px-5 py-3 text-foreground outline-none focus:border-accent"
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary to-accent px-5 py-3 font-bold text-white shadow-lg shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
            >
              {editingId ? <FaFloppyDisk /> : <FaPlus />}
              {saving ? "Saving..." : editingId ? "Save changes" : "Publish"}
            </button>
            {editingId && (
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-border bg-field px-5 py-3 font-bold text-foreground hover:border-accent"
                onClick={reset}
              >
                <FaXmark /> Cancel
              </button>
            )}
          </div>
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

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/5 sm:p-7">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <FaBullhorn className="text-accent" /> Published ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="py-5 text-center text-muted">No announcements yet.</p>
        ) : (
          <ul className="grid list-none gap-3 p-0">
            {items.map((n) => {
              const cat = CATEGORY[n.category] || CATEGORY.general;
              const Icon = cat.Icon;
              return (
                <li
                  key={n._id}
                  className="flex flex-wrap justify-between gap-4 rounded-xl border border-border bg-field p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Icon /> <b>{n.title}</b>
                      <span className="rounded-full border border-border bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                        {cat.label}
                      </span>
                    </div>
                    <p className="my-2 whitespace-pre-line text-sm text-muted">
                      {n.message}
                    </p>
                    {n.date && (
                      <small className="inline-flex items-center gap-2 font-semibold text-accent">
                        <FaCalendarDays /> {formatShort(n.date)}
                      </small>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <button
                      className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-field text-accent hover:bg-accent hover:text-white"
                      onClick={() => startEdit(n)}
                      aria-label="Edit"
                    >
                      <FaPen />
                    </button>
                    <button
                      className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-field text-rose-600 hover:bg-rose-600 hover:text-white"
                      onClick={() => remove(n)}
                      aria-label="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default AnnouncementsManager;
