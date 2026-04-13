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
        <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-blue-950 via-blue-900 to-gray-900 px-6 py-8 text-white shadow-xl ring-1 ring-white/10 md:px-10 md:py-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-200/90">
            <MapPin className="h-4 w-4" aria-hidden />
            Live calendar
          </div>
          <h2 className="mt-4 font-serif text-2xl font-semibold md:text-3xl">Choose your tour &amp; month</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100/90 md:text-base">
            Capacity, cutoffs, and remaining seats resolve on the server. All times follow the operator timezone —{" "}
            <span className="font-medium text-white">Australia/Brisbane</span>.
          </p>
        </div>

        <Card className="border-gray-100 shadow-md ring-1 ring-gray-900/[0.03]">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="flex items-center gap-2 font-serif text-xl">
              <CalendarDays className="h-5 w-5 text-blue-900" aria-hidden />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <label className="block text-sm font-medium text-gray-800">
              Tour
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-900/15"
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
            <label className="block text-sm font-medium text-gray-800">
              Month
              <input
                type="month"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-900/15"
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
        <Card className="border-gray-100 shadow-lg ring-1 ring-gray-900/[0.04]">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="font-serif text-lg">Continue booking</CardTitle>
            {activeTour ? (
              <p className="text-sm text-gray-500">
                <Link href={`/tours/${activeTour.slug}`} className="font-medium text-blue-900 hover:underline">
                  View tour page
                </Link>
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-5 pt-5 text-sm text-gray-600">
            <div className="rounded-xl border border-gray-100 bg-gray-50/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Selected date</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{date ?? "—"}</p>
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
            <p className="text-xs leading-relaxed text-gray-500">
              Green = seats available · amber = low seats · red = full · grey = cut-off passed or unavailable.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
