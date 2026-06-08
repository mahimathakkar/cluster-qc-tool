'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        padding: '0.25rem 0.5rem',
        borderRadius: '6px',
      }}
    >
      Sign out
    </button>
  )
}
