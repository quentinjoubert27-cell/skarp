'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ToastItem { id: number; title: string; message?: string; type?: 'success' | 'error' }

const ToastContext = createContext<{ toast: (t: Omit<ToastItem, 'id'>) => void }>({ toast: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback(({ title, message, type = 'success' }: Omit<ToastItem, 'id'>) => {
    const id = Date.now()
    setToasts(p => [...p, { id, title, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[600] flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'bg-cards border border-white/8 px-4 py-3 min-w-[240px] max-w-xs flex items-start gap-3',
              'animate-fade-in',
              t.type === 'error' ? 'border-l-[3px] border-l-red' : 'border-l-[3px] border-l-lime'
            )}
          >
            <svg className={cn('w-4 h-4 mt-0.5 flex-shrink-0', t.type === 'error' ? 'stroke-red' : 'stroke-lime')} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {t.type === 'error'
                ? <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>
                : <polyline points="20 6 9 17 4 12"/>}
            </svg>
            <div>
              <p className="text-sm font-medium">{t.title}</p>
              {t.message && <p className="text-xs text-white/40 mt-0.5">{t.message}</p>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
