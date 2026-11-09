export default function KnowledgeHubLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading the Knowledge Hub…</span>

      <div className="vx-skeleton h-3 w-28" />
      <div className="vx-skeleton mt-4 h-8 w-3/4 max-w-md" />
      <div className="vx-skeleton mt-3 h-3 w-full max-w-lg" />
      <div className="vx-skeleton mt-2 h-3 w-2/3 max-w-sm" />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="vx-card p-4">
            <div className="vx-skeleton h-9 w-9 rounded-[var(--radius)]" />
            <div className="vx-skeleton mt-3 h-4 w-2/3" />
            <div className="vx-skeleton mt-2 h-3 w-full" />
            <div className="vx-skeleton mt-2 h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
