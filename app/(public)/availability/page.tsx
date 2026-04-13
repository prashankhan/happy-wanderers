import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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
    <section className="py-16">
      <Container>
        <div className="mb-14 max-w-3xl">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            Availability
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Every cell reflects live capacity, weekday rules, one-off overrides, and booking holds. All departures are
            shown in the operator timezone — <span className="font-medium text-gray-800">Australia/Brisbane</span>.
          </p>
        </div>
        {initialTourId ? (
          <AvailabilityExplorer tours={tours} initialTourId={initialTourId} />
        ) : (
          <div className="mx-auto max-w-lg rounded-3xl border border-gray-200 bg-white px-8 py-14 text-center shadow-sm ring-1 ring-gray-900/[0.04]">
            <h2 className="font-serif text-2xl font-semibold text-gray-900">Calendar opening soon</h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              Published tours will appear here with live seats and cutoffs. In the meantime, we are happy to help by
              email.
            </p>
            <Button asChild variant="primary" className="mt-8">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
