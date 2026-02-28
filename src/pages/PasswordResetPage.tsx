import { FormEvent, useState } from "react";
import { authApi } from "../api/auth";

export function PasswordResetPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");

  const requestReset = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");

    try {
      await authApi.requestPasswordReset(email);
      setStatus("Reset request queued. Continue below to set a new password in this demo flow.");
    } catch {
      setStatus("Unable to process reset request.");
    }
  };

  const confirmReset = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");

    try {
      await authApi.confirmPasswordReset({ email, newPassword });
      setStatus("Password reset complete. You can now login with the new password.");
      setNewPassword("");
    } catch {
      setStatus("Unable to reset password.");
    }
  };

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
      <h1 className="font-display text-3xl font-semibold">Password Reset</h1>
      <p className="mt-1 text-sm text-zinc-600">Request and confirm a password reset.</p>

      <form onSubmit={requestReset} className="mt-5 space-y-3">
        <label className="block text-sm text-zinc-700">
          Account Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold">
          Request Reset
        </button>
      </form>

      <form onSubmit={confirmReset} className="mt-6 space-y-3 border-t border-zinc-200 pt-5">
        <label className="block text-sm text-zinc-700">
          New Password
          <input
            type="password"
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded-xl bg-brand-red px-4 py-2 text-sm font-semibold text-white">
          Confirm Reset
        </button>
      </form>

      {status && <p className="mt-4 text-sm text-zinc-700">{status}</p>}
    </div>
  );
}
