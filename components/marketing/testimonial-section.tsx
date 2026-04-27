"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import Image from "next/image";

import { Container } from "@/components/layout/container";
import { publicRevealItem, publicRevealParent, publicRevealViewport } from "@/lib/motion/public-reveal";

interface TestimonialItem {
  id: string;
  quote: string;
  attribution: string;
  context?: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "1",
    quote: "The pacing was perfect. We never felt rushed, and our guide's knowledge of the hidden Daintree tracks made the day truly exceptional.",
    attribution: "Sarah & David",
    context: "Daintree departure",
  },
  {
    id: "2",
    quote: "Expertly handled logistics. From the Cairns pickup to the lunch margins, everything felt invisible and fluid. Highly recommend.",
    attribution: "James Thompson",
    context: "Rainforest Field Guest",
  },
  {
    id: "3",
    quote: "Silence is often the greatest luxury on a tour. Happy Wanderers protecting those quiet moments in the ancient canopy was a highlight.",
    attribution: "Elena Rossi",
    context: "World Heritage Explorer",
  },
];

const testimonialBackgroundImageSrc =
  "/images/marketing/North%20Queensland%2C%20told%20through%20the%20forest%20floor%20happy%20wanderers.jpeg";

export function TestimonialSection() {
  return (
    <section className="relative overflow-hidden border-t border-brand-border py-24 md:py-32">
      <Image
        src={testimonialBackgroundImageSrc}
        alt=""
        fill
        className="z-0 object-cover object-center"
        sizes="100vw"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-brand-surface-warm/95"
        aria-hidden
      />
      <div className="relative z-[2]">
        <Container>
          <motion.div
            variants={publicRevealItem}
            initial="hidden"
            whileInView="show"
            viewport={publicRevealViewport}
            className="mx-auto mb-12 max-w-3xl text-center md:mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Voices</p>
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-brand-heading md:text-4xl lg:text-5xl">
              What guests say
            </h2>
            <p className="mx-auto mt-6 text-lg leading-relaxed text-brand-body md:text-xl">
              Stories from recent departures — our community of explorers sharing their time in the North Queensland forest.
            </p>
          </motion.div>

          <motion.div
            variants={publicRevealParent}
            initial="hidden"
            whileInView="show"
            viewport={publicRevealViewport}
            className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {TESTIMONIALS.map((t) => (
              <motion.figure
                key={t.id}
                variants={publicRevealItem}
                className="group flex flex-col rounded-md border border-brand-border bg-white p-8 shadow-sm transition-[box-shadow,transform] duration-300 hover:shadow-md motion-safe:hover:-translate-y-px"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/5 text-brand-primary transition-transform duration-500 group-hover:scale-110">
                  <Quote className="h-5 w-5 fill-current" />
                </div>

                <blockquote className="mt-6 flex-1 text-base leading-relaxed text-brand-body md:text-lg">
                  <p className="font-sans italic">&ldquo;{t.quote}&rdquo;</p>
                </blockquote>

                <figcaption className="mt-8 border-t border-brand-border/40 pt-6">
                  <span className="block text-base font-bold tracking-tight text-brand-heading">
                    {t.attribution}
                  </span>
                  {t.context ? (
                    <span className="mt-1 block text-xs font-bold uppercase tracking-widest text-brand-muted">
                      {t.context}
                    </span>
                  ) : null}
                </figcaption>
              </motion.figure>
            ))}
          </motion.div>
        </Container>
      </div>
    </section>
  );
}
