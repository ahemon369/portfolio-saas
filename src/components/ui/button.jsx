import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold tracking-[0.01em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 px-5 py-3 text-sm text-slate-950 shadow-[0_8px_22px_rgba(56,189,248,0.28)] hover:-translate-y-0.5 hover:brightness-105',
        secondary:
          'border border-cyan-300/35 bg-cyan-300/12 px-5 py-3 text-sm text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5 hover:bg-cyan-300/18',
        ghost: 'bg-transparent px-4 py-2 text-sm text-slate-200 hover:bg-white/8',
        outline:
          'border border-slate-300/25 bg-slate-900/45 px-5 py-3 text-sm text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-slate-800/70',
      },
      size: {
        default: 'h-11',
        sm: 'h-10 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-[0.95rem]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, loading = false, loadingText = '', children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const isDisabled = Boolean(disabled || loading)

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), loading && !asChild ? 'opacity-80' : null)}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading ? 'true' : undefined}
        {...props}
      >
        {loading && !asChild ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
        {loading && loadingText ? loadingText : children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
