import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function setRole(formData: FormData) {
  'use server'
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const role = formData.get('role') as string
  if (!email || !['admin', 'user'].includes(role)) return

  const db = createAdminClient()
  const { data, error } = await db
    .from('profiles')
    .update({ role })
    .eq('email', email)
    .select('id')

  if (error || !data?.length) {
    // Surface error via redirect with query param
    const { redirect } = await import('next/navigation')
    redirect(`/admin/settings?error=${encodeURIComponent(error?.message ?? `No user found with email: ${email}`)}`)
  }

  revalidatePath('/admin/settings')
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const db = createAdminClient()
  const { data: admins } = await db
    .from('profiles')
    .select('id, email, created_at')
    .eq('role', 'admin')
    .order('created_at', { ascending: true })

  const error = searchParams.error

  return (
    <div className="page-fade" style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.375rem' }}>Settings</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Manage admin access for this workspace.
      </p>

      {/* ── Current admins ── */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.875rem' }}>
          Admins ({admins?.length ?? 0})
        </h2>

        <div className="card" style={{ overflow: 'hidden' }}>
          {(admins ?? []).length === 0 ? (
            <p style={{ padding: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              No admins found.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  <th style={{ padding: '0.625rem 1rem', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Email</th>
                  <th style={{ padding: '0.625rem 1rem', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Since</th>
                  <th style={{ padding: '0.625rem 1rem', borderBottom: '1px solid var(--border)' }} />
                </tr>
              </thead>
              <tbody>
                {(admins ?? []).map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{a.email}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <form action={setRole}>
                        <input type="hidden" name="email" value={a.email} />
                        <input type="hidden" name="role" value="user" />
                        <button
                          type="submit"
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--red)', fontSize: '0.8125rem' }}
                        >
                          Revoke admin
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ── Promote user ── */}
      <section>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Promote a user to admin
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
          The user must have signed up first. Enter their exact email address.
        </p>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'var(--red-light)', color: '#b91c1c', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={setRole} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              Email address
            </label>
            <input
              name="email"
              type="email"
              required
              className="input"
              placeholder="user@example.com"
            />
          </div>
          <input type="hidden" name="role" value="admin" />
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
            Grant admin
          </button>
        </form>
      </section>
    </div>
  )
}
