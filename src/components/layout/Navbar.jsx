import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '../../lib/utils'

const labels = {
  home: 'Home',
  about: 'About',
  achievements: 'Achievements',
  certifications: 'Certifications',
  skills: 'Skills',
  projects: 'Projects',
  experience: 'Experience',
  contact: 'Contact',
}

export function Navbar({ sections }) {
  const [active, setActive] = useState('home')
  const [isOpen, setIsOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isShrunk, setIsShrunk] = useState(false)

  useEffect(() => {
    const nodes = sections
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-40% 0px -45% 0px',
        threshold: 0.1,
      },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [sections])

  const menu = useMemo(
    () => sections.map((id) => ({ id, label: labels[id] ?? id })),
    [sections],
  )

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    let lastScrollY = window.scrollY

    const onScroll = () => {
      const currentY = window.scrollY
      const scrollingDown = currentY > lastScrollY

      setIsShrunk(currentY > 24)

      if (currentY < 20) {
        setIsHidden(false)
      } else if (scrollingDown && currentY > 110) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }

      lastScrollY = currentY
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      className="sticky top-0 z-50 w-full px-4 pt-3 sm:px-6 lg:px-8"
      animate={{ y: isHidden ? -90 : 0, opacity: isHidden ? 0.92 : 1 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <motion.nav
        className={cn(
          'mx-auto w-full max-w-6xl rounded-2xl border border-cyan-300/16 bg-slate-950/55 px-3 backdrop-blur-2xl transition-all duration-300 sm:px-4',
          isShrunk ? 'py-2 shadow-[0_8px_24px_rgba(8,18,40,0.34)]' : 'py-2.5 shadow-[0_14px_30px_rgba(8,18,40,0.28)]',
        )}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between gap-3">
          <a href="#home" className="font-code text-[0.67rem] uppercase tracking-[0.3em] text-cyan-200 sm:text-xs">
            MAHE
          </a>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-slate-200 transition-colors hover:border-cyan-300/35 hover:text-cyan-100 md:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <ul className="mt-2 hidden items-center justify-end gap-1 overflow-x-auto pb-1 text-xs sm:gap-2 sm:text-[0.82rem] md:mt-0 md:flex">
          {menu.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'relative inline-flex rounded-lg px-2.5 py-1.5 text-slate-300 transition-all duration-300 hover:scale-[1.02] hover:text-slate-50 sm:px-3 sm:py-2',
                  active === item.id ? 'text-white' : null,
                )}
              >
                {active === item.id ? (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 -z-10 rounded-lg border border-cyan-300/25 bg-cyan-300/12 shadow-[0_0_18px_rgba(34,211,238,0.18)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                ) : null}
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <motion.div
          initial={false}
          animate={
            isOpen
              ? { opacity: 1, y: 0, height: 'auto' }
              : { opacity: 0, y: -10, height: 0 }
          }
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="mt-2 overflow-hidden md:hidden"
        >
          <ul className="grid gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-2">
            {menu.map((item) => (
              <li key={`mobile-${item.id}`} className="list-none">
                <a
                  href={`#${item.id}`}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'inline-flex w-full rounded-lg px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-white/[0.08] hover:text-cyan-100',
                    active === item.id ? 'border border-cyan-300/25 bg-cyan-300/12 text-white' : null,
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.nav>
    </motion.header>
  )
}
