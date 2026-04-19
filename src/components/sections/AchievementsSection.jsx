import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Flag, Trophy, Zap } from 'lucide-react'
import { achievementStats, ctfHighlights } from '../../data/cvData'
import { fadeInUp, hoverLift, viewportConfig } from '../../lib/motion'
import { SectionHeader } from '../shared/SectionHeader'

const icons = [Trophy, Zap, Trophy, Zap]

function CountUp({ value }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.4 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return

    let frameId
    const duration = 900
    const startedAt = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      setDisplay(Math.round(value * progress))
      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [isInView, value])

  return <span ref={ref}>{display}</span>
}

export function AchievementsSection() {
  return (
    <section id="achievements" className="section-shell">
      <SectionHeader
        eyebrow="Achievements"
        title="Competitive & Security Milestones"
        description="Highlights from competitive programming and cybersecurity participation extracted from CV data."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {achievementStats.map((item, index) => {
          const Icon = icons[index] ?? Trophy

          return (
            <motion.article
              key={item.label}
              className="glass premium-hover rounded-2xl p-5"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
              transition={{ duration: 0.42, delay: index * 0.06 }}
              whileHover={hoverLift}
            >
              <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/12 text-cyan-100 shadow-[0_0_20px_rgba(56,189,248,0.26)]">
                <Icon size={18} />
              </span>
              <p className="text-3xl font-bold text-white">
                <CountUp value={item.value} />
                {item.suffix}
              </p>
              <p className="mt-1 text-sm font-semibold text-cyan-100">{item.label}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">{item.detail}</p>
            </motion.article>
          )
        })}
      </div>

      <motion.div
        className="mt-5 rounded-2xl border border-white/12 bg-slate-900/40 p-5"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        <div className="mb-3 flex items-center gap-2 text-cyan-100">
          <Flag size={16} />
          <h3 className="text-sm font-semibold">CTF Participation</h3>
        </div>
        <ul className="space-y-2 text-sm text-slate-300">
          {ctfHighlights.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}
