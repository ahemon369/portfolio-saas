import { motion } from 'framer-motion'
import { Award, ShieldCheck } from 'lucide-react'
import { certifications } from '../../data/cvData'
import { fadeInUp, hoverLift, viewportConfig } from '../../lib/motion'
import { SectionHeader } from '../shared/SectionHeader'

export function CertificationsSection() {
  return (
    <section id="certifications" className="section-shell">
      <SectionHeader
        eyebrow="Certifications"
        title="Verified Credentials"
        description="HackerRank and TryHackMe credentials presented as premium badge cards."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {certifications.map((certificate, index) => (
          <motion.article
            key={`${certificate.issuer}-${certificate.title}`}
            className="group premium-hover relative overflow-hidden rounded-2xl border border-white/12 bg-slate-900/45 p-5"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            transition={{ duration: 0.42, delay: index * 0.05 }}
            whileHover={hoverLift}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-300/10 via-transparent to-indigo-300/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-3 flex items-center gap-2 text-cyan-100">
                {certificate.issuer === 'TryHackMe' ? <ShieldCheck size={16} /> : <Award size={16} />}
                <p className="font-code text-xs uppercase tracking-[0.18em] text-cyan-200/85">{certificate.issuer}</p>
              </div>
              <h3 className="text-base font-semibold text-white">{certificate.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{certificate.note}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
