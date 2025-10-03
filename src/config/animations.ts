import { Variants } from 'framer-motion';

/**
 * Animation variants library for consistent motion design
 * Based on Phase 2.5 specifications
 */

// Default transition configurations
export const transitions = {
  fast: { duration: 0.15, ease: 'easeOut' },
  normal: { duration: 0.2, ease: 'easeInOut' },
  slow: { duration: 0.3, ease: 'easeInOut' },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springGentle: { type: 'spring', stiffness: 200, damping: 25 },
} as const;

// Fade animations
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: transitions.normal,
  },
  exit: { 
    opacity: 0,
    transition: transitions.fast,
  },
};

// Slide animations
export const slideUpVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: transitions.fast,
  },
};

export const slideDownVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: transitions.fast,
  },
};

export const slideLeftVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: 20,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: transitions.fast,
  },
};

export const slideRightVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: transitions.fast,
  },
};

// Scale animations
export const scaleVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: transitions.fast,
  },
};

export const popVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: transitions.fast,
  },
};

// Rotation animations
export const rotateVariants: Variants = {
  hidden: { 
    opacity: 0, 
    rotate: -10,
  },
  visible: { 
    opacity: 1, 
    rotate: 0,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    rotate: 10,
    transition: transitions.fast,
  },
};

// Stagger container variants
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.normal,
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: transitions.fast,
  },
};

// List animations with faster stagger
export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -10,
  },
  visible: { 
    opacity: 1, 
    x: 0,
  },
};

// Page transition variants
export const pageVariants: Variants = {
  initial: { 
    opacity: 0, 
    x: -20,
  },
  enter: { 
    opacity: 1, 
    x: 0,
    transition: transitions.normal,
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: transitions.fast,
  },
};

// Modal/Drawer variants
export const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
    transition: transitions.fast,
  },
};

export const drawerVariants: Variants = {
  hidden: { 
    x: '100%',
  },
  visible: { 
    x: 0,
    transition: transitions.spring,
  },
  exit: { 
    x: '100%',
    transition: transitions.normal,
  },
};

export const drawerLeftVariants: Variants = {
  hidden: { 
    x: '-100%',
  },
  visible: { 
    x: 0,
    transition: transitions.spring,
  },
  exit: { 
    x: '-100%',
    transition: transitions.normal,
  },
};

// Collapse/Expand variants
export const collapseVariants: Variants = {
  collapsed: { 
    height: 0, 
    opacity: 0,
    transition: transitions.fast,
  },
  expanded: { 
    height: 'auto', 
    opacity: 1,
    transition: transitions.normal,
  },
};

// Hover and tap animations
export const hoverScale = {
  scale: 1.02,
  transition: transitions.fast,
};

export const tapScale = {
  scale: 0.98,
};

export const hoverLift = {
  y: -2,
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  transition: transitions.fast,
};

// Loading spinner variants
export const spinnerVariants: Variants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Pulse animation
export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Notification toast variants
export const toastVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -50,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    y: -50,
    scale: 0.95,
    transition: transitions.normal,
  },
};

// Skeleton loading variants
export const skeletonVariants: Variants = {
  loading: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Card flip variants
export const flipVariants: Variants = {
  front: {
    rotateY: 0,
    transition: transitions.normal,
  },
  back: {
    rotateY: 180,
    transition: transitions.normal,
  },
};

// Slide in from edge variants
export const slideInFromBottom: Variants = {
  hidden: { 
    y: '100%',
    opacity: 0,
  },
  visible: { 
    y: 0,
    opacity: 1,
    transition: transitions.spring,
  },
};

export const slideInFromTop: Variants = {
  hidden: { 
    y: '-100%',
    opacity: 0,
  },
  visible: { 
    y: 0,
    opacity: 1,
    transition: transitions.spring,
  },
};

// Typewriter/reveal text animation
export const textRevealVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 20,
  },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      ...transitions.normal,
    },
  }),
};

// Utility: Respect prefers-reduced-motion
export const withReducedMotion = (variants: Variants): Variants => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 0, transition: { duration: 0 } },
    };
  }
  return variants;
};

// Export all as a collection
export const animations = {
  fade: fadeVariants,
  slideUp: slideUpVariants,
  slideDown: slideDownVariants,
  slideLeft: slideLeftVariants,
  slideRight: slideRightVariants,
  scale: scaleVariants,
  pop: popVariants,
  rotate: rotateVariants,
  staggerContainer: staggerContainerVariants,
  staggerItem: staggerItemVariants,
  listContainer: listContainerVariants,
  listItem: listItemVariants,
  page: pageVariants,
  modal: modalVariants,
  drawer: drawerVariants,
  drawerLeft: drawerLeftVariants,
  collapse: collapseVariants,
  toast: toastVariants,
  skeleton: skeletonVariants,
  flip: flipVariants,
  slideInFromBottom,
  slideInFromTop,
  textReveal: textRevealVariants,
  spinner: spinnerVariants,
  pulse: pulseVariants,
};

export default animations;
