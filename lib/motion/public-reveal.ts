import type { Variants } from "framer-motion";

/** Calm editorial ease — shared across public marketing surfaces. */
export const publicRevealEase = [0.22, 1, 0.36, 1] as const;

/** Default scroll reveal: once, slightly before fully in view. */
export const publicRevealViewport = {
  once: true,
  amount: 0.14,
  margin: "0px 0px -48px 0px",
} as const;

/** Parent: opacity + staggered children (no offset on wrapper). */
export const publicRevealParent: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/** Tighter stagger for compact rows (credibility bar, etc.). */
export const publicRevealParentTight: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

/** Child / single block: fade in while moving up from below. */
export const publicRevealItem: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: publicRevealEase },
  },
};

/** Slightly softer offset (e.g. page hero under nav). */
export const publicRevealItemSoft: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: publicRevealEase },
  },
};
