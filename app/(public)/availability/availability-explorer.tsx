"use client";

import Link from "next/link";
import { useState } from "react";

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

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Select tour &amp; month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <label className="block text-sm font-medium text-gray-700">
            Tour
            <select
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
          <label className="block text-sm font-medium text-gray-700">
            Month
            <input
              type="month"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
          />
        </CardContent>
      </Card>
      <aside className="lg:sticky lg:top-28">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Continue booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <p>Selected date: {date ?? "—"}</p>
            {date ? (
              <Button asChild variant="primary" className="w-full">
                <Link href={`/booking?tour_id=${tourId}&date=${date}`}>Continue</Link>
              </Button>
            ) : (
              <Button variant="primary" className="w-full" type="button" disabled>
                Continue
              </Button>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
