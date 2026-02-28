export function Loader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-zinc-600">
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
      {label}
    </div>
  );
}
