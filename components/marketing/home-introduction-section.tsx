"use client";

import { motion } from "framer-motion";

import { Container } from "@/components/layout/container";
import { publicRevealItem, publicRevealParent, publicRevealViewport } from "@/lib/motion/public-reveal";

/** Client homepage introduction — layout and atmosphere aligned with `PhilosophySection`. */
export function HomeIntroductionSection() {
  return (
    <section className="relative overflow-hidden bg-brand-surface py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30" aria-hidden>
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-brand-accent/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-brand-primary/5 blur-[120px]" />
      </div>

      <Container>
        <motion.div
          variants={publicRevealParent}
          initial="hidden"
          whileInView="show"
          viewport={publicRevealViewport}
          className="relative mx-auto max-w-3xl text-center"
        >
          <motion.h2
            variants={publicRevealItem}
            className="font-serif text-3xl font-bold tracking-tight text-brand-heading md:text-4xl lg:text-5xl lg:leading-[1.15]"
          >
            Beyond the familiar
          </motion.h2>

          <motion.div variants={publicRevealItem} className="mt-10 space-y-8">
            <p className="text-lg font-medium leading-[1.7] text-brand-body/95 md:text-xl lg:text-2xl">
              We created Happy Wanderers for travellers who value connection, comfort, and genuine experience over crowded
              schedules and predictable sightseeing.
            </p>

            <p className="mx-auto max-w-2xl text-base leading-relaxed text-brand-body/80 md:text-lg">
              Our journeys are designed to move beyond the familiar — guiding you past the expected and into places,
              moments, and perspectives many visitors never encounter. With a focus on attentiveness, professionalism, and
              thoughtful detail, each experience is shaped to feel personal, seamless, and deeply rewarding.
            </p>

            <p className="mx-auto max-w-2xl text-base leading-relaxed text-brand-body/80 md:text-lg">
              Whether discovering iconic landscapes or uncovering lesser-known corners, you&apos;re invited to explore with
              confidence, curiosity, and a sense of belonging.
            </p>
          </motion.div>

          <motion.div variants={publicRevealItem} className="mt-12 flex justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-brand-border to-transparent" />
          </motion.div>

          <motion.p
            variants={publicRevealItem}
            className="mx-auto mt-10 max-w-2xl font-serif text-xl font-normal italic leading-snug tracking-tight text-brand-heading md:text-2xl md:leading-snug"
          >
            Because travel should never feel routine — it should feel like something you&apos;re truly part of.
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
