"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";

import { PublicAvailabilityCalendar } from "@/components/calendar/public-availability-calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AvailabilityExplorer({
  tours,
  initialTourId,
}: {
  tours: { id: string; title: string; slug: string }[];
  initialTourId: string;
}) {
  const [tourId, setTourId] = useState(initialTourId);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [date, setDate] = useState<string | undefined>();

  const activeTour = tours.find((t) => t.id === tourId);

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-brand-border bg-brand-accent-soft px-6 py-8 text-brand-heading shadow-md ring-1 ring-brand-border/60 md:px-10 md:py-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-accent">
            <MapPin className="h-4 w-4" aria-hidden />
            Live calendar
          </div>
          <h2 className="mt-4 font-serif text-2xl font-semibold md:text-3xl">Choose your tour &amp; month</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-body md:text-base">
            Capacity, cutoffs, and remaining seats resolve on the server. All times follow the operator timezone —{" "}
            <span className="font-medium text-brand-heading">Australia/Brisbane</span>.
          </p>
        </div>

        <Card className="shadow-md ring-1 ring-brand-heading/[0.03]">
          <CardHeader className="border-b border-brand-border pb-4">
            <CardTitle className="flex items-center gap-2 font-serif text-xl">
              <CalendarDays className="h-5 w-5 text-brand-accent" aria-hidden />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <label className="block text-sm font-medium text-brand-heading">
              Tour
              <select
                className="mt-2 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-heading shadow-sm transition focus:border-brand-accent/40 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={tourId}
                onChange={(e) => setTourId(e.target.value)}
              >
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-brand-heading">
              Month
              <input
                type="month"
                className="mt-2 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-heading shadow-sm transition focus:border-brand-accent/40 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </label>
            <PublicAvailabilityCalendar
              tourId={tourId}
              month={month}
              onMonthChange={setMonth}
              selectedDate={date}
              onSelectDate={setDate}
              variant="default"
            />
          </CardContent>
        </Card>
      </div>

      <aside className="lg:sticky lg:top-28">
        <Card className="shadow-lg ring-1 ring-brand-heading/[0.04]">
          <CardHeader className="border-b border-brand-border">
            <CardTitle className="font-serif text-lg">Continue booking</CardTitle>
            {activeTour ? (
              <p className="text-sm text-brand-muted">
                <Link href={`/tours/${activeTour.slug}`} className="font-medium text-brand-accent hover:underline">
                  View tour page
                </Link>
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-5 pt-5 text-sm text-brand-body">
            <div className="rounded-xl border border-brand-border bg-brand-accent-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Selected date</p>
              <p className="mt-2 text-lg font-semibold text-brand-heading">{date ?? "—"}</p>
            </div>
            {date ? (
              <Button asChild variant="primary" className="w-full">
                <Link href={`/booking?tour_id=${tourId}&date=${date}`}>Continue to booking</Link>
              </Button>
            ) : (
              <Button variant="primary" className="w-full" type="button" disabled>
                Continue to booking
              </Button>
            )}
            <p className="text-xs leading-relaxed text-brand-muted">
              Green = seats available · gold = low seats · red = full · slate = cut-off passed or unavailable.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
