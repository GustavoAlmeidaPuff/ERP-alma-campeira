export function PageSkeleton() {
  return (
    <div className="p-6 space-y-5 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-44 rounded-lg" style={{ background: 'var(--ac-border)' }} />
        <div className="h-9 w-32 rounded-lg" style={{ background: 'var(--ac-border)' }} />
      </div>

      {/* Search bar */}
      <div className="h-9 w-72 rounded-lg" style={{ background: 'var(--ac-border)' }} />

      {/* Table */}
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--ac-border)', background: 'var(--ac-card)' }}>
        {/* Table header */}
        <div className="flex gap-4 px-4 py-3 border-b" style={{ borderColor: 'var(--ac-border)', background: 'color-mix(in srgb, var(--ac-border) 30%, transparent)' }}>
          <div className="h-3.5 w-28 rounded" style={{ background: 'var(--ac-border)' }} />
          <div className="h-3.5 w-36 rounded" style={{ background: 'var(--ac-border)' }} />
          <div className="h-3.5 w-20 rounded ml-auto" style={{ background: 'var(--ac-border)' }} />
        </div>

        {/* Rows */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3.5 border-b last:border-0"
            style={{ borderColor: 'var(--ac-border)' }}
          >
            <div className="h-3.5 rounded" style={{ background: 'var(--ac-border)', width: `${80 + (i * 23) % 80}px` }} />
            <div className="h-3.5 rounded" style={{ background: 'var(--ac-border)', width: `${60 + (i * 37) % 100}px` }} />
            <div className="h-3.5 w-16 rounded ml-auto" style={{ background: 'var(--ac-border)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
