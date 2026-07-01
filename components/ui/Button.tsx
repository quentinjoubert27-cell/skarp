import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'lime' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'lime', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'font-barlow font-black uppercase tracking-widest transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed'
    const variants = {
      lime: 'bg-lime text-carbon hover:bg-[#d4ff5a]',
      outline: 'border border-white/15 text-white/60 hover:border-lime hover:text-lime bg-transparent',
      ghost: 'text-white/40 hover:text-lime bg-transparent',
      danger: 'border border-red/25 text-red/60 hover:border-red hover:text-red bg-transparent',
    }
    const sizes = {
      sm: 'px-4 py-1.5 text-xs',
      md: 'px-6 py-2.5 text-sm',
      lg: 'px-8 py-3.5 text-base',
    }
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12"/>
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export default Button
