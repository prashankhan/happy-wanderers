import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";

import { AvailabilityExplorer } from "./availability-explorer";
import { listPublishedTours, getPublishedTourById } from "@/lib/services/tours-public";

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
  const departureLocationId =
    typeof sp.departure_location_id === "string" ? sp.departure_location_id : undefined;
  const tours = await listPublishedTours({});
  const initialTourId = tourId ?? tours[0]?.id;

  const initialTour = initialTourId ? await getPublishedTourById(initialTourId) : null;
  const tourPickups = initialTour?.pickups.map((p) => ({
    id: p.id,
    name: p.name,
    timeLabel: p.pickupTimeLabel ?? p.pickupTime,
  })) ?? [];

  return (
    <div className="bg-white pb-32 lg:pb-24">
      <Container className="px-4 pt-8 sm:px-6 lg:pt-12">
        {initialTourId ? (
          <AvailabilityExplorer 
            tours={tours as any} 
            initialTourId={initialTourId}
            initialPickups={tourPickups}
            initialDepartureId={departureLocationId}
          />
        ) : (
          <RevealOnView>
          <div className="mx-auto max-w-2xl rounded-sm border border-brand-border bg-white px-10 py-20 text-center shadow-sm">
            <h2 className="font-serif text-4xl font-bold text-brand-heading">Calendar opening soon</h2>
            <p className="mt-6 text-xl leading-relaxed text-brand-body/70 font-medium">
              Live seats and field cutoffs will appear here shortly. For urgent inquiries or private bookings, please connect with our team.
            </p>
            <Button asChild variant="primary" className={cn("mt-12", primaryTourCtaClassName)}>
              <Link href="/contact">Contact our team</Link>
            </Button>
          </div>
          </RevealOnView>
        )}
      </Container>
    </div>
  );
}
