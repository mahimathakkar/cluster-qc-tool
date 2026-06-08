export default function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>{label}</span>
          <span style={{ fontWeight: 600 }}>{pct}%</span>
        </div>
      )}
      <div style={{
        height: '8px',
        background: 'var(--border)',
        borderRadius: '9999px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'var(--blue)',
          borderRadius: '9999px',
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  )
}
