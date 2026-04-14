"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/container";
import { TourCard } from "@/components/tours/tour-card";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";

interface ToursListViewProps {
  rows: any[];
}

export function ToursListView({ rows }: ToursListViewProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
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
              className="inline-flex items-center justify-center rounded-md bg-brand-primary px-10 py-3.5 text-xl font-bold tracking-tight text-white transition-all hover:bg-brand-primary-hover hover:shadow-md active:scale-[0.98]"
            >
              Contact us
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

      <section className="py-20 md:py-28">
        <Container>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <p className="text-sm leading-relaxed text-brand-body/70 font-medium italic">
              Availability follows operator time in <span className="font-bold text-brand-heading decoration-brand-primary/30 underline underline-offset-4 tracking-tight">Australia/Brisbane</span>.
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
