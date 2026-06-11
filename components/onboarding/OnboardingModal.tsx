'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

export const SHOW_EVENT = 'show-onboarding'
const LS_KEY = 'qc_onboarding_complete'
const TOTAL = 4

/* ── SVG sub-components (render inside <svg> tags) ───── */

function FaceCircle({
  cx, cy, r = 13, fc, bg,
}: {
  cx: number; cy: number; r?: number; fc: string; bg: string
}) {
  const hr = Math.round(r * 0.46)
  const hy = Math.round(r * 0.30)
  const sx = Math.round(r * 0.60)
  const sy = Math.round(r * 0.42)
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={bg} />
      <circle cx={cx} cy={cy - hy} r={hr} fill={fc} />
      <path
        d={`M${cx - sx} ${cy + sy} Q${cx} ${cy + sy - r * 0.3} ${cx + sx} ${cy + sy}`}
        stroke={fc}
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  )
}

function GreenCheck({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="#10B981" />
      <path
        d={`M${cx - 3.5} ${cy + 0.5} l2.5 2.5 4.5-5`}
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  )
}

/* ── Step 1: Before → After illustration ─────────────── */

function BeforeAfterSVG() {
  return (
    <svg
      viewBox="0 0 460 136"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', display: 'block' }}
    >
      {/* Left: messy cluster — purple+pink+amber+purple mixed */}
      <rect x="2" y="8" width="148" height="108" rx="10" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
      <FaceCircle cx={38}  cy={46} fc="#6366F1" bg="#EEF2FF" />
      <FaceCircle cx={110} cy={46} fc="#EC4899" bg="#FDF2F8" />
      <FaceCircle cx={62}  cy={87} fc="#6366F1" bg="#EEF2FF" />
      <FaceCircle cx={112} cy={87} fc="#F59E0B" bg="#FFFBEB" />
      <text x="76" y="130" textAnchor="middle" fontSize="10.5" fill="#94A3B8" fontFamily="Inter,system-ui,sans-serif">
        Raw model output
      </text>

      {/* Arrow */}
      <path d="M158 62 H197" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <path d="M193 57.5 L199 62 L193 66.5" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Top-right: purple cluster — 3 faces, same person */}
      <rect x="207" y="8" width="251" height="52" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
      <FaceCircle cx={245} cy={34} fc="#6366F1" bg="#EEF2FF" />
      <FaceCircle cx={293} cy={34} fc="#6366F1" bg="#EEF2FF" />
      <FaceCircle cx={341} cy={34} fc="#6366F1" bg="#EEF2FF" />
      <GreenCheck cx={450} cy={15} />

      {/* Bottom-left: pink cluster — 1 face */}
      <rect x="207" y="68" width="119" height="52" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
      <FaceCircle cx={267} cy={94} fc="#EC4899" bg="#FDF2F8" />
      <GreenCheck cx={318} cy={75} />

      {/* Bottom-right: amber cluster — 1 face */}
      <rect x="332" y="68" width="126" height="52" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
      <FaceCircle cx={395} cy={94} fc="#F59E0B" bg="#FFFBEB" />
      <GreenCheck cx={450} cy={75} />

      <text x="332" y="130" textAnchor="middle" fontSize="10.5" fill="#94A3B8" fontFamily="Inter,system-ui,sans-serif">
        Clean dataset
      </text>
    </svg>
  )
}

/* ── Step 2: folder tree ─────────────────────────────── */

