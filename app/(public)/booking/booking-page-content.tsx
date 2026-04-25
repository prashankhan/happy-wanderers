import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { Button } from "@/components/ui/button";
import { getMinimumAdvanceWindowForDate } from "@/lib/services/availability";
import { getPricingConstraints } from "@/lib/services/pricing";
import { getSystemSettings } from "@/lib/services/system-settings";
import { getPublishedTourById, listPublishedTours } from "@/lib/services/tours-public";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";

import { BookingFormClient } from "./booking-form-client";

export async function BookingPageContent({
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
          <RevealOnView>
            <div className="rounded-sm border border-brand-border bg-white p-16 shadow-xl ring-1 ring-brand-heading/[0.04]">
              <h1 className="font-serif text-4xl font-bold text-brand-heading tracking-tight italic">
                Tours launching soon
              </h1>
              <p className="mt-6 text-xl leading-relaxed text-brand-body/70 font-medium">
                We are currently finalizing our seasonal field schedules. Please check back shortly or connect with our
                team for private arrangements.
              </p>
              <div className="mt-10">
                <Button asChild variant="primary" className={primaryTourCtaClassName}>
                  <Link href="/contact">Connect with our team</Link>
                </Button>
              </div>
            </div>
          </RevealOnView>
        </Container>
      </section>
    );
  }

  const tourId = tourIdParam ?? published[0]!.id;
  const resolved = await getPublishedTourById(tourId);
  if (!resolved) redirect("/tours");
  if (!date || !dep) {
    const params = new URLSearchParams({ tour_id: resolved.tour.id });
    if (dep) {
      params.set("departure_location_id", dep);
    }
    redirect(`/availability?${params.toString()}`);
  }

  const pickups = resolved.pickups.map((p) => ({
    id: p.id,
    name: p.name,
    timeLabel: p.pickupTimeLabel ?? p.pickupTime,
  }));

  const constraintsResult = await getPricingConstraints(resolved.tour.id, date);
  const pricingConstraints = constraintsResult.ok ? constraintsResult.constraints : null;
  const settings = await getSystemSettings();
  const minimumAdvanceWindow = getMinimumAdvanceWindowForDate({
    bookingDate: date,
    minimumAdvanceBookingDays: resolved.tour.minimumAdvanceBookingDays ?? 0,
    timezone: settings.timezone,
  });

  return (
    <div className="bg-white pb-32 lg:pb-24">
      <Container className="px-4 pt-8 sm:px-6 lg:pt-12">
        <BookingFormClient
          tourId={resolved.tour.id}
          tourTitle={resolved.tour.title}
          initialDate={date}
          initialDepartureId={dep}
          pickups={pickups}
          pricingConstraints={pricingConstraints}
          minimumAdvanceBookingDays={resolved.tour.minimumAdvanceBookingDays ?? 0}
          minimumAdvanceBookingBlocked={minimumAdvanceWindow.blocked}
        />
      </Container>
    </div>
  );
}
