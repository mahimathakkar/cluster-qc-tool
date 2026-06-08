import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cluster QC Tool — Aftershoot',
  description: 'Quality control tool for AI-generated face clusters',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
