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
  if (d.calendar_state === "cutoff_passed" || d.cutoff_passed)
    return "bg-availability-cutoff/90 text-brand-heading";
  if (d.calendar_state === "sold_out") return "bg-availability-full text-white";
  if (d.calendar_state === "unavailable") return "bg-availability-cutoff/90 text-brand-heading";
  if (!d.available || d.remaining_capacity <= 0) return "bg-brand-border/80 text-brand-muted";
  const low = d.total_capacity > 0 && d.remaining_capacity / d.total_capacity <= 0.25;
  if (low) return "bg-availability-low text-brand-heading";
  return "bg-availability-open/95 text-white";
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
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ tour_id: tourId, month: effectiveMonth });
      if (departureLocationId) params.set("departure_location_id", departureLocationId);
      const res = await fetch(`/api/availability?${params.toString()}`);
      if (!res.ok) {
        setDays([]);
        setError("Could not load availability for this month.");
        return;
      }
      const json = (await res.json()) as DayPayload[];
      setDays(Array.isArray(json) ? json : []);
    } catch {
      setDays([]);
      setError("Could not load availability for this month.");
    } finally {
      setLoading(false);
    }
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
  const openBookableDays = days.filter((d) => d.available && !d.cutoff_passed && d.remaining_capacity > 0).length;

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-brand-body md:gap-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 shrink-0 px-2 text-brand-heading md:h-9"
            disabled={!canGoPrev || loading}
            onClick={() => setEffectiveMonth(shiftMonthKey(effectiveMonth, -1))}
            aria-label="Previous month"
          >
            ←
          </Button>
          <span className="min-w-0 truncate text-[13px] font-semibold tracking-[0.01em] text-brand-heading md:text-sm">
            {monthLabel}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 shrink-0 px-2 text-brand-heading md:h-9"
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
          <span className="shrink-0 text-xs font-bold uppercase tracking-normal text-brand-muted">
            {openBookableDays} bookable days
          </span>
        )}
      </div>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
      {showLegend ? (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-sm border border-brand-border/60 bg-brand-surface-soft/80 px-2.5 py-2 md:gap-x-5 md:gap-y-2 md:px-3.5 md:py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-availability-open" />
            <span className="text-[10px] font-medium text-brand-muted md:text-[11px]">Open</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-availability-low" />
            <span className="text-[10px] font-medium text-brand-muted md:text-[11px]">Few left</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-availability-full" />
            <span className="text-[10px] font-medium text-brand-muted md:text-[11px]">Sold out</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-availability-cutoff" />
            <span className="text-[10px] font-medium text-brand-muted md:text-[11px]">Booking closed</span>
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs md:gap-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted/60">
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
                "flex h-11 items-center justify-center rounded-sm text-sm font-bold transition-all duration-200 md:h-14",
                d ? cellClass(d) : "bg-brand-surface text-brand-muted/20",
                isSel &&
                  "z-10 scale-[1.03] ring-2 ring-brand-primary/80 ring-offset-2 ring-offset-white shadow-[0_10px_26px_-14px_rgba(15,23,42,0.65)]",
                clickable &&
                  "cursor-pointer hover:-translate-y-0.5 hover:ring-2 hover:ring-brand-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
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
