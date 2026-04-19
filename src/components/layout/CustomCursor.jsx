import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [visible, setVisible] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)

  const cursorX = useSpring(x, { stiffness: 500, damping: 35 })
  const cursorY = useSpring(y, { stiffness: 500, damping: 35 })
  const trailX = useSpring(x, { stiffness: 170, damping: 30 })
  const trailY = useSpring(y, { stiffness: 170, damping: 30 })

  useEffect(() => {
    const pointerFine = window.matchMedia('(pointer:fine)').matches
    if (!pointerFine) {
      return undefined
    }

    const onMove = (event) => {
      x.set(event.clientX - 10)
      y.set(event.clientY - 10)
      setVisible(true)
    }

    const onLeave = () => setVisible(false)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [x, y])

  return (
    <>
      <motion.div
        className="pointer-events-none fixed z-50 hidden h-12 w-12 rounded-full bg-cyan-300/20 blur-xl md:block"
        style={{
          x: trailX,
          y: trailY,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.25 }}
      />
      <motion.div
        className="pointer-events-none fixed z-50 hidden h-5 w-5 rounded-full border border-cyan-100/70 bg-cyan-200/70 mix-blend-screen shadow-[0_0_20px_rgba(34,211,238,0.55)] md:block"
        style={{
          x: cursorX,
          y: cursorY,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  )
}