function FolderTree() {
  const GRAY  = '#475569'   // tree chars
  const BLUE  = '#818CF8'   // folder names (lighter accent)
  const WHITE = '#F1F5F9'   // file names
  const ROOT  = '#94A3B8'   // root folder
  const mono  = '"Cascadia Code","Fira Code",ui-monospace,Menlo,monospace'
  const row   = { lineHeight: '1.95' }
  return (
    <div style={{ background: '#0F172A', borderRadius: 10, padding: '14px 18px', fontFamily: mono, fontSize: 12.5, marginBottom: 14, overflowX: 'auto' }}>
      <div style={row}><span style={{ color: ROOT  }}>clusters_folder/</span></div>
      <div style={row}><span style={{ color: GRAY  }}>├── </span><span style={{ color: BLUE  }}>person_0/</span></div>
      <div style={row}><span style={{ color: GRAY  }}>│   ├── </span><span style={{ color: WHITE }}>face_001.jpg</span></div>
      <div style={row}><span style={{ color: GRAY  }}>│   └── </span><span style={{ color: WHITE }}>face_002.jpg</span></div>
      <div style={row}><span style={{ color: GRAY  }}>├── </span><span style={{ color: BLUE  }}>person_1/</span></div>
      <div style={row}><span style={{ color: GRAY  }}>│   ├── </span><span style={{ color: WHITE }}>face_003.jpg</span></div>
      <div style={row}><span style={{ color: GRAY  }}>│   └── </span><span style={{ color: WHITE }}>face_004.jpg</span></div>
      <div style={row}><span style={{ color: GRAY  }}>└── </span><span style={{ color: BLUE  }}>person_2/</span></div>
      <div style={row}><span style={{ color: GRAY  }}>    └── </span><span style={{ color: WHITE }}>face_005.jpg</span></div>
    </div>
  )
}

/* ── Step 3 icons ────────────────────────────────────── */

function RemoveIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect x="2"  y="2"  width="17" height="17" rx="4" fill="#EEF2FF" />
      <circle cx="10.5" cy="8.5"  r="3.5" fill="#6366F1" opacity="0.7" />
      <rect x="25" y="2"  width="17" height="17" rx="4" fill="#EEF2FF" />
      <circle cx="33.5" cy="8.5"  r="3.5" fill="#6366F1" opacity="0.7" />
      <rect x="2"  y="25" width="17" height="17" rx="4" fill="#EEF2FF" />
      <circle cx="10.5" cy="31.5" r="3.5" fill="#6366F1" opacity="0.7" />
      {/* Removed cell */}
      <rect x="25" y="25" width="17" height="17" rx="4" fill="#FEE2E2" />
      <line x1="28.5" y1="28.5" x2="38.5" y2="38.5" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
      <line x1="38.5" y1="28.5" x2="28.5" y2="38.5" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MergeIcon() {
  return (
    <svg width="54" height="36" viewBox="0 0 54 36" fill="none" aria-hidden="true">
      <rect x="1"  y="8" width="14" height="20" rx="5" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      <circle cx="8"  cy="17" r="4" fill="#6366F1" opacity="0.65" />
      <rect x="19" y="8" width="14" height="20" rx="5" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      <circle cx="26" cy="17" r="4" fill="#6366F1" opacity="0.65" />
      <path d="M34 18 H40" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M37 15 L41 18 L37 21" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Merged result */}
      <rect x="41" y="5" width="12" height="26" rx="5" fill="#6366F1" />
      <circle cx="47" cy="14" r="3" fill="white" opacity="0.45" />
      <circle cx="47" cy="22" r="3" fill="white" opacity="0.45" />
    </svg>
  )
}

function ReassignIcon() {
  return (
    <svg width="54" height="36" viewBox="0 0 54 36" fill="none" aria-hidden="true">
      {/* Source: removed face (red) */}
      <rect x="1" y="12" width="13" height="12" rx="3" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.2" />
      <circle cx="7.5" cy="18" r="3" fill="#EF4444" opacity="0.55" />
      {/* Dashed arrow */}
      <path d="M15 18 H27" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2.5" />
      <path d="M24.5 15.5 L28 18 L24.5 20.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Target cluster */}
      <rect x="29" y="4" width="24" height="28" rx="6" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      <circle cx="41" cy="13" r="4" fill="#6366F1" opacity="0.4" />
      <circle cx="41" cy="24" r="4" fill="#6366F1" />
    </svg>
  )
}

/* ── Step 4: export button mockups ───────────────────── */

