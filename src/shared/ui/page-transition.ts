export const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
} as const

export const fadeTransition = {
  duration: 0.35,
  ease: 'easeOut',
} as const
