"use client";

import { motion, Variants } from "framer-motion";
import { Container } from "@/components/layout/container";
import { TourCard } from "@/components/tours/tour-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";

interface ToursListViewProps {
  rows: any[];
}

export function ToursListView({ rows }: ToursListViewProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } },
  };

  if (!rows.length) {
    return (
      <section className="bg-brand-surface min-h-screen">
        <PageHeader 
          title="Our tours"
          description="We are preparing published departures for the season. Please check back shortly or reach out."
          breadcrumb={[{ label: "Tours" }]}
        />
        <Container className="py-24 text-center">
            <Button asChild variant="primary" className={primaryTourCtaClassName}>
              <Link href="/contact">Contact our team</Link>
            </Button>
        </Container>
      </section>
    );
  }

  return (
    <div className="bg-brand-surface min-h-screen">
      <PageHeader 
        title="Our tours"
        description="Intentionally small departures, rainforest-first pacing, and logistics designed for real mornings — not brochure promises."
        breadcrumb={[{ label: "Tours" }]}
      />

      <section className="py-24 md:py-32">
        <Container>
          <div className="md:mt-16" />

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3"
          >
            {rows.map((t) => (
              <motion.div key={t.id} variants={itemVariants}>
                <TourCard
                  title={t.title}
                  slug={t.slug}
                  shortDescription={t.shortDescription}
                  durationText={t.durationText}
                  groupSizeText={t.groupSizeText}
                  priceFromText={t.priceFromText}
                  locationRegion={t.locationRegion}
                  heroImage={t.heroImage}
                  isFeatured={t.isFeatured}
                />
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
