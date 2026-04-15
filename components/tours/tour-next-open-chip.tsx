"use client";

import { format, parseISO } from "date-fns";
import { useCallback, useEffect, useState } from "react";

interface DayPayload {
  date: string;
  available: boolean;
  remaining_capacity: number;
  total_capacity: number;
  cutoff_passed: boolean;
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
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const params = new URLSearchParams({ tour_id: tourId, month });
      if (departureLocationId) params.set("departure_location_id", departureLocationId);
      const res = await fetch(`/api/availability?${params.toString()}`);
      const json = (await res.json()) as DayPayload[];
      if (!Array.isArray(json)) continue;
      const next = json
        .filter((x) => x.available && !x.cutoff_passed && x.remaining_capacity > 0)
        .sort((a, b) => a.date.localeCompare(b.date))[0];
      if (next) {
        try {
          const pretty = format(parseISO(`${next.date}T12:00:00`), "EEEE, do MMMM yyyy");
          setLabel(pretty);
        } catch {
          setLabel(next.date);
        }
        setLoading(false);
        return;
      }
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

  const fullLabel = label.toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <span className="h-2 w-2 shrink-0 rounded-full bg-brand-primary" aria-hidden />
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Next departure</span>
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-heading">{fullLabel}</span>
      </div>
    </div>
  );
}
