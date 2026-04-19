export const viewportConfig = {
  once: true,
  amount: 0.3,
}

export const fadeInUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: 'easeOut',
    },
  },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

export const staggerContainer = (stagger = 0.08, delayChildren = 0.06) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
})

export const hoverLift = {
  y: -6,
  transition: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  },
}
