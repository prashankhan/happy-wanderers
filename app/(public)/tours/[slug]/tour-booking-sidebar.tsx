"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicAvailabilityCalendar } from "@/components/calendar/public-availability-calendar";

export function TourBookingSidebar({
  tourId,
  title,
  priceFromText,
  defaultPickupId,
  pickups,
}: {
  tourId: string;
  title: string;
  priceFromText: string | null;
  defaultPickupId?: string;
  pickups: { id: string; name: string; timeLabel: string }[];
}) {
  const [pickupId, setPickupId] = useState<string | undefined>(defaultPickupId);
  const [date, setDate] = useState<string | undefined>();

  const href =
    date && pickupId
      ? `/booking?tour_id=${tourId}&date=${date}&departure_location_id=${pickupId}`
      : `/booking?tour_id=${tourId}`;

  return (
    <aside className="lg:sticky lg:top-24">
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Book {title}</CardTitle>
          {priceFromText ? <p className="text-sm font-medium text-orange-500">{priceFromText}</p> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Pickup</p>
            <select
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={pickupId ?? ""}
              onChange={(e) => setPickupId(e.target.value || undefined)}
            >
              {pickups.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.timeLabel}
                </option>
              ))}
            </select>
          </div>
          <PublicAvailabilityCalendar
            tourId={tourId}
            departureLocationId={pickupId}
            selectedDate={date}
            onSelectDate={setDate}
          />
          {date && pickupId ? (
            <Button asChild variant="primary" className="w-full">
              <Link href={href}>Continue</Link>
            </Button>
          ) : (
            <Button variant="primary" className="w-full" type="button" disabled>
              Continue
            </Button>
          )}
          <p className="text-xs text-gray-500">
            You’ll confirm guests and details on the next step. Payment is processed securely via Stripe.
          </p>
        </CardContent>
      </Card>
    </aside>
  );
}
