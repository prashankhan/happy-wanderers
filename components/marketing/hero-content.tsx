"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

/** Hero primary CTA: solid brand gold (aligned with nav Book CTA). */
const heroCtaGoldFillClassName =
  "h-14 w-full rounded-sm border-0 bg-brand-gold px-5 font-sans text-lg font-semibold uppercase tracking-widest text-brand-heading shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:bg-[#e5a30a] hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 motion-safe:active:scale-[0.98] sm:w-auto lg:h-16 lg:px-9";

/** Hero secondary CTA: solid white on dark hero. */
const heroCtaWhiteFillClassName =
  "h-14 w-full rounded-sm border-0 bg-white px-5 font-sans text-lg font-semibold uppercase tracking-widest text-brand-heading shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:bg-white/90 hover:shadow-md focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 motion-safe:active:scale-[0.98] sm:w-auto lg:h-16 lg:px-9";

/** Hero: three inline trust signals beneath primary CTAs (brand positioning). */
const heroTrustPointers = ["Designed around you", "Guided with care", "Beyond the expected"] as const;

// Framer motion variants for an elegant entrance
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 60,
      damping: 20,
      duration: 0.8,
    },
  },
};

export function HeroContent() {
  return (
    <motion.div
      className="mx-auto max-w-5xl text-center"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.p
        variants={itemVariants}
        className="text-sm font-light uppercase tracking-[0.2em] text-blue-200/90 md:text-base"
      >
        Thoughtfully guided private journeys from Cairns
      </motion.p>
      
      <motion.h1
        variants={itemVariants}
        className="mx-auto mt-3 max-w-5xl font-serif text-4xl font-normal tracking-tight leading-[1.08] text-white md:mt-10 md:text-5xl md:leading-[1.06] lg:text-6xl xl:text-7xl"
      >
        Travel Tropical North Queensland in a way that feels personal
      </motion.h1>
      
      <motion.p
        variants={itemVariants}
        className="mx-auto mt-8 max-w-3xl text-base font-light leading-relaxed text-blue-100/95 md:mt-10 md:text-xl md:leading-relaxed"
      >
        Move beyond predictable sightseeing into experiences shaped around comfort, attentiveness, and genuine
        connection with the places you explore — guided with insight, professionalism, and thoughtful detail at
        every step.
      </motion.p>
      
      <motion.div
        variants={itemVariants}
        className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 md:mt-10"
      >
        <Button asChild variant="secondary" size="lg" className={heroCtaGoldFillClassName}>
          <Link href="/tours">View Tours</Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className={heroCtaWhiteFillClassName}>
          <Link href="/availability">Check Availability</Link>
        </Button>
      </motion.div>
      
      <motion.ul
        variants={itemVariants}
        className="mt-6 flex list-none flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm md:mt-8 md:gap-x-8 md:text-base"
        aria-label="How we travel with you"
      >
        {heroTrustPointers.map((label) => (
          <li key={label} className="inline-flex items-center gap-2">
            <BadgeCheck
              className="h-4 w-4 shrink-0 text-brand-gold/45 md:h-5 md:w-5"
              aria-hidden
            />
            <span className="font-medium uppercase tracking-wide text-blue-100/45">
              {label}
            </span>
          </li>
        ))}
      </motion.ul>
    </motion.div>
  );
}
