import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck as FaUserShield,
  PieChart as FaChartPie,
  Users as FaUsers,
  FileText as FaFileLines,
  Megaphone as FaBullhorn,
  CalendarDays as FaCalendarDays,
  RefreshCw as FaRotate,
  ArrowLeft as FaArrowLeft,
  LogOut as FaRightFromBracket,
  Info as FaCircleInfo,
} from "lucide-react";
import { api } from "../../api";
import { buildStats } from "../../lib/utils";
import Overview from "./Overview";
import RegistrationsTable from "./RegistrationsTable";
import Reports from "./Reports";
import AnnouncementsManager from "./AnnouncementsManager";
import EventSettings from "./EventSettings";

const TABS = [
  { id: "overview", label: "Overview", Icon: FaChartPie },
  { id: "students", label: "Registrations", Icon: FaUsers },
  { id: "reports", label: "Reports", Icon: FaFileLines },
  { id: "announce", label: "Announcements", Icon: FaBullhorn },
  { id: "info", label: "Event info", Icon: FaCalendarDays },
];

function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("overview");
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("/api/registrations", { auth: true });
      setRegs(data);
      setError("");
    } catch (err) {
      if (err.status === 401) {
        onLogout();
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => buildStats(regs), [regs]);

  const handleDelete = async (id) => {
    try {
      await api(`/api/registrations/${id}`, { method: "DELETE", auth: true });
      setRegs((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      if (err.status === 401) return onLogout();
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-5 sm:px-8 sm:py-8 print:invisible">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 text-foreground shadow-sm sm:p-6 print:hidden">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-xl text-primary">
            <FaUserShield />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">AI-AURA Admin</h1>
            <p className="text-sm text-muted">Event control panel</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={load}
            disabled={loading}
          >
            <FaRotate /> {loading ? "Loading" : "Refresh"}
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground no-underline transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <FaArrowLeft /> Student portal
          </Link>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
            onClick={onLogout}
          >
            <FaRightFromBracket /> Logout
          </button>
        </div>
      </header>

      <nav className="mb-6 flex gap-2 overflow-x-auto pb-2 print:hidden" aria-label="Admin sections">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${tab === id ? "border-primary bg-primary text-white shadow-md shadow-primary/20" : "border-border bg-surface text-muted hover:border-primary/50 hover:text-foreground"}`}
            onClick={() => setTab(id)}
          >
            <Icon /> {label}
          </button>
        ))}
      </nav>

      {error && (
        <div
          className="my-5 flex items-start gap-3 rounded-xl border-l-[6px] border-amber-500 bg-field p-4 font-semibold text-foreground print:hidden"
          role="alert"
        >
          <FaCircleInfo />
          <span>{error}</span>
        </div>
      )}

      {tab === "overview" && <Overview stats={stats} regs={regs} />}
      {tab === "students" && (
        <RegistrationsTable regs={regs} onDelete={handleDelete} />
      )}
      {tab === "reports" && <Reports regs={regs} stats={stats} />}
      {tab === "announce" && <AnnouncementsManager onUnauthorized={onLogout} />}
      {tab === "info" && <EventSettings onUnauthorized={onLogout} />}
    </div>
  );
}

export default AdminDashboard;
