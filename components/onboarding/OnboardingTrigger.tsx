'use client'

import { SHOW_EVENT } from './OnboardingModal'

export default function OnboardingTrigger() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event(SHOW_EVENT))}
      title="Show getting started guide"
      style={{
        width: '100%',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '5px 2px',
        fontSize: 12,
        color: 'var(--text-muted)',
        fontFamily: 'inherit',
        textAlign: 'left',
        borderRadius: 4,
        transition: 'color 0.1s',
      }}
    >
      <span style={{
        width: 15, height: 15,
        border: '1.5px solid currentColor',
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 9,
        fontWeight: 700,
        lineHeight: 1,
        flexShrink: 0,
      }}>
        ?
      </span>
      Show guide
    </button>
  )
}
