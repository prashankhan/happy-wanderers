"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Clock, MapPin, Users } from "lucide-react";
import { format, parseISO } from "date-fns";

import { PublicAvailabilityCalendar } from "@/components/calendar/public-availability-calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface TourOption {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  durationText: string | null;
  groupSizeText: string | null;
  priceFromText: string | null;
  locationRegion: string | null;
  heroImage: string | null;
}

interface PickupOption {
  id: string;
  name: string;
  timeLabel: string;
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(`${dateStr}T12:00:00`), "EEEE, do MMMM");
  } catch {
    return dateStr;
  }
}

export function AvailabilityExplorer({
  tours,
  initialTourId,
  initialPickups,
}: {
  tours: TourOption[];
  initialTourId: string;
  initialPickups: PickupOption[];
}) {
  const [tourId, setTourId] = useState(initialTourId);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [date, setDate] = useState<string | undefined>();
  const [pickups, setPickups] = useState<PickupOption[]>(initialPickups);
  const [departureId, setDepartureId] = useState<string | undefined>(initialPickups[0]?.id);

  const activeTour = tours.find((t) => t.id === tourId);

  async function handleTourChange(newTourId: string) {
    const tour = tours.find((t) => t.id === newTourId);
    setTourId(newTourId);
    setDate(undefined);
    setDepartureId(undefined);
    if (tour?.slug) {
      const res = await fetch(`/api/tours/${tour.slug}/pickups`);
      if (res.ok) {
        const data = await res.json();
        setPickups(data);
        setDepartureId(data[0]?.id);
      }
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-16 xl:gap-20">
      <div className="space-y-8 md:space-y-12">
        {/* Calendar Control Center */}
        <Card className="rounded-sm border-brand-border shadow-lg shadow-brand-heading/5 ring-1 ring-brand-heading/5">
          <CardHeader className="border-b border-brand-border p-0 md:p-8">
            <div className="grid gap-2 md:gap-8 sm:grid-cols-[3fr_1fr] p-2 md:p-0">
              <div>
                <p className="text-base font-bold uppercase tracking-normal text-brand-muted mb-3">
                  Select Experience
                </p>
                <select
                  className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={tourId}
                  onChange={(e) => handleTourChange(e.target.value)}
                >
                  {tours.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-base font-bold uppercase tracking-normal text-brand-muted mb-3">
                  Select Month
                </p>
                <input
                  type="month"
                  className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          {/* Tour Preview Card */}
          {activeTour && (
            <CardContent className="border-b border-brand-border bg-brand-surface-soft/30 p-0 md:p-6">
              <div className="flex gap-2 p-2 md:p-0 md:gap-6">
                {activeTour.heroImage && (
                  <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-sm bg-brand-border">
                    <Image
                      src={activeTour.heroImage}
                      alt={activeTour.title}
                      fill
                      className="object-cover brightness-90 saturate-[0.85]"
                      sizes="128px"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center min-w-0">
                  <h3 className="font-serif text-lg md:text-xl font-bold text-brand-heading line-clamp-1">
                    {activeTour.title}
                  </h3>
                  {activeTour.shortDescription && (
                    <p className="mt-1 text-sm text-brand-muted line-clamp-2 hidden md:block">
                      {activeTour.shortDescription}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {activeTour.durationText && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-muted">
                        <Clock className="h-3.5 w-3.5" />
                        {activeTour.durationText}
                      </span>
                    )}
                    {activeTour.groupSizeText && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-muted">
                        <Users className="h-3.5 w-3.5" />
                        {activeTour.groupSizeText}
                      </span>
                    )}
                    {activeTour.locationRegion && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-muted">
                        <MapPin className="h-3.5 w-3.5" />
                        {activeTour.locationRegion}
                      </span>
                    )}
                    {activeTour.priceFromText && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-muted">
                        Starting from <span className="font-bold text-brand-heading">{activeTour.priceFromText}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          )}

          <CardContent className="p-0 md:p-6 bg-white">
            <div className="border border-brand-border rounded-sm p-2 md:p-6 bg-brand-surface-soft/50">
              <PublicAvailabilityCalendar
                tourId={tourId}
                month={month}
                onMonthChange={setMonth}
                selectedDate={date}
                onSelectDate={setDate}
                variant="default"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <aside className="lg:sticky lg:top-40">
        <Card className="rounded-sm border-brand-border shadow-lg shadow-brand-heading/5 ring-1 ring-brand-heading/5">
          <CardHeader className="border-b border-brand-border p-2 md:p-8">
            <p className="text-sm font-bold text-brand-heading mb-1 md:mb-2">
              {activeTour?.title ?? "—"}
            </p>
            <p className="text-lg md:text-2xl font-bold tracking-tight text-brand-heading">
              {date ? formatDate(date) : "Select a date"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 p-2 md:p-8">
            <div>
              <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Pickup location</label>
              <select
                className="w-full rounded-sm border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                value={departureId ?? ""}
                onChange={(e) => setDepartureId(e.target.value || undefined)}
              >
                {pickups.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.timeLabel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              {date && departureId ? (
                <Button asChild variant="primary" className="w-full rounded-sm h-auto py-5 md:py-6 text-xl md:text-2xl font-bold tracking-tighter">
                  <Link href={`/booking?tour_id=${tourId}&date=${date}&departure_location_id=${departureId}`}>Confirm selection</Link>
                </Button>
              ) : (
                <Button variant="primary" className="w-full rounded-sm h-auto py-5 md:py-6 text-xl md:text-2xl font-bold tracking-tighter opacity-20 cursor-not-allowed" type="button" disabled>
                  Select a date
                </Button>
              )}
            </div>

            {activeTour && (
              <div className="pt-4 border-t border-brand-border/50">
                <Link 
                  href={`/tours/${activeTour.slug}`} 
                  className="block text-center text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
                >
                  View tour details
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
