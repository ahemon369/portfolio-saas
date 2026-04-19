import { lazy, Suspense, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDownRight, BriefcaseBusiness, Code2, Radar, Trophy } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import profileImage from '../../assets/profile.jpg'

const FloatingParticles3D = lazy(() =>
  import('../interactive/FloatingParticles3D').then((module) => ({ default: module.FloatingParticles3D })),
)

const socials = [
  { icon: Code2, label: 'GitHub', href: 'https://github.com' },
  { icon: BriefcaseBusiness, label: 'LinkedIn', href: 'https://linkedin.com' },
  { icon: Trophy, label: 'LeetCode', href: 'https://leetcode.com' },
  { icon: Radar, label: 'TryHackMe', href: 'https://tryhackme.com' },
]

const titleWords = ['Md', 'Amran', 'Hossin', 'Emon']
const roleTitles = ['Android Developer', 'Flutter Developer', 'Reverse Engineer']
const enableHero3D = true

const parentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
}

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
}

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion()
  const [typedRole, setTypedRole] = useState('')
  const [roleIndex, setRoleIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [canRender3D, setCanRender3D] = useState(false)

  useEffect(() => {
    if (shouldReduceMotion) {
      setTypedRole(roleTitles.join(' | '))
      return
    }

    const currentRole = roleTitles[roleIndex]
    const isRoleComplete = typedRole === currentRole
    const isRoleEmpty = typedRole.length === 0

    const timeoutMs = isDeleting ? 45 : 80

    const timer = setTimeout(() => {
      if (!isDeleting && isRoleComplete) {
        setIsDeleting(true)
        return
      }

      if (isDeleting && isRoleEmpty) {
        setRoleIndex((prev) => (prev + 1) % roleTitles.length)
        setIsDeleting(false)
        return
      }

      const nextValue = isDeleting
        ? currentRole.slice(0, typedRole.length - 1)
        : currentRole.slice(0, typedRole.length + 1)

      setTypedRole(nextValue)
    }, isRoleComplete && !isDeleting ? 1100 : timeoutMs)

    return () => clearTimeout(timer)
  }, [isDeleting, roleIndex, shouldReduceMotion, typedRole])

  useEffect(() => {
    if (shouldReduceMotion || !enableHero3D) {
      setCanRender3D(false)
      return undefined
    }

    const mediaQuery = window.matchMedia('(min-width: 1024px)')

    const syncRenderFlag = () => {
      setCanRender3D(mediaQuery.matches)
    }

    syncRenderFlag()
    mediaQuery.addEventListener('change', syncRenderFlag)

    return () => mediaQuery.removeEventListener('change', syncRenderFlag)
  }, [shouldReduceMotion])



  return (
    <section id="home" className="section-shell neon-border hide-cursor-desktop">
      {canRender3D ? (
        <Suspense fallback={null}>
          <FloatingParticles3D />
        </Suspense>
      ) : null}

      <div className="pointer-events-none absolute right-[-3rem] top-[-5rem] h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-5rem] left-[-4rem] h-44 w-44 rounded-full bg-indigo-400/16 blur-3xl" />

      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-14">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={parentVariants}
          className="relative space-y-6"
        >
          <div className="pointer-events-none absolute -left-10 top-6 h-40 w-40 rounded-full bg-cyan-400/12 blur-3xl" />

          <motion.div variants={childVariants}>
            <Badge className="w-fit bg-cyan-300/16 text-cyan-100">
              <motion.span
                initial={shouldReduceMotion ? false : { opacity: 0.72 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: [0.72, 1, 0.72] }}
                transition={shouldReduceMotion ? { duration: 0.2 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                Open to Global Opportunities
              </motion.span>
            </Badge>
          </motion.div>

          <motion.h1 className="text-3xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl" variants={childVariants}>
            <span className="animated-gradient-text flex max-w-[15ch] flex-wrap gap-x-3 gap-y-1 break-words sm:max-w-none">
              {titleWords.map((word) => (
                <motion.span key={word} variants={childVariants}>
                  {word}
                </motion.span>
              ))}
            </span>
            <motion.span
              variants={childVariants}
              className="mt-3 block max-w-[26ch] text-xl font-semibold text-slate-300 sm:max-w-none sm:text-2xl lg:text-[1.9rem]"
            >
              {typedRole}
              {shouldReduceMotion ? null : (
                <span className="ml-0.5 inline-block h-[1.1em] w-[2px] animate-pulse bg-cyan-200/80 align-middle" />
              )}
            </motion.span>
          </motion.h1>

          <motion.p className="max-w-xl text-sm leading-relaxed text-slate-300/95 sm:text-base" variants={childVariants}>
            I engineer polished mobile products and dissect binaries with a security-first mindset. My work blends
            performance, clean architecture, and practical reverse engineering to ship robust experiences.
          </motion.p>

          <motion.div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap" variants={childVariants}>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href="#projects" aria-label="View projects section">
                View Projects <ArrowDownRight size={18} />
              </a>
            </Button>

            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <a
                href="/cv.pdf"
                download="Md-Amran-Hossin-Emon-CV.pdf"
                target="_blank"
                rel="noreferrer"
                aria-label="Download CV"
              >
                Download CV
              </a>
            </Button>

            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <a href="#contact" aria-label="Hire me">
                Hire Me
              </a>
            </Button>
          </motion.div>
        </motion.div>

        <div className="flex flex-col items-center gap-5 lg:items-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -8, 0] }}
            whileHover={{ scale: 1.04 }}
            transition={{
              opacity: { duration: 0.6, delay: 0.05 },
              scale: { duration: 0.6, delay: 0.05 },
              y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="relative mx-auto lg:mx-0"
          >
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-cyan-300/22 blur-[38px]" />
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-indigo-300/20 blur-[50px]" />

            <div className="h-52 w-52 rounded-full bg-gradient-to-br from-cyan-300 via-sky-300 to-indigo-400 p-[3px] shadow-[0_0_34px_rgba(56,189,248,0.35)] sm:h-64 sm:w-64">
              <div className="glass h-full w-full rounded-full border border-white/30 p-2">
                <img
                  src={profileImage}
                  alt="Md Amran Hossin Emon profile"
                  className="h-full w-full rounded-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="glass premium-hover w-full max-w-sm rounded-2xl border border-cyan-300/20 p-5 sm:p-6"
          >
            <h2 className="mb-4 text-lg font-semibold text-slate-100 sm:text-xl">Connect</h2>
            <div className="grid grid-cols-2 gap-3">
              {socials.map((social) => {
                const Icon = social.icon
                return (
                  <motion.a
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200 transition-all duration-300 hover:border-cyan-300/35 hover:bg-white/[0.08] hover:text-cyan-100"
                  >
                    <Icon className="h-4 w-4 transition-transform group-hover:-rotate-6" />
                    <span>{social.label}</span>
                  </motion.a>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
