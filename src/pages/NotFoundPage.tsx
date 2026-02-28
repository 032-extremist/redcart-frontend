import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-zinc-600">The page you are looking for does not exist or was moved.</p>
      <Link to="/" className="mt-6 inline-block rounded-xl bg-brand-red px-5 py-2 text-sm font-semibold text-white">
        Return Home
      </Link>
    </div>
  );
}
