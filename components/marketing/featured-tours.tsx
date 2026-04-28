"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { TourCard, TourCardProps } from "@/components/tours/tour-card";
import { publicRevealItem, publicRevealParent, publicRevealViewport } from "@/lib/motion/public-reveal";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";

interface FeaturedToursProps {
  tours: (TourCardProps & { id: string })[];
}

export function FeaturedTours({ tours }: FeaturedToursProps) {
  return (
    <section className="border-t border-brand-border py-24 md:py-32">
      <Container>
        <motion.div
          variants={publicRevealItem}
          initial="hidden"
          whileInView="show"
          viewport={publicRevealViewport}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary/80">Featured</p>
          <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-brand-heading md:text-4xl lg:text-5xl">
            Signature departures
          </h2>
          <p className="mx-auto mt-6 text-lg leading-relaxed text-brand-body md:text-xl">
            A featured selection of our most popular private tours, designed for a relaxed, personal way to
            experience Far North Queensland. Each listing includes clear details on region, duration and pricing. When
            new tours publish, they appear here automatically.
          </p>
        </motion.div>

        <motion.div
          variants={publicRevealParent}
          initial="hidden"
          whileInView="show"
          viewport={publicRevealViewport}
          className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"
        >
          {tours.map((t) => (
            <motion.div key={t.id} variants={publicRevealItem} className="h-full">
              <TourCard {...t} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={publicRevealItem}
          initial="hidden"
          whileInView="show"
          viewport={publicRevealViewport}
          className="mt-16 text-center"
        >
          <Button asChild variant="primary" className={primaryTourCtaClassName}>
            <Link href="/tours">Browse all scheduled tours</Link>
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
