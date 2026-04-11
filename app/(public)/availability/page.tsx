import type { Metadata } from "next";
import Link from "next/link";

import { AvailabilityExplorer } from "./availability-explorer";
import { Container } from "@/components/layout/container";
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
        <div className="mb-10 max-w-2xl">
          <h1 className="font-serif text-4xl font-semibold text-gray-900 md:text-5xl">Availability</h1>
          <p className="mt-3 text-gray-600">
            Data is resolved on the server using overrides, weekday rules, and live holds. Times follow{" "}
            <span className="font-medium">Australia/Brisbane</span>.
          </p>
        </div>
        {initialTourId ? (
          <AvailabilityExplorer tours={tours} initialTourId={initialTourId} />
        ) : (
          <p className="text-gray-600">
            No tours yet. <Link href="/contact" className="text-blue-900 underline">Contact us</Link>.
          </p>
        )}
      </Container>
    </section>
  );
}
