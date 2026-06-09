export default function DashboardLoading() {
  return (
    <div style={{ padding: '32px', maxWidth: 900 }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div className="skeleton-pulse" style={{ width: 80, height: 20, marginBottom: 6 }} />
          <div className="skeleton-pulse" style={{ width: 60, height: 14 }} />
        </div>
        <div className="skeleton-pulse" style={{ width: 112, height: 32, borderRadius: 6 }} />
      </div>

      {/* Section label */}
      <div className="skeleton-pulse" style={{ width: 56, height: 12, marginBottom: 10 }} />

      {/* Project list skeleton */}
      <div className="project-list">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-row">
            <div className="skeleton-pulse" style={{ width: 32, height: 32, borderRadius: 6, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton-pulse" style={{ width: '40%', height: 14, marginBottom: 5 }} />
              <div className="skeleton-pulse" style={{ width: '60%', height: 12 }} />
            </div>
            <div className="skeleton-pulse" style={{ width: 60, height: 12 }} />
            <div className="skeleton-pulse" style={{ width: 48, height: 20, borderRadius: 9999 }} />
            <div className="skeleton-pulse" style={{ width: 56, height: 12 }} />
            <div className="skeleton-pulse" style={{ width: 56, height: 28, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