function ExportMockup() {
  const base: React.CSSProperties = {
    flex: 1, padding: '11px 16px', borderRadius: 8,
    display: 'flex', alignItems: 'center', gap: 8,
    cursor: 'default', userSelect: 'none',
  }
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
      <div style={{ ...base, background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <path d="M7.5 1.5 v8 M4.5 6.5 l3 3 3-3" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.5 12.5 H12.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Download CSV</span>
      </div>
      <div style={{ ...base, background: '#6366F1' }}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <path d="M1.5 7.5 L13.5 2.5 L8.5 13.5 L6.5 8.5 L1.5 7.5z" fill="white" opacity="0.9" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Send to admin</span>
      </div>
    </div>
  )
}

/* ── Per-slide content ───────────────────────────────── */

function renderSlide(i: number): React.ReactNode {
  switch (i) {
    case 0:
      return (
        <>
          <h2 id="ob-title" style={{ fontSize: 21, fontWeight: 700, color: '#0F172A', marginBottom: 12, lineHeight: 1.3 }}>
            Build a clean face recognition dataset
          </h2>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.65, marginBottom: 20 }}>
            This tool helps you create a high-quality golden dataset for face recognition training. It takes the raw output of an open-source face clustering model and lets you manually verify and correct it — removing wrong faces, merging split clusters, and reassigning misplaced faces.
          </p>
          <BeforeAfterSVG />
        </>
      )

    case 1:
      return (
        <>
          <h2 id="ob-title" style={{ fontSize: 21, fontWeight: 700, color: '#0F172A', marginBottom: 12, lineHeight: 1.3 }}>
            Upload your cluster folder
          </h2>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.65, marginBottom: 16 }}>
            Create a new project and upload a folder where each subfolder is one cluster. The subfolder name becomes the cluster ID.
          </p>
          <FolderTree />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
              <strong style={{ color: '#0F172A' }}>Supported:</strong> JPG, JPEG, PNG, WEBP
            </p>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="5" stroke="#94A3B8" strokeWidth="1.2" />
                <path d="M6 5.5 v3" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="6" cy="3.5" r=".6" fill="#94A3B8" />
              </svg>
              Images are stored securely and only visible to you
            </p>
          </div>
        </>
      )

    case 2: {
      const steps = [
        {
          num: 1,
          icon: <RemoveIcon />,
          title: 'Remove wrong faces',
          desc: "For each cluster, click any face that doesn't belong. Removed faces are saved temporarily and reviewed in Step 3.",
        },
        {
          num: 2,
          icon: <MergeIcon />,
          title: 'Merge duplicate clusters',
          desc: 'If the same person was split into multiple clusters, select them all and merge into one. The lowest cluster ID absorbs the rest.',
        },
        {
          num: 3,
          icon: <ReassignIcon />,
          title: 'Reassign removed faces',
          desc: 'Each face you removed in Step 1 gets reviewed here. Assign it to the correct cluster, create a new one, or discard it.',
        },
      ]
      return (
        <>
          <h2 id="ob-title" style={{ fontSize: 21, fontWeight: 700, color: '#0F172A', marginBottom: 20, lineHeight: 1.3 }}>
            Three steps to a clean dataset
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {steps.map(s => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: '#6366F1',
                  color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {s.num}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', marginBottom: 3 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.55 }}>{s.desc}</div>
                </div>
                <div style={{ flexShrink: 0, marginTop: 2, opacity: 0.85 }}>{s.icon}</div>
              </div>
            ))}
          </div>
        </>
      )
    }

    case 3:
      return (
        <>
          <h2 id="ob-title" style={{ fontSize: 21, fontWeight: 700, color: '#0F172A', marginBottom: 12, lineHeight: 1.3 }}>
            Export your results
          </h2>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.65, marginBottom: 20 }}>
            When you're done, export a CSV summary of every change you made — faces removed, clusters merged, faces reassigned. One click sends it directly to the admin.
          </p>
          <ExportMockup />
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
            <p style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.55, margin: 0 }}>
              <strong style={{ color: '#0F172A' }}>The CSV includes:</strong> filename, source cluster, destination cluster, and change type for every modification.
            </p>
          </div>
          <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', margin: 0 }}>
            Most projects take 30–60 minutes depending on dataset size.
          </p>
        </>
      )

    default:
      return null
  }
}

/* ── Main modal component ────────────────────────────── */

