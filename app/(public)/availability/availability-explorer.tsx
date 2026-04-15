"use client";

import Link from "next/link";
import { useState } from "react";

import { PublicAvailabilityCalendar } from "@/components/calendar/public-availability-calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-16 xl:gap-20">
      <div className="space-y-8 md:space-y-12">
        {/* Calendar Control Center */}
        <Card className="rounded-sm border-brand-border shadow-lg shadow-brand-heading/5 ring-1 ring-brand-heading/5">
          <CardHeader className="border-b border-brand-border p-4 md:p-8">
            <div className="grid gap-6 md:gap-8 sm:grid-cols-[3fr_1fr]">
              <div>
                <p className="text-base font-bold uppercase tracking-normal text-brand-muted mb-3">
                  Select Experience
                </p>
                <select
                  className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={tourId}
                  onChange={(e) => setTourId(e.target.value)}
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
          <CardContent className="p-4 md:p-8 bg-white">
            <div className="border border-brand-border rounded-sm p-4 md:p-6 bg-brand-surface-soft/50">
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
          <CardHeader className="border-b border-brand-border p-6 md:p-8">
            {activeTour && date && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-2">
                {activeTour.title}
              </p>
            )}
            <p className="text-3xl md:text-4xl font-black tracking-tighter text-brand-heading leading-none">
              {date ?? "—"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 p-6 md:p-8">
            <div>
              {date ? (
                <Button asChild variant="primary" className="w-full rounded-sm h-auto py-5 md:py-6 text-xl md:text-2xl font-bold tracking-tighter">
                  <Link href={`/booking?tour_id=${tourId}&date=${date}`}>Confirm selection</Link>
                </Button>
              ) : (
                <Button variant="primary" className="w-full rounded-sm h-auto py-5 md:py-6 text-xl md:text-2xl font-bold tracking-tighter opacity-20 cursor-not-allowed" type="button" disabled>
                  Select a date
                </Button>
              )}
            </div>

            {activeTour && (
              <div className="text-center pt-4 border-t border-brand-border/50">
                <Link href={`/tours/${activeTour.slug}`} className="text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors">
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
