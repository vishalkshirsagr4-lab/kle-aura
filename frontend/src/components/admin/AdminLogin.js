import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck as FaUserShield,
  User as FaUser,
  Lock as FaLock,
  Eye as FaEye,
  EyeOff as FaEyeSlash,
  Info as FaCircleInfo,
  LogIn as FaArrowRightToBracket,
  ArrowLeft as FaArrowLeft,
} from "lucide-react";
import { api, setToken } from "../../api";

function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError("Enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      const data = await api("/api/auth/login", { method: "POST", body: form });
      setToken(data.token);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-[440px] rounded-3xl border border-border bg-surface p-6 text-center shadow-xl shadow-slate-900/5 sm:p-10">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl text-primary">
          <FaUserShield />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Admin portal</h1>
        <p className="my-1 text-muted">AI-AURA · Sign in to manage the event</p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 grid gap-5 text-left"
        >
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground" htmlFor="username">
              <FaUser className="text-primary" /> Username
            </label>
            <input
              id="username"
              name="username"
              className="field-control"
              autoComplete="username"
              placeholder="Admin username"
              value={form.username}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground" htmlFor="password">
              <FaLock className="text-primary" /> Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                className="field-control pr-12"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Admin password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center border-0 bg-transparent text-muted"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="flex items-start gap-3 rounded-xl border-l-[6px] border-amber-500 bg-field p-4 text-foreground"
              role="alert"
            >
              <FaCircleInfo />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-md shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FaArrowRightToBracket />
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-2 font-bold text-accent no-underline hover:underline"
        >
          <FaArrowLeft /> Back to student portal
        </Link>
      </div>
    </div>
  );
}

export default AdminLogin;
