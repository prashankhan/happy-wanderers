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
    <div className="grid gap-16 lg:grid-cols-[1fr_380px]">
      <div className="space-y-10">
        <div className="rounded-sm border border-brand-border bg-brand-surface-soft px-8 py-10 text-brand-heading shadow-sm ring-1 ring-brand-border/40 md:px-12 md:py-14">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
            <MapPin className="h-4 w-4" aria-hidden />
            Field Calendar
          </div>
          <h2 className="mt-6 font-serif text-3xl font-bold md:text-4xl tracking-tight">Select tour & month</h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-body/80 font-medium tracking-tight">
            Capacity and seasonal cutoffs are managed live. All timeframes observed follow our local field clock —{" "}
            <span className="font-bold text-brand-heading">Australia/Brisbane</span>.
          </p>
        </div>

        <Card className="shadow-md ring-1 ring-brand-heading/[0.03] rounded-sm">
          <CardHeader className="border-b border-brand-border pb-6 px-8">
            <CardTitle className="flex items-center gap-3 font-serif text-2xl font-bold">
              <CalendarDays className="h-6 w-6 text-brand-primary" aria-hidden />
              Availability Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-10 pt-8 px-8 pb-10">
            <div className="grid gap-8 sm:grid-cols-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-muted">
                Experience
                <select
                  className="mt-3 w-full rounded-sm border border-brand-border bg-brand-surface px-5 py-4 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
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
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-muted">
                Month
                <input
                  type="month"
                  className="mt-3 w-full rounded-sm border border-brand-border bg-brand-surface px-5 py-4 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </label>
            </div>
            <div className="border border-brand-border rounded-sm p-4 bg-white/50">
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

      <aside className="lg:sticky lg:top-36">
        <Card className="shadow-xl ring-1 ring-brand-heading/[0.04] rounded-sm border-brand-border/60">
          <CardHeader className="border-b border-brand-border px-8 py-8">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-2xl font-bold italic">Continue</CardTitle>
              {activeTour ? (
                <Link href={`/tours/${activeTour.slug}`} className="text-xs font-bold uppercase tracking-widest text-brand-primary hover:underline">
                  Tour details
                </Link>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="rounded-sm border border-brand-border bg-brand-surface-soft p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">Selected Departure</p>
              <p className="mt-3 text-2xl font-black tracking-tight text-brand-heading">{date ?? "—"}</p>
            </div>
            
            <div className="pt-2">
              {date ? (
                <Button asChild variant="primary" className="w-full rounded-sm h-auto py-5 text-xl font-bold tracking-tight shadow-lg">
                  <Link href={`/booking?tour_id=${tourId}&date=${date}`}>Confirm selection</Link>
                </Button>
              ) : (
                <Button variant="primary" className="w-full rounded-sm h-auto py-5 text-xl font-bold tracking-tight opacity-40" type="button" disabled>
                  Select a date
                </Button>
              )}
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-muted mb-4">Legend</p>
              <div className="grid grid-cols-2 gap-y-3 text-[10px] font-bold uppercase tracking-widest text-brand-body/60">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-availability-open" /> Available
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-availability-low" /> Limited
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-availability-full" /> Full
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-brand-muted/30" /> Unavailable
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
