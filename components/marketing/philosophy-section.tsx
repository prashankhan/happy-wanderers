"use client";

import { motion, Variants } from "framer-motion";
import { Compass } from "lucide-react";
import { Container } from "@/components/layout/container";

export function PhilosophySection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section className="relative overflow-hidden bg-brand-surface py-24 md:py-32">
      {/* Subtle atmospheric background element */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30" aria-hidden="true">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-brand-accent/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-brand-primary/5 blur-[120px]" />
      </div>

      <Container>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2 
            variants={itemVariants}
            className="font-serif text-3xl font-bold tracking-tight text-brand-heading md:text-4xl lg:text-5xl lg:leading-[1.15]"
          >
            Guide-led, field-quiet luxury
          </motion.h2>

          <motion.div variants={itemVariants} className="mt-10 space-y-8">
            <p className="text-lg font-medium leading-[1.7] text-brand-body/95 md:text-xl lg:text-2xl">
              Luxury here is not gold trim on a coach — it is the confidence of a senior naturalist reading the day,
              adjusting pace, and protecting silence when the forest offers it. We lead small groups so conversation
              stays intimate and the trail stays respectful.
            </p>
            
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-brand-body/80 md:text-lg">
              Expect clear briefings, generous margins in the schedule, and logistics that feel invisible — the same
              standards we would want on our own family departures.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="mt-12 flex justify-center"
          >
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-brand-border to-transparent" />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
