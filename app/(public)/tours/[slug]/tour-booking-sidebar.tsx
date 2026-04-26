"use client";

import Link from "next/link";
import { useState } from "react";

import { TourNextOpenChip } from "@/components/tours/tour-next-open-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";
import { cn } from "@/lib/utils/cn";

interface PickupData {
  id: string;
  name: string;
  timeLabel: string;
}

interface TourBookingSidebarProps {
  tourId: string;
  priceFromText: string | null;
  defaultPickupId?: string;
  pickups: PickupData[];
  cancellationPolicy?: string | null;
}

export function TourBookingSidebar({
  tourId,
  priceFromText,
  defaultPickupId,
  pickups,
  cancellationPolicy,
}: TourBookingSidebarProps) {
  const [pickupId, setPickupId] = useState<string | undefined>(defaultPickupId);
  const availabilityHref = pickupId
    ? `/availability?tour_id=${tourId}&departure_location_id=${pickupId}`
    : `/availability?tour_id=${tourId}`;

  return (
    <aside className="lg:sticky lg:top-28">
      <Card className="rounded-sm border-brand-border shadow-[0_12px_24px_-20px_rgba(12,22,44,0.28)] ring-1 ring-brand-heading/5">
        <CardHeader className="border-b border-brand-border pb-4 pt-4 px-4 md:pb-5 md:pt-5 md:px-6">
          {priceFromText ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-normal text-brand-muted">Starting from</p>
              <p className="text-[2.35rem] font-black tracking-tight text-brand-heading">
                {priceFromText.replace(/^(From\s*|from\s*)/i, "")}
              </p>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-5 px-4 pt-4 pb-4 md:space-y-6 md:px-6 md:pt-6 md:pb-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Pickup location</label>
            <select
              className="w-full rounded-sm border border-brand-border/70 bg-white px-3 py-2.5 md:px-4 md:py-3 text-sm font-medium text-brand-heading transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
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

          <Button asChild variant="primary" className={cn("mt-1 w-full", primaryTourCtaClassName)}>
            <Link href={availabilityHref}>
              Check dates & book
            </Link>
          </Button>

          <div className="space-y-3 border-t border-brand-border/40 pt-4 md:space-y-4 md:pt-4">
            <p className="text-[11px] leading-relaxed text-brand-muted/65">
              Live availability and instant confirmation via our secure booking partner.
            </p>
            <TourNextOpenChip tourId={tourId} departureLocationId={pickupId} />
          </div>

          {/* Cancellation Policy Link */}
          {cancellationPolicy && (
            <div className="border-t border-brand-border/50 pt-5">
              <Link
                href="/cancellation-policy"
                className="block text-center text-sm font-medium text-brand-primary transition-colors hover:text-brand-primary-hover"
              >
                View cancellation policy
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
