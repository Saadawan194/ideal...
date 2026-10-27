/**
 * Global Motion System – Design-locked animation tokens & curves
 * Easing: cubic-bezier(0.22, 1, 0.36, 1) [luxury quintic ease-out]
 */

export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;
export const MOTION_EASE_CSS = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const MOTION_DURATIONS = {
  micro: 0.2,       // 200ms
  button: 0.25,     // 250ms
  card: 0.35,       // 350ms
  section: 0.6,     // 600ms
  modal: 0.3,       // 300ms
} as const;

/**
 * Standard Viewport Reveal Variants (Subtle, Apple/editorial restraint)
 * Opacity: 0 -> 1
 * Y: 24px -> 0 (desktop), 16px -> 0 (mobile)
 * Scale: 0.99 -> 1
 */
export const revealVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.99,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: MOTION_DURATIONS.section,
      ease: MOTION_EASE,
    },
  },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: MOTION_EASE,
    },
  },
};

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: MOTION_EASE,
    },
  },
};
