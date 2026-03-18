import type { Variants } from 'framer-motion'

// Shared premium easing curve — natural deceleration
const EASE_OUT = [0.22, 1, 0.36, 1] as const
const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const

// ── Basic directional fades ────────────────────────────────────
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 32, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: EASE_OUT },
  },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -24, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: EASE_OUT },
  },
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: EASE_OUT },
  },
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: EASE_OUT },
  },
}

// ── Scale reveal — for cards and widget ───────────────────────
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.90, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
}

// ── Clip-path curtain reveal — for big headlines ──────────────
export const revealUp: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    opacity: 1,
    transition: { duration: 0.75, ease: EASE_IN_OUT },
  },
}

// ── Soft float-in — for floating cards / badges ───────────────
export const floatIn: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
}

// ── Count-up parent (stagger for stat panels) ─────────────────
export const statCard: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
}

// ── Progress bar fill ─────────────────────────────────────────
export const barFill = (pct: number, delay = 0) => ({
  hidden: { width: '0%', opacity: 0 },
  visible: {
    width: `${pct}%`,
    opacity: 1,
    transition: { duration: 1.2, delay, ease: EASE_OUT },
  },
})

// ── Stagger containers ────────────────────────────────────────
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.13,
      delayChildren: 0.05,
    },
  },
}

/**
 * Used INSIDE sections wrapped by SectionReveal.
 * The 0.30s delay lets the outer section entrance finish
 * before children begin staggering — creates the layered
 * scrollytelling feel.
 */
export const sectionStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.3,
    },
  },
}

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.02,
    },
  },
}

export const staggerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
}

