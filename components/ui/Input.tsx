import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-[11px] text-white/30 uppercase tracking-widest font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'bg-white/4 border border-white/8 text-white px-3 py-2.5 text-sm outline-none w-full transition-colors',
            'focus:border-lime/30 placeholder:text-white/20',
            error && 'border-red/40',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red/70">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
export default Input
