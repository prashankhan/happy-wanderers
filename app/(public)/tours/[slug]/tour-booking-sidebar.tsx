"use client";

import Link from "next/link";
import { useState } from "react";

import { TourNextOpenChip } from "@/components/tours/tour-next-open-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

  return (
    <aside className="lg:sticky lg:top-24">
      <Card className="rounded-sm border-brand-border shadow-lg shadow-brand-heading/5 ring-1 ring-brand-heading/5">
        <CardHeader className="border-b border-brand-border pb-6 pt-6 px-6">
          {priceFromText ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Starting from</p>
              <p className="text-4xl font-black tracking-tighter text-brand-heading">
                {priceFromText.replace(/^(From\s*|from\s*)/i, "")}
              </p>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-6 px-6 pt-6 pb-6">
          <div>
            <select
              className="w-full rounded-sm border border-brand-border bg-brand-surface px-4 py-3 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
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

          <Button asChild variant="primary" className="w-full rounded-sm h-auto py-5 md:py-6 text-xl md:text-2xl font-bold tracking-tighter">
            <Link href={`/availability?tour_id=${tourId}`}>
              Check dates & book
            </Link>
          </Button>

          <div className="space-y-4 border-t border-brand-border/50 pt-4">
            <p className="text-xs leading-relaxed text-brand-muted/80">
              Live availability and instant confirmation via our secure booking partner.
            </p>
            <TourNextOpenChip tourId={tourId} departureLocationId={pickupId} />
          </div>

          {/* Cancellation Policy Link */}
          {cancellationPolicy && (
            <div className="border-t border-brand-border/50 pt-4">
              <Link
                href="/cancellation-policy"
                className="text-xs text-brand-primary hover:underline"
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
