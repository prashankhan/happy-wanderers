"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { TourCard } from "@/components/tours/tour-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { publicRevealItem, publicRevealParent } from "@/lib/motion/public-reveal";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";

interface ToursListViewProps {
  rows: any[];
}

export function ToursListView({ rows }: ToursListViewProps) {
  if (!rows.length) {
    return (
      <section className="bg-brand-surface min-h-screen">
        <PageHeader 
          title="Our tours"
          description="We are preparing published departures for the season. Please check back shortly or reach out."
          breadcrumb={[{ label: "Tours" }]}
        />
        <Container className="py-24 text-center">
          <RevealOnView className="inline-block">
            <Button asChild variant="primary" className={primaryTourCtaClassName}>
              <Link href="/contact">Contact our team</Link>
            </Button>
          </RevealOnView>
        </Container>
      </section>
    );
  }

  return (
    <div className="bg-brand-surface min-h-screen">
      <PageHeader 
        title="Our tours"
        description="Thoughtfully paced private experiences designed around real days – not rushed schedules. From rainforest escapes to coastal highlights, each journey is shaped with local insight, personal service and the flexibility to enjoy Far North Queensland at its best."
        breadcrumb={[{ label: "Tours" }]}
      />

      <section className="py-24 md:py-32">
        <Container>
          <div className="md:mt-16" />

          <motion.div
            variants={publicRevealParent}
            initial="hidden"
            animate="show"
            className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3"
          >
            {rows.map((t) => (
              <motion.div key={t.id} variants={publicRevealItem}>
                <TourCard
                  title={t.title}
                  slug={t.slug}
                  shortDescription={t.shortDescription}
                  durationText={t.durationText}
                  groupSizeText={t.groupSizeText}
                  priceFromText={t.priceFromText}
                  priceContextText={t.priceContextText}
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
