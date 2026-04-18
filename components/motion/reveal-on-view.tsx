"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

import { publicRevealItem, publicRevealViewport } from "@/lib/motion/public-reveal";
import { cn } from "@/lib/utils/cn";

export interface RevealOnViewProps extends Omit<HTMLMotionProps<"div">, "children" | "initial" | "whileInView"> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Scroll-triggered reveal: opacity + upward motion (shared public-site pattern).
 * Safe to wrap server-rendered page content from a server `page.tsx`.
 * Respects `prefers-reduced-motion` (no animation).
 */
export function RevealOnView({ children, className, ...rest }: RevealOnViewProps) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return <div className={cn(className)}>{children}</div>;

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      viewport={publicRevealViewport}
      variants={publicRevealItem}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
