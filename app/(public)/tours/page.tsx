import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { TourCard } from "@/components/tours/tour-card";
import { listPublishedTours } from "@/lib/services/tours-public";

export const metadata: Metadata = {
  title: "Tours",
  description: "Browse premium small-group rainforest tours with curated departures and transparent availability.",
};

export default async function ToursPage() {
  const rows = await listPublishedTours({});

  return (
    <section className="py-20">
      <Container>
        <div className="mb-12 max-w-2xl">
          <h1 className="font-serif text-4xl font-semibold text-gray-900 md:text-5xl">Our tours</h1>
          <p className="mt-4 text-lg text-gray-600">
            Intentionally small departures, rainforest-first pacing, and logistics designed for real mornings — not
            brochure promises.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((t) => (
            <TourCard
              key={t.id}
              title={t.title}
              slug={t.slug}
              shortDescription={t.shortDescription}
              durationText={t.durationText}
              groupSizeText={t.groupSizeText}
              priceFromText={t.priceFromText}
              heroImage={t.heroImage}
              isFeatured={t.isFeatured}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
