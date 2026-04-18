"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * One-shot mount fade for admin dashboard surfaces (not scroll-triggered).
 * Respects `prefers-reduced-motion`.
 */
export function AdminPageReveal({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
