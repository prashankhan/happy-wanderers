"use client";

import Link from "next/link";
import { Lock, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";

import { TourNextOpenChip } from "@/components/tours/tour-next-open-chip";
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

  const pickupLabel = pickups.find((p) => p.id === pickupId)?.name ?? "—";

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="mb-4 space-y-3">
        <TourNextOpenChip tourId={tourId} departureLocationId={pickupId} />
        <div className="flex flex-wrap gap-2 text-[11px] font-medium text-gray-600">
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 shadow-sm">
            <Lock className="h-3 w-3 text-blue-900" aria-hidden />
            Secure checkout
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 shadow-sm">
            <Zap className="h-3 w-3 text-amber-600" aria-hidden />
            Instant confirmation
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 shadow-sm">
            <ShieldCheck className="h-3 w-3 text-emerald-700" aria-hidden />
            Live availability
          </span>
        </div>
      </div>

      <Card className="border-gray-200/80 shadow-lg shadow-gray-900/5 ring-1 ring-gray-900/5">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="font-serif text-xl">Book {title}</CardTitle>
          {priceFromText ? <p className="text-sm font-semibold tracking-wide text-orange-600">{priceFromText}</p> : null}
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Your selection</p>
            <dl className="mt-3 space-y-2 text-gray-800">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Date</dt>
                <dd className="text-right font-medium text-gray-900">{date ?? "Choose below"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Pickup</dt>
                <dd className="text-right font-medium text-gray-900">{pickupLabel}</dd>
              </div>
            </dl>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Pickup</p>
            <select
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-900/15"
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
            variant="compact"
          />
          {date && pickupId ? (
            <Button asChild variant="primary" className="w-full">
              <Link href={href}>Continue to guest details</Link>
            </Button>
          ) : (
            <Button variant="primary" className="w-full" type="button" disabled>
              Continue to guest details
            </Button>
          )}
          <p className="text-xs leading-relaxed text-gray-500">
            You’ll confirm guest numbers on the next step. Payment is processed securely via Stripe when you continue.
          </p>
        </CardContent>
      </Card>
    </aside>
  );
}
