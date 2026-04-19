import { motion } from 'framer-motion'
import { Sparkles, ShieldCheck, Smartphone } from 'lucide-react'
import { fadeInUp, hoverLift, viewportConfig } from '../../lib/motion'
import { SectionHeader } from '../shared/SectionHeader'

const points = [
  {
    icon: Smartphone,
    title: 'Mobile Product Craftsmanship',
    text: 'Building production-grade Android and Flutter apps with thoughtful UX and strong performance baselines.',
  },
  {
    icon: ShieldCheck,
    title: 'Reverse Engineering Mindset',
    text: 'Analyzing mobile internals and workflows to harden systems, audit behavior, and improve reliability.',
  },
  {
    icon: Sparkles,
    title: 'Obsessed With Quality',
    text: 'From architecture to final polish, every release aims for clear maintainability and measurable impact.',
  },
]

export function AboutSection() {
  return (
    <section id="about" className="section-shell">
      <SectionHeader
        eyebrow="About"
        title="Engineer, Researcher, Builder"
        description="I focus on resilient mobile software and deeply technical problem-solving with a strong security mindset."
      />

      <motion.div
        className="mb-6 rounded-2xl border border-white/10 bg-slate-900/35 p-5 sm:p-6"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          I build
          <span className="mx-1 rounded-md bg-cyan-300/15 px-2 py-0.5 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.45)]">
            scalable mobile apps
          </span>
          for Android and Flutter, then go deeper with
          <span className="mx-1 rounded-md bg-indigo-300/15 px-2 py-0.5 text-indigo-200 shadow-[0_0_18px_rgba(129,140,248,0.45)]">
            reverse engineering
          </span>
          to understand internals, improve reliability, and ship
          <span className="ml-1 rounded-md bg-cyan-300/15 px-2 py-0.5 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.45)]">
            security-focused products
          </span>
          .
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {points.map((point, index) => {
          const Icon = point.icon
          return (
            <motion.article
              key={point.title}
              className="premium-hover rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              whileHover={hoverLift}
            >
              <Icon className="mb-3 h-5 w-5 text-cyan-200" />
              <h3 className="mb-2 text-base font-semibold text-white">{point.title}</h3>
              <p className="text-sm leading-relaxed text-slate-300">{point.text}</p>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
