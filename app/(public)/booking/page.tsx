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
      <section className="py-24 md:py-32">
        <Container className="mx-auto max-w-lg text-center">
          <div className="rounded-3xl border border-gray-200 bg-white px-8 py-14 shadow-sm ring-1 ring-gray-900/[0.04]">
            <h1 className="font-serif text-3xl font-semibold text-gray-900">Tours launching soon</h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              There are no published tours to book just yet. Please check back shortly or contact us — we will help you
              plan your rainforest day.
            </p>
            <p className="mt-6">
              <Link href="/contact" className="text-sm font-medium text-blue-900 underline-offset-2 hover:underline">
                Contact us
              </Link>
            </p>
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
    <section className="py-16">
      <Container>
        <div className="mb-10 max-w-2xl">
          <p className="text-sm text-gray-500">
            <Link href="/tours" className="hover:text-blue-900">
              Tours
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Booking</span>
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-gray-900">Complete your booking</h1>
          <p className="mt-2 text-gray-600">
            We validate availability and cutoff on the server before Stripe. Your booking is only confirmed after
            successful payment webhook.
          </p>
        </div>
        <BookingFormClient
          tourId={resolved.tour.id}
          tourTitle={resolved.tour.title}
          initialDate={date}
          initialDepartureId={dep}
          pickups={pickups}
        />
      </Container>
    </section>
  );
}
