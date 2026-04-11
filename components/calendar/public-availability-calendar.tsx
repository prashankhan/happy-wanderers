"use client";

import { addMonths, format, parseISO, startOfMonth } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
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

function shiftMonthKey(ym: string, delta: number): string {
  return format(addMonths(parseISO(`${ym}-01T12:00:00`), delta), "yyyy-MM");
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

export interface PublicAvailabilityCalendarProps {
  tourId: string;
  departureLocationId?: string;
  selectedDate?: string;
  onSelectDate: (isoDate: string) => void;
  /** First month shown when the calendar mounts (e.g. from `?date=` deep link). */
  initialMonth?: string;
  /**
   * Controlled `yyyy-MM`. When set with `onMonthChange`, prev/next updates the parent.
   * Omit both for fully internal month navigation.
   */
  month?: string;
  onMonthChange?: (ym: string) => void;
}

export function PublicAvailabilityCalendar({
  tourId,
  departureLocationId,
  selectedDate,
  onSelectDate,
  initialMonth,
  month: controlledMonth,
  onMonthChange,
}: PublicAvailabilityCalendarProps) {
  const thisMonthKey = format(startOfMonth(new Date()), "yyyy-MM");
  const maxMonthKey = format(addMonths(startOfMonth(new Date()), 24), "yyyy-MM");

  const [internalMonth, setInternalMonth] = useState(() => {
    if (controlledMonth) return controlledMonth;
    if (initialMonth) return initialMonth;
    return thisMonthKey;
  });

  const effectiveMonth = controlledMonth ?? internalMonth;

  const lastSyncedInitialMonth = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (controlledMonth !== undefined) return;
    if (!initialMonth) return;
    if (lastSyncedInitialMonth.current === initialMonth) return;
    lastSyncedInitialMonth.current = initialMonth;
    setInternalMonth(initialMonth);
  }, [initialMonth, controlledMonth]);

  const setEffectiveMonth = useCallback(
    (ym: string) => {
      if (onMonthChange) onMonthChange(ym);
      if (controlledMonth === undefined) setInternalMonth(ym);
    },
    [controlledMonth, onMonthChange]
  );

  const [days, setDays] = useState<DayPayload[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ tour_id: tourId, month: effectiveMonth });
    if (departureLocationId) params.set("departure_location_id", departureLocationId);
    const res = await fetch(`/api/availability?${params.toString()}`);
    const json = (await res.json()) as DayPayload[];
    setDays(Array.isArray(json) ? json : []);
    setLoading(false);
  }, [tourId, effectiveMonth, departureLocationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  const grid = useMemo(() => {
    const [y, m] = effectiveMonth.split("-").map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const startPad = first.getUTCDay();
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells: { date: string | null }[] = [];
    for (let i = 0; i < startPad; i++) cells.push({ date: null });
    for (let d = 1; d <= lastDay; d++) {
      const ds = `${effectiveMonth}-${String(d).padStart(2, "0")}`;
      cells.push({ date: ds });
    }
    return cells;
  }, [effectiveMonth]);

  const monthLabel = format(parseISO(`${effectiveMonth}-01T12:00:00`), "MMMM yyyy");
  const canGoPrev = effectiveMonth > thisMonthKey;
  const canGoNext = effectiveMonth < maxMonthKey;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0 px-2"
            disabled={!canGoPrev || loading}
            onClick={() => setEffectiveMonth(shiftMonthKey(effectiveMonth, -1))}
            aria-label="Previous month"
          >
            ←
          </Button>
          <span className="min-w-0 truncate font-medium text-gray-900">{monthLabel}</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0 px-2"
            disabled={!canGoNext || loading}
            onClick={() => setEffectiveMonth(shiftMonthKey(effectiveMonth, 1))}
            aria-label="Next month"
          >
            →
          </Button>
        </div>
        {loading ? <span className="shrink-0">Loading…</span> : <span className="shrink-0">{days.filter((d) => d.available).length} open days</span>}
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
