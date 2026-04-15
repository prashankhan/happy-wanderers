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
    <div className="grid gap-16 lg:grid-cols-[1fr_400px] items-start">
      <div className="space-y-12">
        {/* Primary Action: The Calendar Control Center */}
        <Card className="shadow-md ring-1 ring-brand-heading/[0.03] rounded-sm order-first">
          <CardHeader className="border-b border-brand-border p-10">
            <div className="grid gap-10 sm:grid-cols-[1.6fr_1fr]">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">
                Select Experience
                <select
                  className="mt-4 w-full rounded-sm border border-brand-border bg-brand-surface px-5 py-4 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">
                Viewing Month
                <input
                  type="month"
                  className="mt-4 w-full rounded-sm border border-brand-border bg-brand-surface px-5 py-4 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </label>
            </div>
          </CardHeader>
          <CardContent className="p-10 bg-white">
            <div className="border border-brand-border rounded-sm p-6 bg-brand-surface-soft/50">
              <PublicAvailabilityCalendar
                tourId={tourId}
                month={month}
                onMonthChange={setMonth}
                selectedDate={date}
                onSelectDate={setDate}
                variant="compact"
              />
            </div>
          </CardContent>
        </Card>

        {/* Supporting Context: How we read the field */}
        <section className="rounded-sm border border-brand-border bg-brand-surface-soft p-12 text-brand-heading shadow-sm ring-1 ring-brand-border/40">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-8">
            <MapPin className="h-4 w-4" aria-hidden />
            Field Intelligence
          </div>
          <h2 className="font-serif text-4xl font-bold tracking-tighter md:text-5xl italic">How we read the field.</h2>
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-brand-body font-medium tracking-tight">
            Our calendars reflect live operator capacity and seasonal rainforest conditions. We observe the 
            <span className="text-brand-heading font-black underline decoration-brand-primary/30 underline-offset-4 mx-1">Australia/Brisbane</span> 
            field clock for all departures.
          </p>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-brand-border/60 pt-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                <span className="size-3 rounded-sm bg-availability-open" /> Open Canopy
              </div>
              <p className="text-sm text-brand-body/60 font-medium leading-relaxed">Standard capacity available for booking.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                <span className="size-3 rounded-sm bg-availability-low" /> Limited Seats
              </div>
              <p className="text-sm text-brand-body/60 font-medium leading-relaxed">Departure is reaching its small-group limit.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                <span className="size-3 rounded-sm bg-availability-full" /> Field Reserved
              </div>
              <p className="text-sm text-brand-body/60 font-medium leading-relaxed">Departure is at capacity or undergoing maintenance.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                <span className="size-3 rounded-sm bg-brand-muted/30" /> Logistics Cut-off
              </div>
              <p className="text-sm text-brand-body/60 font-medium leading-relaxed">Date is too close to departure for secure logistics.</p>
            </div>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-28">
        <Card className="shadow-xl ring-1 ring-brand-heading/[0.04] rounded-sm border-brand-border/60">
          <CardHeader className="border-b border-brand-border px-8 py-8">
            <CardTitle className="font-serif text-3xl font-bold italic">Verify & Continue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-10 p-8">
            <div className="rounded-sm border border-brand-border bg-brand-surface-soft p-8 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-4">Selected Departure</p>
              <p className="text-3xl font-black tracking-tighter text-brand-heading leading-none">{date ?? "—"}</p>
              {activeTour && date && (
                <p className="mt-4 text-xs font-bold text-brand-primary uppercase tracking-widest">{activeTour.title}</p>
              )}
            </div>
            
            <div className="pt-2">
              {date ? (
                <Button asChild variant="primary" className="w-full rounded-sm h-auto py-6 text-2xl font-bold tracking-tighter shadow-xl">
                  <Link href={`/booking?tour_id=${tourId}&date=${date}`}>Confirm selection</Link>
                </Button>
              ) : (
                <Button variant="primary" className="w-full rounded-sm h-auto py-6 text-2xl font-bold tracking-tighter opacity-20 cursor-not-allowed" type="button" disabled>
                  Select a date
                </Button>
              )}
            </div>

            {activeTour && (
              <div className="text-center">
                <Link href={`/tours/${activeTour.slug}`} className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted hover:text-brand-primary transition-colors">
                  Review tour details
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
