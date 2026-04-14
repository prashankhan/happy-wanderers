"use client";

import { motion, Variants } from "framer-motion";
import { Container } from "@/components/layout/container";
import { TourCard } from "@/components/tours/tour-card";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";

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
          label="Experiences"
          title="Our tours"
          description="We are preparing published departures for the season. Please check back shortly or reach out."
          breadcrumb={[{ label: "Tours" }]}
        />
        <Container className="py-24 text-center">
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center rounded-sm bg-brand-primary px-14 py-5 text-2xl font-bold tracking-tight text-white transition-all hover:bg-brand-primary-hover hover:shadow-md active:scale-[0.98]"
            >
              Contact our team
            </Link>
        </Container>
      </section>
    );
  }

  return (
    <div className="bg-brand-surface min-h-screen">
      <PageHeader 
        label="Experiences"
        title="Our tours"
        description="Intentionally small departures, rainforest-first pacing, and logistics designed for real mornings — not brochure promises."
        breadcrumb={[{ label: "Tours" }]}
      />

      <section className="py-24 md:py-32">
        <Container>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-20 border-l-2 border-brand-primary/20 pl-6"
          >
            <p className="text-base leading-relaxed text-brand-body/60 font-medium italic max-w-2xl">
              Note: Availability is confirmed in <span className="text-brand-heading font-bold">Australia/Brisbane</span> time. Our guides monitor the field conditions daily to ensure each departure meets our environmental standards.
            </p>
          </motion.div>

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
