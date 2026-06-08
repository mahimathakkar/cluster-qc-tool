'use client'

import { useEffect, useState } from 'react'
import { createContext, useContext, useCallback } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'center',
        zIndex: 9999,
        pointerEvents: 'none',
      }}>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const colors = {
    success: { bg: 'var(--green)', color: '#fff' },
    error: { bg: 'var(--red)', color: '#fff' },
    info: { bg: '#1f2937', color: '#fff' },
  }

  const { bg, color } = colors[toast.type]

  return (
    <div style={{
      padding: '0.625rem 1.125rem',
      borderRadius: '8px',
      background: bg,
      color,
      fontSize: '0.875rem',
      fontWeight: 500,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      pointerEvents: 'auto',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(0.5rem)',
      transition: 'opacity 0.2s, transform 0.2s',
      whiteSpace: 'nowrap',
    }}>
      {toast.message}
    </div>
  )
}
