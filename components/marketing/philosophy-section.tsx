"use client";

import { motion } from "framer-motion";

import { Container } from "@/components/layout/container";
import { publicRevealItem, publicRevealParent, publicRevealViewport } from "@/lib/motion/public-reveal";

export function PhilosophySection() {
  return (
    <section className="relative overflow-hidden bg-brand-surface py-24 md:py-32">
      {/* Subtle atmospheric background element */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30" aria-hidden="true">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-brand-accent/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-brand-primary/5 blur-[120px]" />
      </div>

      <Container>
        <motion.div
          variants={publicRevealParent}
          initial="hidden"
          whileInView="show"
          viewport={publicRevealViewport}
          className="mx-auto max-w-5xl text-center"
        >
          <motion.h2
            variants={publicRevealItem}
            className="font-serif text-3xl font-bold tracking-tight text-brand-heading md:text-4xl lg:text-5xl lg:leading-[1.15]"
          >
            Guide-led, quiet luxury
          </motion.h2>

          <motion.div variants={publicRevealItem} className="mt-10 space-y-8">
            <p className="mx-auto max-w-3xl text-lg font-medium leading-[1.7] text-brand-body/95 md:text-xl lg:text-2xl">
              Luxury here is not gold trim on a coach — it is the confidence of a senior guide reading the day,
              adjusting pace, and protecting silence when the forest offers it. We lead small groups so conversation
              stays intimate and the trail stays respectful.
            </p>

            <p className="mx-auto max-w-2xl text-base leading-relaxed text-brand-body/80 md:text-lg">
              Expect clear briefings, generous margins in the schedule, and logistics that feel invisible — the same
              standards we would want on our own family departures.
            </p>
          </motion.div>

          <motion.div variants={publicRevealItem} className="mt-12 flex justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-brand-border to-transparent" />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
