"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";

interface DayPayload {
  date: string;
  available: boolean;
  remaining_capacity: number;
  total_capacity: number;
  cutoff_passed: boolean;
  override_exists: boolean;
  calendar_state?: string;
}

function cellClass(d: DayPayload): string {
  if (d.cutoff_passed) return "bg-gray-500 text-white";
  if (!d.available || d.remaining_capacity <= 0) {
    if (d.remaining_capacity <= 0 && d.total_capacity > 0) return "bg-red-500 text-white";
    return "bg-gray-300 text-gray-700";
  }
  const low = d.total_capacity > 0 && d.remaining_capacity / d.total_capacity <= 0.25;
  if (low) return "bg-amber-400 text-gray-900";
  return "bg-green-500 text-white";
}

export function PublicAvailabilityCalendar({
  tourId,
  departureLocationId,
  month,
  onSelectDate,
  selectedDate,
}: {
  tourId: string;
  departureLocationId?: string;
  month: string;
  onSelectDate: (isoDate: string) => void;
  selectedDate?: string;
}) {
  const [days, setDays] = useState<DayPayload[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ tour_id: tourId, month });
    if (departureLocationId) params.set("departure_location_id", departureLocationId);
    const res = await fetch(`/api/availability?${params.toString()}`);
    const json = (await res.json()) as DayPayload[];
    setDays(Array.isArray(json) ? json : []);
    setLoading(false);
  }, [tourId, month, departureLocationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  const grid = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const startPad = first.getUTCDay();
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells: { date: string | null }[] = [];
    for (let i = 0; i < startPad; i++) cells.push({ date: null });
    for (let d = 1; d <= lastDay; d++) {
      const ds = `${month}-${String(d).padStart(2, "0")}`;
      cells.push({ date: ds });
    }
    return cells;
  }, [month]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span className="font-medium text-gray-900">{month}</span>
        {loading ? <span>Loading…</span> : <span>{days.filter((d) => d.available).length} open days</span>}
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="font-medium text-gray-500">
            {d}
          </div>
        ))}
        {grid.map((cell, idx) => {
          const dateStr = cell.date;
          if (!dateStr) return <div key={`e-${idx}`} />;
          const d = byDate.get(dateStr);
          const isSel = selectedDate === dateStr;
          return (
            <button
              key={dateStr}
              type="button"
              disabled={!d || !d.available || d.cutoff_passed}
              onClick={() => {
                if (d && d.available && !d.cutoff_passed) onSelectDate(dateStr);
              }}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg text-xs font-medium transition",
                d ? cellClass(d) : "bg-gray-100 text-gray-400",
                isSel && "ring-2 ring-blue-900 ring-offset-2"
              )}
            >
              {Number(dateStr.slice(8, 10))}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500">
        Colours reflect live capacity and cutoff (Australia/Brisbane). Orange indicates limited seats.
      </p>
    </div>
  );
}
