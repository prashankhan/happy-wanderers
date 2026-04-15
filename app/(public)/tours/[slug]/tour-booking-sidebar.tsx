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
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-brand-border bg-brand-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-muted shadow-sm">
            <Lock className="h-3 w-3 text-brand-accent" aria-hidden />
            Secure checkout
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-brand-border bg-brand-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-muted shadow-sm">
            <Zap className="h-3 w-3 text-brand-gold" aria-hidden />
            Instant confirmation
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-brand-border bg-brand-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-muted shadow-sm">
            <ShieldCheck className="h-3 w-3 text-availability-open" aria-hidden />
            Live availability
          </span>
        </div>
      </div>

      <Card className="rounded-sm border-brand-border shadow-lg shadow-brand-heading/5 ring-1 ring-brand-heading/5">
        <CardHeader className="border-b border-brand-border pb-6 pt-6 px-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-2">Signature Experience</p>
          <CardTitle className="font-serif text-2xl font-bold italic tracking-tighter leading-tight">{title}</CardTitle>
          {priceFromText ? (
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Starting from</p>
              <p className="mt-1 text-3xl font-black tracking-tighter text-brand-heading">{priceFromText}</p>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-6 px-6 pt-6 pb-6">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Preferred pickup</p>
              <select
                className="mt-3 w-full rounded-sm border border-brand-border bg-brand-surface px-4 py-3 text-sm font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
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
          </div>

          <Button asChild variant="primary" className="h-14 w-full text-lg font-bold tracking-tight">
            <Link href={`/availability?tour_id=${tourId}`}>
              Check Dates & Book
            </Link>
          </Button>

          <div className="space-y-3">
            <p className="text-xs leading-relaxed text-brand-muted/80">
              Live availability and instant confirmation via our secure booking partner. 
            </p>
            <div className="flex items-center gap-2 pt-1 border-t border-brand-border/50">
               <span className="h-1.5 w-1.5 rounded-full bg-availability-open" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Now booking for 2026/27</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
