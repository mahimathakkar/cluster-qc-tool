export default function ProjectLoading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header skeleton */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div className="skeleton-pulse" style={{ width: 88, height: 14 }} />
        <div className="skeleton-pulse" style={{ width: 140, height: 16 }} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <div className="skeleton-pulse" style={{ width: 32, height: 2 }} />}
              <div className="skeleton-pulse" style={{ width: 22, height: 22, borderRadius: '50%' }} />
              <div className="skeleton-pulse" style={{ width: 44, height: 12 }} />
            </div>
          ))}
        </div>
        <div className="skeleton-pulse" style={{ width: 60, height: 12 }} />
      </div>

      {/* Content area skeleton */}
      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div className="skeleton-pulse" style={{ width: 200, height: 18, marginBottom: 6 }} />
            <div className="skeleton-pulse" style={{ width: 120, height: 13 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="skeleton-pulse" style={{ width: 100, height: 32, borderRadius: 6 }} />
            <div className="skeleton-pulse" style={{ width: 130, height: 32, borderRadius: 6 }} />
          </div>
        </div>

        {/* Face tile skeletons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6, marginTop: 16 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="skeleton-pulse" style={{ aspectRatio: '1', borderRadius: 6 }} />
          ))}
        </div>
      </div>
    </div>
  )
}
