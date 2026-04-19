import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { fadeInUp, viewportConfig } from '../../lib/motion'

export function SectionHeader({ eyebrow, title, description, className }) {
  return (
    <motion.header
      className={cn('mb-8 space-y-3 sm:mb-10', className)}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
    >
      <p className="font-code text-[0.68rem] uppercase tracking-[0.3em] text-cyan-200/85 sm:text-xs">{eyebrow}</p>
      <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-[2.2rem]">{title}</h2>
      {description ? <p className="max-w-2xl text-sm text-slate-300/95 sm:text-base">{description}</p> : null}
    </motion.header>
  )
}
