import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-[0.01em] transition-all duration-300',
  {
  variants: {
    variant: {
      default: 'border-cyan-300/35 bg-cyan-300/12 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.18)]',
      muted: 'border-slate-500/45 bg-slate-700/35 text-slate-200',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
