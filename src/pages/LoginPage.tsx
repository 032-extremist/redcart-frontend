import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      const next = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";
      navigate(next, { replace: true });
    } catch {
      setError("Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
      <h1 className="font-display text-3xl font-semibold">Login</h1>
      <p className="mt-1 text-sm text-zinc-600">Access your account to manage cart and orders.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="block text-sm text-zinc-700">
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-zinc-700">
          Password
          <input
            type="password"
            required
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-red px-5 py-3 text-sm font-semibold text-white"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-600">
        No account?{" "}
        <Link to="/register" className="font-semibold text-brand-red">
          Register
        </Link>
      </p>
      <p className="mt-1 text-sm text-zinc-600">
        Forgot password?{" "}
        <Link to="/password-reset" className="font-semibold text-brand-red">
          Reset
        </Link>
      </p>
    </div>
  );
}
