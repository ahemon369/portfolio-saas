import { motion } from 'framer-motion'

export function Footer() {
  return (
    <motion.footer
      className="border-t border-white/10 py-6"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.45 }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
        <p>(c) {new Date().getFullYear()} Md Amran Hossin Emon. All rights reserved.</p>
        <p className="font-code tracking-[0.18em] text-cyan-300/80">Built with React + Tailwind + Motion</p>
      </div>
    </motion.footer>
  )
}
