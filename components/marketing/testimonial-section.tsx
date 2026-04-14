"use client";

import { motion, Variants } from "framer-motion";
import { Quote } from "lucide-react";
import { Container } from "@/components/layout/container";

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
    context: "Private Daintree Departure",
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

export function TestimonialSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } },
  };

  return (
    <section className="border-t border-brand-border bg-brand-surface-warm py-24 md:py-32">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
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
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <motion.figure
              key={t.id}
              variants={itemVariants}
              className="group flex flex-col rounded-md border border-brand-border/60 bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:ring-1 hover:ring-brand-border/80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/5 text-brand-primary transition-transform duration-500 group-hover:scale-110">
                <Quote className="h-5 w-5 fill-current" />
              </div>

              <blockquote className="mt-6 flex-1 text-base leading-relaxed text-brand-body md:text-lg">
                <p className="font-serif italic">&ldquo;{t.quote}&rdquo;</p>
              </blockquote>

              <figcaption className="mt-8 border-t border-brand-border/40 pt-6">
                <span className="text-base font-bold tracking-tight text-brand-heading block">
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
    </section>
  );
}
