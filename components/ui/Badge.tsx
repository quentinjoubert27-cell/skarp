import { cn } from '@/lib/utils'

type BadgeVariant = 'lime' | 'red' | 'orange' | 'gray' | 'coach' | 'sportif'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  lime: 'bg-lime/10 text-lime border border-lime/25',
  red: 'bg-red/10 text-red border border-red/20',
  orange: 'bg-orange/10 text-orange border border-orange/25',
  gray: 'bg-white/5 text-white/30 border border-white/10',
  coach: 'bg-lime/10 text-lime border border-lime/20',
  sportif: 'bg-white/6 text-white/55 border border-white/10',
}

export default function Badge({ variant = 'lime', children, className }: BadgeProps) {
  return (
    <span className={cn('text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full', variants[variant], className)}>
      {children}
    </span>
  )
}
