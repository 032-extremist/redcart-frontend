import { Link } from "react-router-dom";

export function ErrorPage() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">500</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-brand-ink">Something went wrong</h1>
      <p className="mt-2 text-sm text-zinc-700">An unexpected error occurred while loading this page.</p>
      <Link to="/" className="mt-6 inline-block rounded-xl bg-brand-red px-5 py-2 text-sm font-semibold text-white">
        Back to Home
      </Link>
    </div>
  );
}
