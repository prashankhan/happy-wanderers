"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

export interface AdminCalendarTourOption {
  id: string;
  title: string;
}

interface DayPayload {
  date: string;
  is_available: boolean;
  remaining_capacity: number;
  total_capacity: number;
  cutoff_passed: boolean;
  override_exists: boolean;
  calendar_state?: string;
}

export interface AdminCalendarProps {
  tours: AdminCalendarTourOption[];
  isAdmin: boolean;
}

export function AdminCalendar({ tours, isAdmin }: AdminCalendarProps) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [tourId, setTourId] = useState(tours[0]?.id ?? "");
  const [days, setDays] = useState<DayPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<DayPayload | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  /** When true, this one-day rule stops all new bookings for that date (maps to `is_available: false`). */
  const [blockBookings, setBlockBookings] = useState(false);
  const [capacityOverride, setCapacityOverride] = useState("");
  const [cutoffOverride, setCutoffOverride] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const monthKey = format(cursor, "yyyy-MM");

  const load = useCallback(async () => {
    if (!tourId) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/admin/availability?tour_id=${encodeURIComponent(tourId)}&month=${encodeURIComponent(monthKey)}`
      );
      if (!res.ok) {
        setMsg("Could not load calendar");
        return;
      }
      const data = (await res.json()) as DayPayload[];
      setDays(data);
    } finally {
      setLoading(false);
    }
  }, [tourId, monthKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const dayMap = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  function openModal(d: Date) {
    const key = format(d, "yyyy-MM-dd");
    const row = dayMap.get(key);
    if (!row) return;
    setSelected(row);
    setBlockBookings(!row.is_available);
    setCapacityOverride("");
    setCutoffOverride("");
    setNote("");
    setModalOpen(true);
    setMsg(null);
  }

  async function saveOverride() {
    if (!selected || !isAdmin) return;
    setMsg(null);
    const res = await fetch("/api/admin/availability/override", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tour_id: tourId,
        date: selected.date,
        is_available: !blockBookings,
        capacity_override: capacityOverride ? Number(capacityOverride) : null,
        cutoff_override_hours: cutoffOverride ? Number(cutoffOverride) : null,
        note: note || null,
      }),
    });
    const data = (await res.json()) as { success?: boolean; message?: string };
    if (!res.ok) {
      setMsg(data.message ?? "Save failed");
      return;
    }
    setModalOpen(false);
    await load();
  }

  async function clearOverride() {
    if (!selected || !isAdmin) return;
    setMsg(null);
    const res = await fetch(
      `/api/admin/availability/override?tour_id=${encodeURIComponent(tourId)}&date=${encodeURIComponent(selected.date)}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      const data = (await res.json()) as { message?: string };
      setMsg(data.message ?? "Delete failed");
      return;
    }
    setModalOpen(false);
    await load();
  }

  if (tours.length === 0) {
    return <p className="text-sm text-brand-body">Add a tour to use the calendar.</p>;
  }

  const today = new Date();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-xs font-medium text-brand-muted">
          Tour
          <select
            className="mt-1 block rounded-sm border border-brand-border px-3 py-2 text-sm"
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
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setCursor((c) => addMonths(c, -1))}>
            Previous
          </Button>
          <span className="text-sm font-medium text-brand-heading">{format(cursor, "MMMM yyyy")}</span>
          <Button type="button" variant="secondary" size="sm" onClick={() => setCursor((c) => addMonths(c, 1))}>
            Next
          </Button>
        </div>
        {loading ? <span className="text-xs text-brand-muted">Loading…</span> : null}
      </div>

      <div className={`grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-normal text-brand-muted ${loading ? "opacity-50" : ""}`}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
        {gridDays.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const row = dayMap.get(key);
          const inMonth = isSameMonth(d, cursor);
          const isToday = format(d, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
          const isFull = row && row.remaining_capacity === 0 && row.is_available;
          const isPast = row && !row.is_available;

          return (
            <button
              key={key}
              type="button"
              onClick={() => row && openModal(d)}
              disabled={!row}
              className={[
                "min-h-[80px] rounded-sm border p-1.5 text-left text-xs transition",
                inMonth ? "border-brand-border bg-white" : "border-transparent bg-brand-surface/50 text-brand-muted/50",
                row?.override_exists ? "ring-2 ring-brand-primary" : "",
                isToday ? "ring-2 ring-brand-primary" : "",
                row && !isPast && !isFull ? "text-brand-heading hover:border-brand-primary cursor-pointer" : "",
                isFull ? "text-brand-muted" : "",
                isPast ? "text-red-700" : "",
              ].join(" ")}
            >
              <div className={`font-bold ${isToday ? "bg-brand-primary text-white rounded-full w-6 h-6 flex items-center justify-center -ml-0.5" : ""}`}>
                {format(d, "d")}
              </div>
              {row ? (
                <>
                  <div className="mt-1 flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${row.remaining_capacity > 0 ? "bg-green-500" : "bg-gray-400"}`} />
                    <span className="text-[11px]">
                      {row.remaining_capacity}/{row.total_capacity}
                    </span>
                  </div>
                  {row.cutoff_passed ? (
                    <div className="mt-0.5 text-[10px] font-bold text-red-600">Booking blocked</div>
                  ) : null}
                  {isFull ? (
                    <div className="mt-0.5 text-[10px] font-bold text-red-600">Full</div>
                  ) : null}
                </>
              ) : null}
            </button>
          );
        })}
      </div>

      {!isAdmin ? (
        <p className="text-xs text-brand-muted">
          Staff view: one-off day rules are read-only. Sign in as admin to edit.
        </p>
      ) : null}

      {modalOpen && selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-sm bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-brand-heading">
              {format(parseISO(selected.date), "EEEE d MMM yyyy")}
            </h3>
            <p className="mt-1 text-xs text-brand-muted">
              Seats left / total for this day: {selected.remaining_capacity} / {selected.total_capacity}
              {selected.override_exists ? " · Custom day rule saved" : ""}
            </p>
            {msg ? <p className="mt-2 text-sm text-red-600">{msg}</p> : null}
            {isAdmin ? (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-brand-body">
                  Use this window only when <strong>this single date</strong> should behave differently from your
                  normal tour schedule (weekday rules, default capacity, and cutoff in the tour editor / settings).
                  You do <strong>not</strong> go through every open day—only the exceptions.
                </p>
                <div className="rounded-sm border border-brand-border bg-brand-surface/80 p-3">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand-border"
                      checked={blockBookings}
                      onChange={(e) => setBlockBookings(e.target.checked)}
                    />
                    <span>
                      <span className="block text-sm font-medium text-brand-heading">
                        Block new bookings on this date
                      </span>
                      <span className="mt-0.5 block text-xs text-brand-body">
                        When on, nobody can book this tour on this day. When off, your usual rules apply (the day can
                        still look ‘full’ or ‘past cutoff’ from capacity or timing—that is normal).
                      </span>
                    </span>
                  </label>
                </div>
                <label className="block text-xs font-medium text-brand-body">
                  Max guests this day (optional)
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                    value={capacityOverride}
                    onChange={(e) => setCapacityOverride(e.target.value)}
                    placeholder="Leave blank to use your normal capacity for this day"
                  />
                  <span className="mt-1 block text-[11px] text-brand-muted">
                    Only fill this if this day needs a different seat cap than usual (e.g. smaller vessel).
                  </span>
                </label>
                <label className="block text-xs font-medium text-brand-body">
                  Stop bookings this many hours before departure (optional)
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                    value={cutoffOverride}
                    onChange={(e) => setCutoffOverride(e.target.value)}
                    placeholder="e.g. 24 — leave blank for normal cutoff"
                  />
                  <span className="mt-1 block text-[11px] text-brand-muted">
                    Overrides the usual ‘book by X hours before pickup’ rule for this day only.
                  </span>
                </label>
                <label className="block text-xs font-medium text-brand-body">
                  Internal note (optional)
                  <textarea
                    className="mt-1 min-h-[64px] w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. why this day is different — for your team only"
                  />
                </label>
                <div className="flex flex-wrap gap-2 border-t border-brand-border pt-4">
                  <Button type="button" onClick={() => void saveOverride()}>
                    Save for this date
                  </Button>
                  <Button type="button" variant="danger" onClick={() => void clearOverride()}>
                    Clear custom settings
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
