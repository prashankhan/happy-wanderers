import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { getPublishedTourById, listPublishedTours } from "@/lib/services/tours-public";

import { BookingFormClient } from "./booking-form-client";

export const metadata: Metadata = {
  title: "Book",
  description: "Complete your rainforest tour booking with live availability and secure Stripe checkout.",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const tourIdParam = typeof sp.tour_id === "string" ? sp.tour_id : undefined;
  const date = typeof sp.date === "string" ? sp.date : undefined;
  const dep = typeof sp.departure_location_id === "string" ? sp.departure_location_id : undefined;

  const published = await listPublishedTours({});
  if (!published.length) {
    return (
      <section className="py-24 md:py-32 bg-brand-surface min-h-screen">
        <Container className="mx-auto max-w-2xl text-center">
          <div className="rounded-sm border border-brand-border bg-white p-16 shadow-xl ring-1 ring-brand-heading/[0.04]">
            <h1 className="font-serif text-4xl font-bold text-brand-heading tracking-tight italic">Tours launching soon</h1>
            <p className="mt-6 text-xl leading-relaxed text-brand-body/70 font-medium">
              We are currently finalizing our seasonal field schedules. Please check back shortly or connect with our team for private arrangements.
            </p>
            <div className="mt-10">
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center rounded-sm bg-brand-primary px-14 py-5 text-2xl font-bold tracking-tight text-white transition-all hover:bg-brand-primary-hover active:scale-[0.98]"
              >
                Connect with our team
              </Link>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const tourId = tourIdParam ?? published[0]!.id;
  const resolved = await getPublishedTourById(tourId);
  if (!resolved) redirect("/tours");

  const pickups = resolved.pickups.map((p) => ({
    id: p.id,
    name: p.name,
    timeLabel: p.pickupTimeLabel ?? p.pickupTime,
  }));

  return (
    <div className="bg-white pb-32 lg:pb-24">
      <Container className="px-4 pt-8 sm:px-6 lg:pt-12">
        <BookingFormClient
          tourId={resolved.tour.id}
          tourTitle={resolved.tour.title}
          initialDate={date}
          initialDepartureId={dep}
          pickups={pickups}
        />
      </Container>
    </div>
  );
}
