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
          const pretty = format(parseISO(`${next.date}T12:00:00`), "EEE d MMM");
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
      <p className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500">
        Finding next departure…
      </p>
    );
  }

  if (!label) {
    return (
      <p className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900">
        Check calendar for next open date
      </p>
    );
  }

  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-900">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden />
      Next open departure · {label}
    </p>
  );
}
