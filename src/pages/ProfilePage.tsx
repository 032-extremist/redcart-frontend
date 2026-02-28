import { FormEvent, useEffect, useState } from "react";
import { usersApi } from "../api/users";

interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "ADMIN" | "CUSTOMER";
  createdAt: string;
}

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    usersApi.profile().then((data) => {
      setProfile(data);
      setForm({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? "",
      });
    });
  }, []);

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");

    try {
      const updated = await usersApi.updateProfile(form);
      setProfile(updated);
      setStatus("Profile updated successfully.");
    } catch {
      setStatus("Unable to update profile.");
    }
  };

  if (!profile) {
    return <p className="text-sm text-zinc-600">Loading profile...</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
        <h1 className="font-display text-3xl font-semibold">Profile</h1>
        <p className="mt-2 text-sm text-zinc-600">Account details and role access.</p>

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Email</dt>
            <dd className="font-medium text-zinc-800">{profile.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Role</dt>
            <dd className="font-medium text-zinc-800">{profile.role}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Member Since</dt>
            <dd className="font-medium text-zinc-800">{new Date(profile.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>
      </section>

      <form onSubmit={handleUpdate} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
        <h2 className="font-display text-2xl font-semibold">Update Profile</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-zinc-700">
            First Name
            <input
              value={form.firstName}
              onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm text-zinc-700">
            Last Name
            <input
              value={form.lastName}
              onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
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
        </div>

        {status && <p className="mt-4 text-sm text-zinc-600">{status}</p>}

        <button type="submit" className="mt-4 rounded-xl bg-brand-red px-5 py-2 text-sm font-semibold text-white">
          Save Changes
        </button>
      </form>
    </div>
  );
}
