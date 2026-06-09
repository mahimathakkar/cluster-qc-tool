'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/admin', label: 'Overview', exact: true },
  { href: '/admin/users', label: 'Users', exact: false },
  { href: '/admin/settings', label: 'Settings', exact: false },
]

export default function AdminNav() {
  const path = usePathname()

  return (
    <nav className="sidebar-nav">
      {LINKS.map(l => {
        const active = l.exact ? path === l.href : path.startsWith(l.href)
        return (
          <Link key={l.href} href={l.href} className={`sidebar-link${active ? ' active' : ''}`}>
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
