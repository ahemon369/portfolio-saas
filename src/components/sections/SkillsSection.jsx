import { motion } from 'framer-motion'
import { Code2, Database, Hammer, Smartphone } from 'lucide-react'
import { skillGroups } from '../../data/skills'
import { fadeInUp, viewportConfig } from '../../lib/motion'
import { SectionHeader } from '../shared/SectionHeader'
import { Badge } from '../ui/badge'

const iconByCategory = {
  Mobile: Smartphone,
  Backend: Database,
  'Security Tools': Code2,
  'Core Tools': Hammer,
}

export function SkillsSection() {
  return (
    <section id="skills" className="section-shell">
      <SectionHeader
        eyebrow="Skills"
        title="Mobile, Backend, and Security Stack"
        description="CV-driven skill groups with polished motion and visual hierarchy for a high-end personal brand presentation."
      />

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
        {skillGroups.map((group, groupIndex) => (
          <motion.article
            key={group.title}
            className="glass premium-hover rounded-2xl p-5"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            transition={{ duration: 0.45, delay: groupIndex * 0.08 }}
            whileHover={{ y: -8, rotateX: 4, rotateY: -4 }}
            style={{ transformPerspective: 900 }}
          >
            <div className="mb-4 flex items-center gap-3">
              {(() => {
                const Icon = iconByCategory[group.title] ?? Code2
                return (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/32 bg-cyan-300/12 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.3)]">
                    <Icon className="h-5 w-5" />
                  </span>
                )
              })()}
              <h3 className="text-lg font-semibold text-cyan-100">{group.title}</h3>
            </div>
            <div className="space-y-3">
              {group.skills.map((skill, skillIndex) => (
                <motion.div
                  key={skill.name}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  whileHover={{ y: -2 }}
                  viewport={viewportConfig}
                  transition={{ duration: 0.25, delay: skillIndex * 0.04 }}
                >
                  <div className="mb-1.5 flex items-center justify-between text-xs text-slate-300">
                    <span>{skill.name}</span>
                    <span>{skill.level}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800/70">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 shadow-[0_0_14px_rgba(56,189,248,0.28)]"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={viewportConfig}
                      transition={{ duration: 0.6, delay: skillIndex * 0.06 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {group.skills.slice(0, 3).map((skill) => (
                <Badge key={`${group.title}-${skill.name}`} variant="muted">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
