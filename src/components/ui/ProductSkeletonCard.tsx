export function ProductSkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-3 shadow-soft">
      <div className="mb-3 h-44 rounded-xl bg-zinc-200" />
      <div className="mb-2 h-4 w-3/4 rounded bg-zinc-200" />
      <div className="mb-4 h-3 w-1/2 rounded bg-zinc-100" />
      <div className="h-10 rounded-lg bg-zinc-200" />
    </div>
  );
}