export default function OnboardingModal() {
  const [open, setOpen] = useState(false)
  const [slide, setSlide] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const [animKey, setAnimKey] = useState(0)

  // Use ref to avoid stale closure in keyboard handler
  const slideRef = useRef(0)
  slideRef.current = slide

  // Auto-show on first visit only
  useEffect(() => {
    if (!localStorage.getItem(LS_KEY)) setOpen(true)
  }, [])

  // Re-open from sidebar "?" button via custom event
  useEffect(() => {
    function handler() {
      setSlide(0)
      setDir(1)
      setAnimKey(k => k + 1)
      setOpen(true)
    }
    window.addEventListener(SHOW_EVENT, handler)
    return () => window.removeEventListener(SHOW_EVENT, handler)
  }, [])

  const dismiss = useCallback(() => {
    localStorage.setItem(LS_KEY, 'true')
    setOpen(false)
  }, [])

  // Stable goTo — uses ref to read current slide
  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= TOTAL) return
    setDir(idx > slideRef.current ? 1 : -1)
    setSlide(idx)
    setAnimKey(k => k + 1)
  }, [])

  // Keyboard: Escape = close, ← → = navigate
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') dismiss()
      if (e.key === 'ArrowRight') goTo(slideRef.current + 1)
      if (e.key === 'ArrowLeft')  goTo(slideRef.current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, dismiss, goTo])

  if (!open) return null

  const progress = ((slide + 1) / TOTAL) * 100
  const isLast = slide === TOTAL - 1

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          animation: 'ob-fade 150ms ease both',
        }}
      />

      {/* Modal card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ob-title"
        className="ob-modal"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '92vw',
          maxWidth: 580,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
          zIndex: 1001,
          overflow: 'hidden',
          animation: 'ob-modal-in 230ms cubic-bezier(0.16,1,0.3,1) both',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header: dots + progress bar + close ── */}
        <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>

            {/* Step dots */}
            <div style={{ display: 'flex', gap: 6 }} role="tablist" aria-label="Tour steps">
              {Array.from({ length: TOTAL }, (_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === slide}
                  aria-label={`Go to step ${i + 1}`}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === slide ? 22 : 7,
                    height: 7,
                    borderRadius: 9999,
                    background: i === slide ? '#6366F1' : i < slide ? '#A5B4FC' : '#E2E8F0',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'width 0.25s ease, background 0.2s ease',
                  }}
                />
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={dismiss}
              aria-label="Close tour"
              className="ob-close-btn"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                fontSize: 22,
                lineHeight: 1,
                padding: '0 4px',
                fontFamily: 'inherit',
                borderRadius: 4,
              }}
            >
              ×
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: '#F1F5F9', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: '#6366F1',
              width: `${progress}%`,
              transition: 'width 0.35s ease',
              borderRadius: 9999,
            }} />
          </div>
        </div>

        {/* ── Slide content (overflow-hidden clips the slide animation) ── */}
        <div
          className="ob-content"
          style={{ flex: 1, overflow: 'hidden', padding: '24px 32px', minHeight: 340 }}
        >
          <div
            key={animKey}
            style={{
              animation: `${dir > 0 ? 'ob-slide-right' : 'ob-slide-left'} 220ms cubic-bezier(0.16,1,0.3,1) both`,
            }}
          >
            {renderSlide(slide)}
          </div>
        </div>

        {/* ── Footer: skip | back | next/get-started ── */}
        <div style={{
          padding: '14px 32px 24px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}>
          {/* Skip tour (hidden on last step) */}
          {isLast ? (
            <div style={{ flex: 1 }} />
          ) : (
            <button
              onClick={dismiss}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                color: '#94A3B8',
                fontFamily: 'inherit',
                marginRight: 'auto',
                padding: '4px 0',
              }}
            >
              Skip tour
            </button>
          )}

          {slide > 0 && (
            <button onClick={() => goTo(slide - 1)} className="btn btn-secondary btn-sm">
              ← Back
            </button>
          )}

          {isLast ? (
            <Link href="/projects/new" onClick={dismiss} className="btn btn-primary btn-sm">
              Get started →
            </Link>
          ) : (
            <button onClick={() => goTo(slide + 1)} className="btn btn-primary btn-sm">
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Animation keyframes + mobile responsive */}
      <style>{`
        @keyframes ob-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ob-modal-in {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 16px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes ob-slide-right {
          from { opacity: 0; transform: translateX(36px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ob-slide-left {
          from { opacity: 0; transform: translateX(-36px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .ob-close-btn:hover { color: #0F172A; background: #F1F5F9; }
        @media (max-width: 600px) {
          .ob-modal {
            width: 100% !important;
            max-width: 100% !important;
            height: 100dvh !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            border-radius: 0 !important;
            animation: ob-modal-mobile 200ms ease both !important;
          }
          .ob-content {
            overflow-y: auto !important;
            min-height: 0 !important;
          }
        }
        @keyframes ob-modal-mobile {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
