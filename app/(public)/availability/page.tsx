import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";

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
    <div className="bg-white pb-32 lg:pb-24">
      <Container className="px-4 pt-8 sm:px-6 lg:pt-12">
        {initialTourId ? (
          <AvailabilityExplorer 
            tours={tours as any} 
            initialTourId={initialTourId} 
          />
        ) : (
          <div className="mx-auto max-w-2xl rounded-sm border border-brand-border bg-white px-10 py-20 text-center shadow-sm">
            <h2 className="font-serif text-4xl font-bold text-brand-heading">Calendar opening soon</h2>
            <p className="mt-6 text-xl leading-relaxed text-brand-body/70 font-medium">
              Live seats and field cutoffs will appear here shortly. For urgent inquiries or private bookings, please connect with our team.
            </p>
            <Link 
              href="/contact"
              className="mt-12 inline-flex items-center justify-center rounded-sm bg-brand-primary px-14 py-5 text-2xl font-bold tracking-tight text-white transition-all hover:bg-brand-primary-hover active:scale-[0.98]"
            >
              Contact our team
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
