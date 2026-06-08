import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        border: 'var(--border)',
        'text-main': 'var(--text)',
        'text-muted': 'var(--text-muted)',
        destructive: 'var(--red)',
        'destructive-light': 'var(--red-light)',
        success: 'var(--green)',
        'success-light': 'var(--green-light)',
        info: 'var(--blue)',
        'info-light': 'var(--blue-light)',
        warning: 'var(--amber)',
        'warning-light': 'var(--amber-light)',
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
}

export default config
