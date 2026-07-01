'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export default function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/75 z-[300] flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={cn('bg-cards border border-white/8 p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto relative animate-fade-in', className)}>
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-7 h-7 border border-white/10 flex items-center justify-center text-white/35 hover:border-lime hover:text-lime transition-all"
        >
          ✕
        </button>
        {title && (
          <h2 className="font-barlow text-xl font-black uppercase mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}
