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
  const [isAvailable, setIsAvailable] = useState(true);
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
    setIsAvailable(row.is_available);
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
        is_available: isAvailable,
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
    return <p className="text-sm text-gray-600">Add a tour to use the calendar.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-xs font-medium text-gray-500">
          Tour
          <select
            className="mt-1 block rounded-lg border border-gray-200 px-3 py-2 text-sm"
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
          <span className="text-sm font-medium text-gray-900">{format(cursor, "MMMM yyyy")}</span>
          <Button type="button" variant="secondary" size="sm" onClick={() => setCursor((c) => addMonths(c, 1))}>
            Next
          </Button>
        </div>
        {loading ? <span className="text-xs text-gray-500">Loading…</span> : null}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
        {gridDays.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const row = dayMap.get(key);
          const inMonth = isSameMonth(d, cursor);
          return (
            <button
              key={key}
              type="button"
              onClick={() => row && openModal(d)}
              disabled={!row}
              className={[
                "min-h-[72px] rounded-xl border p-1 text-left text-xs transition",
                inMonth ? "border-gray-200 bg-white" : "border-transparent bg-gray-50 text-gray-400",
                row?.is_available ? "text-gray-900" : "text-red-700",
                row?.override_exists ? "ring-2 ring-blue-300" : "",
              ].join(" ")}
            >
              <div className="font-semibold">{format(d, "d")}</div>
              {row ? (
                <>
                  <div className="text-[10px] text-gray-500">
                    {row.remaining_capacity}/{row.total_capacity}
                  </div>
                  {row.cutoff_passed ? <div className="text-[10px] text-amber-700">Cutoff</div> : null}
                </>
              ) : null}
            </button>
          );
        })}
      </div>

      {!isAdmin ? (
        <p className="text-xs text-gray-500">Staff view: overrides are read-only. Sign in as admin to edit.</p>
      ) : null}

      {modalOpen && selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-serif text-lg font-semibold text-gray-900">
              {format(parseISO(selected.date), "EEEE d MMM yyyy")}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Remaining {selected.remaining_capacity} / {selected.total_capacity}
              {selected.override_exists ? " · Override active" : ""}
            </p>
            {msg ? <p className="mt-2 text-sm text-red-600">{msg}</p> : null}
            {isAdmin ? (
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
                  Date available
                </label>
                <label className="block text-xs font-medium text-gray-500">
                  Capacity override (optional)
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={capacityOverride}
                    onChange={(e) => setCapacityOverride(e.target.value)}
                    placeholder="Leave empty to keep engine default"
                  />
                </label>
                <label className="block text-xs font-medium text-gray-500">
                  Cutoff override hours (optional)
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={cutoffOverride}
                    onChange={(e) => setCutoffOverride(e.target.value)}
                  />
                </label>
                <label className="block text-xs font-medium text-gray-500">
                  Note
                  <textarea
                    className="mt-1 min-h-[64px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </label>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button type="button" onClick={() => void saveOverride()}>
                    Save override
                  </Button>
                  <Button type="button" variant="danger" onClick={() => void clearOverride()}>
                    Remove override
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                    Close
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
