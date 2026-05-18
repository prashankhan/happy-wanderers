"use client";

import { format, parseISO } from "date-fns";
import { useCallback, useEffect, useState } from "react";

interface FirstOpenPayload {
  first_open_date: string | null;
  first_open_month: string | null;
  earliest_bookable_date: string | null;
}

export function TourNextOpenChip({
  tourId,
  departureLocationId,
}: {
  tourId: string;
  departureLocationId?: string;
}) {
  const [label, setLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    const fromMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const params = new URLSearchParams({
      tour_id: tourId,
      from_month: fromMonth,
      horizon_months: "6",
    });
    if (departureLocationId) params.set("departure_location_id", departureLocationId);

    try {
      const res = await fetch(`/api/availability/first-open?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as FirstOpenPayload;
        if (data.first_open_date) {
          try {
            const pretty = format(parseISO(`${data.first_open_date}T12:00:00`), "EEEE, do MMMM yyyy");
            setLabel(pretty);
          } catch {
            setLabel(data.first_open_date);
          }
          setLoading(false);
          return;
        }
      }
    } catch {
      /* fall through to empty state */
    }

    setLabel(null);
    setLoading(false);
  }, [tourId, departureLocationId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <p className="text-xs text-brand-muted">
        Loading next departure…
      </p>
    );
  }

  if (!label) {
    return (
      <p className="text-xs text-brand-muted">
        No upcoming departures
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="h-2 w-2 shrink-0 rounded-full bg-brand-primary" aria-hidden />
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Next departure</span>
        <span className="text-sm font-semibold text-brand-heading">{label}</span>
      </div>
    </div>
  );
}
