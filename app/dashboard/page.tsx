import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProjectCard from '@/components/dashboard/ProjectCard'
import OnboardingModal from '@/components/onboarding/OnboardingModal'
import type { Project } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const all = (projects ?? []) as Project[]
  const active = all.filter(p => p.status === 'active')
  const completed = all.filter(p => p.status === 'completed')
  const archived = all.filter(p => p.status === 'archived')

  return (
    <>
    <OnboardingModal />
    <div className="page-fade" style={{ padding: '32px', maxWidth: 860 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Projects</h1>
          {all.length > 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {all.length} project{all.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link href="/projects/new" className="btn btn-primary">
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
          New project
        </Link>
      </div>

      {all.length === 0 ? (
        <div className="empty-state" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
          <div className="empty-icon">📁</div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No projects yet</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, maxWidth: 300 }}>
            Create your first QC project by uploading a cluster folder.
          </p>
          <Link href="/projects/new" className="btn btn-primary">
            Create project
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {active.length > 0 && (
            <Section title="Active" count={active.length}>
              {active.map(p => <ProjectCard key={p.id} project={p} />)}
            </Section>
          )}
          {completed.length > 0 && (
            <Section title="Completed" count={completed.length}>
              {completed.map(p => <ProjectCard key={p.id} project={p} />)}
            </Section>
          )}
          {archived.length > 0 && (
            <Section title="Archived" count={archived.length}>
              {archived.map(p => <ProjectCard key={p.id} project={p} />)}
            </Section>
          )}
        </div>
      )}
    </div>
    </>
  )
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{count}</span>
      </div>
      <div className="project-list">
        {children}
      </div>
    </div>
  )
}
