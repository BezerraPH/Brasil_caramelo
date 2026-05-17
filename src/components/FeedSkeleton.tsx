export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando feed">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bc-card bc-skeleton-pulse p-5 ${i < 3 ? `bc-stagger-${i + 1}` : ""}`}
        >
          <div className="mb-3 flex gap-3">
            <div className="bc-skeleton h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="bc-skeleton h-4 w-32 rounded-lg" />
              <div className="bc-skeleton h-3 w-24 rounded-lg" />
            </div>
          </div>
          <div className="bc-skeleton mb-3 aspect-video w-full rounded-xl" />
          <div className="bc-skeleton h-3 w-full rounded-lg" />
          <div className="bc-skeleton mt-2 h-3 w-4/5 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
