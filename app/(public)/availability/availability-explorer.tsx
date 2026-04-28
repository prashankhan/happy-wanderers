"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Clock, MapPin, Users } from "lucide-react";
import { addMonths, format, parseISO, startOfMonth } from "date-fns";

import { PublicAvailabilityCalendar } from "@/components/calendar/public-availability-calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";
import { cn } from "@/lib/utils/cn";

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
  isMultiDay: boolean;
}

interface PickupOption {
  id: string;
  name: string;
  timeLabel: string;
}

interface AvailabilityDayPayload {
  date: string;
  available: boolean;
  remaining_capacity: number;
  cutoff_passed: boolean;
  earliest_bookable_date?: string | null;
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(`${dateStr}T12:00:00`), "EEEE, do MMMM");
  } catch {
    return dateStr;
  }
}

function formatNoticeDate(dateStr: string): string {
  try {
    return format(parseISO(`${dateStr}T12:00:00`), "do MMMM");
  } catch {
    return dateStr;
  }
}

function monthKeyOffset(baseMonth: string, offset: number): string {
  return format(addMonths(parseISO(`${baseMonth}-01T12:00:00`), offset), "yyyy-MM");
}

export function AvailabilityExplorer({
  tours,
  initialTourId,
  initialPickups,
  initialDepartureId,
}: {
  tours: TourOption[];
  initialTourId: string;
  initialPickups: PickupOption[];
  initialDepartureId?: string;
}) {
  const thisMonth = format(startOfMonth(new Date()), "yyyy-MM");
  const [tourId, setTourId] = useState(initialTourId);
  const [month, setMonth] = useState(thisMonth);
  const [date, setDate] = useState<string | undefined>();
  const [pickups, setPickups] = useState<PickupOption[]>(initialPickups);
  const [isFindingMonth, setIsFindingMonth] = useState(false);
  const [advanceNotice, setAdvanceNotice] = useState<string | null>(null);
  const [departureId, setDepartureId] = useState<string | undefined>(
    initialDepartureId && initialPickups.some((pickup) => pickup.id === initialDepartureId)
      ? initialDepartureId
      : initialPickups[0]?.id
  );
  const autoJumpRequestSeq = useRef(0);

  const activeTour = tours.find((t) => t.id === tourId);

  async function handleTourChange(newTourId: string) {
    const tour = tours.find((t) => t.id === newTourId);
    setTourId(newTourId);
    setMonth(thisMonth);
    setDate(undefined);
    setAdvanceNotice(null);
    setDepartureId(undefined);
    if (tour?.slug) {
      const res = await fetch(`/api/tours/${tour.slug}/pickups`);
      if (res.ok) {
        const data = (await res.json()) as PickupOption[];
        setPickups(Array.isArray(data) ? data : []);
        setDepartureId(Array.isArray(data) ? data[0]?.id : undefined);
      } else {
        setPickups([]);
        setDepartureId(undefined);
      }
    } else {
      setPickups([]);
      setDepartureId(undefined);
    }
  }

  useEffect(() => {
    if (!tourId) return;

    async function jumpToFirstBookableMonth() {
      const requestSeq = ++autoJumpRequestSeq.current;
      setIsFindingMonth(true);
      let firstOpenDate: string | null = null;
      let firstOpenMonth: string | null = null;
      let earliestBookableDate: string | null = null;

      for (let offset = 0; offset <= 24; offset += 1) {
        const probeMonth = monthKeyOffset(thisMonth, offset);
        const params = new URLSearchParams({ tour_id: tourId, month: probeMonth });
        if (departureId) params.set("departure_location_id", departureId);

        try {
          const res = await fetch(`/api/availability?${params.toString()}`);
          if (!res.ok) continue;
          const days = (await res.json()) as AvailabilityDayPayload[];
          if (!Array.isArray(days)) continue;

          if (!earliestBookableDate) {
            const firstWithEarliest = days.find((d) => Boolean(d.earliest_bookable_date));
            earliestBookableDate = firstWithEarliest?.earliest_bookable_date ?? null;
          }

          const openDay = days.find((d) => d.available && !d.cutoff_passed && d.remaining_capacity > 0);
          if (openDay) {
            firstOpenDate = openDay.date;
            firstOpenMonth = probeMonth;
            break;
          }
        } catch {
          continue;
        }
      }

      if (firstOpenMonth) {
        if (requestSeq !== autoJumpRequestSeq.current) return;
        setMonth(firstOpenMonth);
        setAdvanceNotice(
          firstOpenMonth === thisMonth
            ? null
            : `This tour requires advance notice. Earliest available departure is ${formatNoticeDate(firstOpenDate ?? earliestBookableDate ?? "")}.`
        );
      } else if (earliestBookableDate) {
        if (requestSeq !== autoJumpRequestSeq.current) return;
        setAdvanceNotice(
          `No bookable dates are currently available. Earliest eligible departure opens from ${formatNoticeDate(
            earliestBookableDate
          )}.`
        );
      } else {
        if (requestSeq !== autoJumpRequestSeq.current) return;
        setAdvanceNotice("No bookable dates are currently available for this tour.");
      }
      if (requestSeq !== autoJumpRequestSeq.current) return;
      setIsFindingMonth(false);
    }

    void jumpToFirstBookableMonth();
  }, [departureId, thisMonth, tourId]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-16 xl:gap-20">
      <div className="space-y-8 md:space-y-14">
        {/* Calendar Control Center */}
        <Card className="rounded-sm border-brand-border shadow-md shadow-brand-heading/5 ring-1 ring-brand-heading/5">
          <CardHeader className="border-b border-brand-border p-0 md:p-8">
            <div className="grid gap-3 p-3 md:gap-8 md:p-0 sm:grid-cols-[3fr_1fr]">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-normal text-brand-muted">
                  Select experience
                </p>
                <select
                  className="w-full rounded-sm border border-brand-border bg-white px-3 py-2.5 text-sm font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 md:px-4 md:py-3 md:text-base"
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
                <p className="mb-3 text-xs font-bold uppercase tracking-normal text-brand-muted">
                  Select month
                </p>
                <input
                  type="month"
                  className="w-full rounded-sm border border-brand-border bg-white px-3 py-2.5 text-sm font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 md:px-4 md:py-3 md:text-base"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          {/* Tour Preview Card */}
          {activeTour && (
            <CardContent className="border-b border-brand-border bg-brand-surface-soft/30 p-0 md:p-6">
              <div className="flex flex-col gap-3 p-3 md:flex-row md:gap-6 md:p-0">
                {activeTour.heroImage && (
                  <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-sm bg-brand-border md:h-24 md:w-32">
                    <Image
                      src={activeTour.heroImage}
                      alt={activeTour.title}
                      fill
                      className="object-cover brightness-90 saturate-[0.85]"
                      sizes="128px"
                    />
                  </div>
                )}
                <div className="flex min-w-0 flex-col justify-center">
                  <h3 className="line-clamp-2 font-serif text-base font-bold leading-snug text-brand-heading md:line-clamp-1 md:text-xl">
                    {activeTour.title}
                  </h3>
                  {activeTour.shortDescription && (
                    <p className="mt-1 text-sm text-brand-muted line-clamp-2 hidden md:block">
                      {activeTour.shortDescription}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 md:mt-2.5 md:gap-x-4">
                    {activeTour.durationText && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-muted md:gap-1.5 md:text-xs">
                        <Clock className="h-3.5 w-3.5" />
                        {activeTour.durationText}
                      </span>
                    )}
                    {activeTour.groupSizeText && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-muted md:gap-1.5 md:text-xs">
                        <Users className="h-3.5 w-3.5" />
                        {activeTour.groupSizeText}
                      </span>
                    )}
                    {activeTour.locationRegion && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-muted md:gap-1.5 md:text-xs">
                        <MapPin className="h-3.5 w-3.5" />
                        {activeTour.locationRegion}
                      </span>
                    )}
                    {activeTour.priceFromText && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-muted md:text-xs">
                        Starting from <span className="font-bold text-brand-heading">{activeTour.priceFromText}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          )}

          <CardContent className="bg-white p-0 md:p-6">
            <div className="rounded-sm border border-brand-border bg-brand-surface-soft/50 p-3 md:p-7">
              <p className="mb-4 text-xs font-bold uppercase tracking-normal text-brand-muted">
                {activeTour?.isMultiDay ? "Select departure date" : "Select tour date"}
              </p>
              {advanceNotice ? (
                <div className="mb-4 flex items-start gap-2 rounded-sm border border-brand-primary/15 bg-brand-primary/[0.045] px-3 py-2 text-[13px] leading-relaxed text-brand-body md:mb-5 md:px-3.5 md:py-2.5 md:text-sm">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary/70" aria-hidden />
                  {advanceNotice}
                </div>
              ) : null}
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
        <Card className="rounded-sm border-brand-border shadow-md shadow-brand-heading/5 ring-1 ring-brand-heading/5">
          <CardHeader className="border-b border-brand-border p-3 md:p-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-normal text-brand-muted">
              {activeTour?.title ?? "—"}
            </p>
            <p className="font-serif text-[1.7rem] font-semibold tracking-tight text-brand-heading md:text-[2rem]">
              {date ? formatDate(date) : "Select a date"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-3 md:space-y-6 md:p-8">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-brand-muted">
                Pickup location
              </label>
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

            <div className="space-y-2">
              {date && departureId ? (
                <Button asChild variant="primary" className={cn("w-full", primaryTourCtaClassName)}>
                  <Link href={`/booking?tour_id=${tourId}&date=${date}&departure_location_id=${departureId}`}>
                    Confirm selection
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  type="button"
                  disabled
                  className={cn("w-full", primaryTourCtaClassName, "opacity-20 cursor-not-allowed")}
                >
                  Select a date
                </Button>
              )}
              <p className="mt-1.5 text-[11px] leading-relaxed text-brand-muted md:mt-2 md:text-xs">
                {isFindingMonth
                  ? "Finding the first month with bookable departures..."
                  : "Pick an open day in green to continue to secure checkout."}
              </p>
            </div>

            {activeTour && (
              <div className="border-t border-brand-border/50 pt-5">
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
