import { motion } from 'framer-motion'
import { BriefcaseBusiness, CheckCircle2, MapPin } from 'lucide-react'
import { experienceTimeline } from '../../data/cvData'
import { fadeInUp, hoverLift, viewportConfig } from '../../lib/motion'
import { SectionHeader } from '../shared/SectionHeader'

export function ExperienceSection() {
  return (
    <section id="experience" className="section-shell">
      <SectionHeader
        eyebrow="Experience"
        title="Timeline of Delivery and Impact"
        description="CV-backed professional experience with tech stack context and measurable engineering outcomes."
      />

      <div className="relative pl-6 sm:pl-10">
        <div className="absolute left-2 top-1 h-[calc(100%-8px)] w-px bg-gradient-to-b from-cyan-300/80 via-indigo-300/60 to-transparent sm:left-4" />

        <div className="space-y-6">
          {experienceTimeline.map((experience, index) => (
            <motion.article
              key={experience.company + experience.role}
              className="premium-hover relative rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={hoverLift}
            >
              <span className="absolute left-[-1.52rem] top-6 flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/50 bg-slate-950 sm:left-[-2.15rem]">
                <BriefcaseBusiness className="h-3.5 w-3.5 text-cyan-200" />
              </span>

              <p className="font-code mb-2 text-xs uppercase tracking-[0.22em] text-cyan-300/80">{experience.period}</p>
              <h3 className="text-lg font-semibold text-slate-50">{experience.role}</h3>
              <p className="mb-2 text-sm text-indigo-200">{experience.company}</p>
              <p className="mb-3 inline-flex items-center gap-1.5 text-xs text-slate-300">
                <MapPin size={13} className="text-cyan-200" />
                {experience.location}
              </p>

              <div className="mb-4 flex flex-wrap gap-2">
                {experience.stack.map((item) => (
                  <span
                    key={`${experience.role}-${item}`}
                    className="rounded-full border border-white/14 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-200"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <ul className="space-y-2 text-sm leading-relaxed text-slate-300">
                {experience.impacts.map((point) => (
                  <li key={`${experience.role}-${point}`} className="flex gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-cyan-200" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
