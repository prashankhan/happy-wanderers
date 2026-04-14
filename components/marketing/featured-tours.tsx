"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { TourCard, TourCardProps } from "@/components/tours/tour-card";

interface FeaturedToursProps {
  tours: (TourCardProps & { id: string })[];
}

export function FeaturedTours({ tours }: FeaturedToursProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } },
  };

  return (
    <section className="py-24 md:py-32">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary/80">Featured</p>
          <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-brand-heading md:text-4xl lg:text-5xl">
            Signature departures
          </h2>
          <p className="mx-auto mt-6 text-lg leading-relaxed text-brand-body md:text-xl">
            Each experience is paced for the forest — with duration, region, and transparent pricing context before
            you open a tour. Three curated cards below; when new tours publish, they appear here automatically.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"
        >
          {tours.map((t) => (
            <motion.div key={t.id} variants={itemVariants} className="h-full">
              <TourCard {...t} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Link
            href="/tours"
            className="group inline-flex items-center justify-center rounded-md bg-black/5 px-4 py-3.5 text-xl font-bold tracking-tight text-brand-primary transition-all hover:bg-black/10"
          >
            Browse all scheduled tours
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
