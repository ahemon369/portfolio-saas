import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { CustomCursor } from '../components/layout/CustomCursor'
import { Navbar } from '../components/layout/Navbar'
import { ScrollProgress } from '../components/layout/ScrollProgress'
import { AboutSection } from '../components/sections/AboutSection'
import { AchievementsSection } from '../components/sections/AchievementsSection'
import { CertificationsSection } from '../components/sections/CertificationsSection'
import { ContactSection } from '../components/sections/ContactSection'
import { ExperienceSection } from '../components/sections/ExperienceSection'
import { Footer } from '../components/sections/Footer'
import { HeroSection } from '../components/sections/HeroSection'
import { ProjectsSection } from '../components/sections/ProjectsSection'
import { SkillsSection } from '../components/sections/SkillsSection'

const sectionIds = ['home', 'about', 'achievements', 'certifications', 'skills', 'projects', 'experience', 'contact']

export function PortfolioPage() {
  const shouldReduceMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const blobY1 = useSpring(useTransform(scrollY, [0, 1200], [0, -36]), { stiffness: 80, damping: 22 })
  const blobY2 = useSpring(useTransform(scrollY, [0, 1200], [0, 28]), { stiffness: 80, damping: 22 })
  const blobY3 = useSpring(useTransform(scrollY, [0, 1200], [0, -24]), { stiffness: 80, damping: 22 })
  const blobY4 = useSpring(useTransform(scrollY, [0, 1200], [0, 18]), { stiffness: 80, damping: 22 })

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="relative min-h-screen overflow-hidden bg-neon-mesh"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="noise-overlay" aria-hidden="true" />
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[-10rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-400/16 blur-[120px]"
          style={{ y: shouldReduceMotion ? 0 : blobY1 }}
          animate={
            shouldReduceMotion ? { opacity: 0.6 } : { scale: [1, 1.08, 1], opacity: [0.55, 0.7, 0.55] }
          }
          transition={
            shouldReduceMotion ? { duration: 0.3 } : { duration: 12, repeat: Infinity, ease: 'easeInOut' }
          }
        />
        <motion.div
          className="pointer-events-none absolute bottom-[-10rem] right-[-8rem] h-[26rem] w-[26rem] rounded-full bg-indigo-400/16 blur-[140px]"
          style={{ y: shouldReduceMotion ? 0 : blobY2 }}
          animate={
            shouldReduceMotion ? { opacity: 0.6 } : { scale: [1.02, 0.95, 1.02], opacity: [0.5, 0.7, 0.5] }
          }
          transition={
            shouldReduceMotion ? { duration: 0.3 } : { duration: 11, repeat: Infinity, ease: 'easeInOut' }
          }
        />
        <motion.div
          className="pointer-events-none absolute left-[-7rem] top-[28%] h-[18rem] w-[18rem] rounded-full bg-sky-400/10 blur-[120px]"
          style={{ y: shouldReduceMotion ? 0 : blobY3 }}
          animate={
            shouldReduceMotion
              ? { opacity: 0.45 }
              : { x: [0, 18, 0], y: [0, -10, 0], opacity: [0.4, 0.62, 0.4] }
          }
          transition={
            shouldReduceMotion ? { duration: 0.3 } : { duration: 14, repeat: Infinity, ease: 'easeInOut' }
          }
        />
        <motion.div
          className="pointer-events-none absolute right-[-7rem] top-[58%] h-[20rem] w-[20rem] rounded-full bg-violet-400/10 blur-[130px]"
          style={{ y: shouldReduceMotion ? 0 : blobY4 }}
          animate={
            shouldReduceMotion
              ? { opacity: 0.45 }
              : { x: [0, -15, 0], y: [0, 10, 0], opacity: [0.4, 0.62, 0.4] }
          }
          transition={
            shouldReduceMotion ? { duration: 0.3 } : { duration: 13, repeat: Infinity, ease: 'easeInOut' }
          }
        />

        <CustomCursor />
        <ScrollProgress />
        <Navbar sections={sectionIds} />

        <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 pb-16 pt-10 sm:gap-9 sm:px-6 sm:pt-12 lg:gap-10 lg:px-8 lg:pt-14">
          <HeroSection />
          <div className="section-separator" aria-hidden="true" />
          <AboutSection />
          <div className="section-separator" aria-hidden="true" />
          <AchievementsSection />
          <div className="section-separator" aria-hidden="true" />
          <CertificationsSection />
          <div className="section-separator" aria-hidden="true" />
          <SkillsSection />
          <div className="section-separator" aria-hidden="true" />
          <ProjectsSection />
          <div className="section-separator" aria-hidden="true" />
          <ExperienceSection />
          <div className="section-separator" aria-hidden="true" />
          <ContactSection />
        </main>

        <Footer />
      </motion.div>
    </AnimatePresence>
  )
}
