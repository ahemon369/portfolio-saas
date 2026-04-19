import { motion, useScroll, useSpring } from 'framer-motion'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 115,
    damping: 24,
    mass: 0.1,
  })

  return (
    <motion.div
      className="fixed left-0 top-0 z-50 h-1.5 w-full origin-left bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-400 shadow-[0_0_20px_rgba(34,211,238,0.45)]"
      style={{ scaleX }}
    />
  )
}
