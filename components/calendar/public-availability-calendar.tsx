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
  if (d.cutoff_passed) return "bg-availability-cutoff text-brand-heading";
  if (!d.available || d.remaining_capacity <= 0) {
    if (d.remaining_capacity <= 0 && d.total_capacity > 0) return "bg-availability-full text-white";
    return "bg-brand-border text-brand-muted";
  }
  const low = d.total_capacity > 0 && d.remaining_capacity / d.total_capacity <= 0.25;
  if (low) return "bg-availability-low text-brand-heading";
  return "bg-availability-open text-white";
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
  /** `default` shows full legend; `compact` hides legend (e.g. booking sidebar). */
  variant?: "default" | "compact";
}

export function PublicAvailabilityCalendar({
  tourId,
  departureLocationId,
  selectedDate,
  onSelectDate,
  initialMonth,
  month: controlledMonth,
  onMonthChange,
  variant = "default",
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

  const showLegend = variant !== "compact";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-brand-body">
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
          <span className="min-w-0 truncate font-medium text-brand-heading">{monthLabel}</span>
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
        {loading ? (
          <span className="shrink-0">Loading…</span>
        ) : (
          <span className="shrink-0">{days.filter((d) => d.available).length} open days</span>
        )}
      </div>
      {showLegend ? (
        <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-xl border border-brand-border bg-brand-accent-soft px-3 py-2.5 text-[11px] font-medium text-brand-body">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-availability-open" /> Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-availability-low" /> Low seats
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-availability-full" /> Sold out
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-availability-cutoff" /> Cut-off passed
          </span>
        </div>
      ) : null}
      <div className="grid grid-cols-7 gap-2 text-center text-xs">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="font-bold uppercase tracking-widest text-brand-muted/50 pb-2">
            {d}
          </div>
        ))}
        {grid.map((cell, idx) => {
          const dateStr = cell.date;
          if (!dateStr) return <div key={`e-${idx}`} />;
          const d = byDate.get(dateStr);
          const isSel = selectedDate === dateStr;
          const clickable = Boolean(d && d.available && !d.cutoff_passed);
          return (
            <button
              key={dateStr}
              type="button"
              disabled={!clickable}
              onClick={() => {
                if (d && d.available && !d.cutoff_passed) onSelectDate(dateStr);
              }}
              className={cn(
                "flex h-12 md:h-14 items-center justify-center rounded-sm text-sm font-bold transition-all duration-200",
                d ? cellClass(d) : "bg-brand-surface text-brand-muted/20",
                isSel && "ring-2 ring-brand-primary ring-offset-2 scale-[1.05] z-10 shadow-lg",
                clickable &&
                  "cursor-pointer hover:ring-2 hover:ring-brand-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              )}
            >
              {Number(dateStr.slice(8, 10))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
