import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";

import { AvailabilityExplorer } from "./availability-explorer";
import { listPublishedTours } from "@/lib/services/tours-public";

export const metadata: Metadata = {
  title: "Availability",
  description: "Month view of live tour capacity, cutoffs, and remaining seats.",
};

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const tourId = typeof sp.tour_id === "string" ? sp.tour_id : undefined;
  const tours = await listPublishedTours({});
  const initialTourId = tourId ?? tours[0]?.id;

  return (
    <div className="bg-brand-surface pb-24">
      <PageHeader 
        label="Logistics"
        title="Live availability"
        description="Every cell reflects live capacity, weekday rules, and real-time operator overrides. All departures follow Australia/Brisbane time."
        breadcrumb={[{ label: "Availability" }]}
      />

      <Container className="mt-16 md:mt-24">
        {initialTourId ? (
          <AvailabilityExplorer tours={tours} initialTourId={initialTourId} />
        ) : (
          <div className="mx-auto max-w-lg rounded-md border border-brand-border bg-white px-8 py-14 text-center shadow-sm">
            <h2 className="font-serif text-3xl font-bold text-brand-heading">Calendar opening soon</h2>
            <p className="mt-4 text-base leading-relaxed text-brand-body/70">
              Published tours will appear here with live seats and cutoffs. In the meantime, we are happy to help by
              email.
            </p>
            <Link 
              href="/contact"
              className="mt-8 inline-flex items-center justify-center rounded-md bg-brand-primary px-10 py-3.5 text-xl font-bold tracking-tight text-white transition-all hover:bg-brand-primary-hover active:scale-[0.98]"
            >
              Contact us
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
