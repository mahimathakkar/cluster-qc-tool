import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProjectCard from '@/components/dashboard/ProjectCard'
import type { Project } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const activeProjects = (projects ?? []).filter((p: Project) => p.status === 'active')
  const completedProjects = (projects ?? []).filter((p: Project) => p.status === 'completed')
  const archivedProjects = (projects ?? []).filter((p: Project) => p.status === 'archived')

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Your projects</h1>
        <Link href="/projects/new" className="btn btn-primary">
          + New project
        </Link>
      </div>

      {(projects ?? []).length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No projects yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Create your first QC project by uploading a cluster folder.
          </p>
          <Link href="/projects/new" className="btn btn-primary">
            Create project
          </Link>
        </div>
      ) : (
        <>
          {activeProjects.length > 0 && (
            <Section title="Active" count={activeProjects.length}>
              {activeProjects.map((p: Project) => <ProjectCard key={p.id} project={p} />)}
            </Section>
          )}

          {completedProjects.length > 0 && (
            <Section title="Completed" count={completedProjects.length}>
              {completedProjects.map((p: Project) => <ProjectCard key={p.id} project={p} />)}
            </Section>
          )}

          {archivedProjects.length > 0 && (
            <Section title="Archived" count={archivedProjects.length}>
              {archivedProjects.map((p: Project) => <ProjectCard key={p.id} project={p} />)}
            </Section>
          )}
        </>
      )}
    </div>
  )
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        {title} ({count})
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {children}
      </div>
    </div>
  )
}
