import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/apiError";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(form);
      navigate("/");
    } catch (registrationError) {
      setError(getApiErrorMessage(registrationError, "Registration failed. Check details and retry."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
      <h1 className="font-display text-3xl font-semibold">Register</h1>
      <p className="mt-1 text-sm text-zinc-600">Create an account to save cart, checkout, and track orders.</p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-zinc-700">
          First Name
          <input
            required
            value={form.firstName}
            onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-zinc-700">
          Last Name
          <input
            required
            value={form.lastName}
            onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-zinc-700 md:col-span-2">
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-zinc-700 md:col-span-2">
          Phone
          <input
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-zinc-700 md:col-span-2">
          Password
          <input
            type="password"
            required
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
          <span className="mt-1 block text-xs text-zinc-500">
            Minimum 8 chars, at least 1 uppercase letter and 1 number.
          </span>
        </label>

        {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 w-full rounded-xl bg-brand-red px-5 py-3 text-sm font-semibold text-white"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-600">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-brand-red">
          Login
        </Link>
      </p>
    </div>
  );
}
