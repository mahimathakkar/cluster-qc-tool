import SignupForm from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              background: 'var(--text)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}>
              AS
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>Aftershoot</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.375rem' }}>
            Cluster QC Tool
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Create your account — no invite needed
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
