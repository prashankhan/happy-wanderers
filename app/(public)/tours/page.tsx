import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { TourCard } from "@/components/tours/tour-card";
import { listPublishedTours } from "@/lib/services/tours-public";

export const metadata: Metadata = {
  title: "Tours",
  description: "Browse premium small-group rainforest tours with curated departures and transparent availability.",
};

export default async function ToursPage() {
  const rows = await listPublishedTours({});

  if (!rows.length) {
    return (
      <section className="py-24 md:py-32">
        <Container className="mx-auto max-w-lg text-center">
          <div className="rounded-3xl border border-gray-200 bg-white px-8 py-14 shadow-sm ring-1 ring-gray-900/[0.04]">
            <h1 className="font-serif text-3xl font-semibold text-gray-900">Tours launching soon</h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              We are preparing published departures for the season. Please check back shortly or reach out — we would
              love to hear what you are planning.
            </p>
            <Button asChild variant="primary" className="mt-8">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="mb-6 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Experiences</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            Our tours
          </h1>
        </div>
        <div className="mb-16 max-w-3xl space-y-5">
          <p className="text-lg leading-relaxed text-gray-600 md:text-xl">
            Intentionally small departures, rainforest-first pacing, and logistics designed for real mornings — not
            brochure promises. Each listing shows duration, group size, region, and live pricing context before you
            open a tour.
          </p>
          <p className="text-sm leading-relaxed text-gray-500">
            Availability and cutoffs always follow operator time in <span className="font-medium text-gray-700">Australia/Brisbane</span>.
          </p>
        </div>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((t) => (
            <TourCard
              key={t.id}
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
          ))}
        </div>
      </Container>
    </section>
  );
}
