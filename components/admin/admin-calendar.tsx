"use client";

import * as Dialog from "@radix-ui/react-dialog";
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

import { BookingListModal } from "@/components/admin/booking-list-modal";
import { Button } from "@/components/ui/button";
import { Toast, useToast } from "@/components/admin/toast";

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
  const [blockBookings, setBlockBookings] = useState(false);
  const [capacityOverride, setCapacityOverride] = useState("");
  const [cutoffOverride, setCutoffOverride] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const [bookingListOpen, setBookingListOpen] = useState(false);
  const [bookingListDate, setBookingListDate] = useState<string | null>(null);
  const [totalBookings, setTotalBookings] = useState<Record<string, number>>({});

  const isAllTours = tourId === "all";
  const monthKey = format(cursor, "yyyy-MM");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookingsRes] = await Promise.all([
        fetch(`/api/admin/bookings?${isAllTours ? `month=${encodeURIComponent(monthKey)}` : `tour_id=${encodeURIComponent(tourId)}&month=${encodeURIComponent(monthKey)}`}`),
      ]);

      if (bookingsRes.ok) {
        const bookings = (await bookingsRes.json()) as Array<{ booking: { bookingDate: string } }>;
        const counts: Record<string, number> = {};
        bookings.forEach((b) => {
          const date = b.booking.bookingDate;
          counts[date] = (counts[date] ?? 0) + 1;
        });
        setTotalBookings(counts);
      }

      if (!isAllTours) {
        const availabilityRes = await fetch(`/api/admin/availability?tour_id=${encodeURIComponent(tourId)}&month=${encodeURIComponent(monthKey)}`);
        if (!availabilityRes.ok) {
          setError("Could not load calendar");
          return;
        }
        const data = (await availabilityRes.json()) as DayPayload[];
        setDays(data);
      } else {
        setDays([]);
      }
    } finally {
      setLoading(false);
    }
  }, [tourId, monthKey, isAllTours]);

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
  }

  async function saveOverride() {
    if (!selected || !isAdmin) return;
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
      showToast(data.message ?? "Save failed", "error");
      return;
    }
    showToast("Day settings saved successfully");
    setModalOpen(false);
    await load();
  }

  async function clearOverride() {
    if (!selected || !isAdmin) return;
    const res = await fetch(
      `/api/admin/availability/override?tour_id=${encodeURIComponent(tourId)}&date=${encodeURIComponent(selected.date)}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      const data = (await res.json()) as { message?: string };
      showToast(data.message ?? "Delete failed", "error");
      return;
    }
    showToast("Day settings cleared");
    setModalOpen(false);
    await load();
  }

  if (tours.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-brand-border bg-brand-surface p-8 text-center">
        <p className="text-sm text-brand-muted">No tours available.</p>
        <p className="mt-1 text-xs text-brand-muted">Create a tour first to use the calendar.</p>
      </div>
    );
  }

  const today = new Date();

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap items-end gap-4">
        <label className="text-xs font-medium text-brand-muted">
          Tour
          <select
            className="mt-1 block w-full rounded-sm border border-brand-border px-3 py-2 text-sm sm:w-auto"
            value={tourId}
            onChange={(e) => setTourId(e.target.value)}
          >
            <option value="all">All tours</option>
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
          <span className="min-w-[140px] text-center text-sm font-medium text-brand-heading">{format(cursor, "MMMM yyyy")}</span>
          <Button type="button" variant="secondary" size="sm" onClick={() => setCursor((c) => addMonths(c, 1))}>
            Next
          </Button>
        </div>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-border border-t-brand-primary" />
            <span className="text-xs text-brand-muted">Loading…</span>
          </div>
        ) : null}
      </div>

      <div className={`grid min-w-[700px] grid-cols-7 gap-1 rounded-sm border border-brand-border bg-brand-border ${loading ? "opacity-50" : ""}`}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="bg-brand-surface py-2 text-center text-xs font-bold uppercase tracking-normal text-brand-muted">
            {d}
          </div>
        ))}
        {gridDays.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const row = dayMap.get(key);
          const inMonth = isSameMonth(d, cursor);
          const isToday = format(d, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
          const isPast = !isAllTours && d < today;
          const isBlocked = !isAllTours && row && !row.is_available;
          const isFuture = !isAllTours && row && row.is_available && !isToday && d > today;
          const isFull = !isAllTours && row && row.remaining_capacity === 0 && row.is_available;
          const bookingCount = totalBookings[key] ?? 0;
          const hasBookings = bookingCount > 0;

          return (
            <div
              key={key}
              className={[
                "min-h-[80px] bg-white p-1.5 text-left text-xs transition flex flex-col justify-between",
                !inMonth && "bg-brand-surface/50 text-brand-muted/50",
                isToday ? "ring-2 ring-inset ring-brand-primary" : "",
                isPast && !isToday ? "opacity-60" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between">
                <div className={`font-bold ${isToday ? "bg-brand-primary text-white rounded-full w-6 h-6 flex items-center justify-center" : ""}`}>
                  {format(d, "d")}
                </div>
                {isToday && !hasBookings ? (
                  <span className="rounded-full bg-brand-surface px-1.5 py-0.5 text-[10px] font-medium text-brand-muted">
                    No bookings
                  </span>
                ) : hasBookings && !(isPast && !isToday) ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBookingListDate(key);
                      setBookingListOpen(true);
                    }}
                    className="rounded-full bg-brand-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-primary hover:bg-brand-primary/20"
                  >
                    {bookingCount} booking{bookingCount !== 1 ? "s" : ""}
                  </button>
                ) : null}
              </div>
              {!isAllTours && row ? (
                <div className="flex-1">
                  <div className="mt-1 flex items-center gap-1">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${row.remaining_capacity > 0 ? "bg-green-500" : "bg-gray-400"}`} />
                    <span className="truncate text-[11px]">
                      {row.remaining_capacity}/{row.total_capacity}
                    </span>
                  </div>
                  {isPast && !isToday ? (
                    <div className="mt-0.5 text-[10px] font-medium text-brand-muted">Past</div>
                  ) : isBlocked ? (
                    <div className="mt-0.5 text-[10px] font-bold text-amber-600">Blocked booking</div>
                  ) : row.cutoff_passed ? (
                    <div className="mt-0.5 text-[10px] font-bold text-amber-600">Booking blocked</div>
                  ) : isFull ? (
                    <div className="mt-0.5 text-[10px] font-bold text-amber-600">Full</div>
                  ) : null}
                </div>
              ) : null}
              {!isAllTours && row && !(isPast && !isToday) && (
                <button
                  type="button"
                  onClick={() => openModal(d)}
                  className="mt-1 w-full rounded-sm border border-brand-border bg-brand-surface px-2 py-1 text-[10px] text-brand-muted hover:border-brand-primary hover:text-brand-primary"
                >
                  Edit day
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!isAdmin ? (
        <p className="text-xs text-brand-muted">
          Staff view: one-off day rules are read-only. Sign in as admin to edit.
        </p>
      ) : null}

      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-sm border border-brand-border bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-brand-heading">
              {selected ? format(parseISO(selected.date), "EEEE d MMM yyyy") : ""}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-xs text-brand-muted">
              Seats: {selected?.remaining_capacity ?? 0} / {selected?.total_capacity ?? 0}
              {selected?.override_exists ? " · Custom rule saved" : ""}
            </Dialog.Description>

            {isAdmin ? (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-brand-body">
                  Use this for <strong>exceptions only</strong> — single dates that differ from your normal schedule.
                </p>
                <div className="rounded-sm border border-brand-border bg-brand-surface p-3">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand-border"
                      checked={blockBookings}
                      onChange={(e) => setBlockBookings(e.target.checked)}
                    />
                    <span>
                      <span className="block text-sm font-medium text-brand-heading">Block bookings</span>
                      <span className="mt-0.5 block text-xs text-brand-body">
                        Stop all new bookings for this day.
                      </span>
                    </span>
                  </label>
                </div>
                <label className="block text-xs font-medium text-brand-muted">
                  Max guests (optional)
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                    value={capacityOverride}
                    onChange={(e) => setCapacityOverride(e.target.value)}
                    placeholder="Use default capacity"
                  />
                </label>
                <label className="block text-xs font-medium text-brand-muted">
                  Booking cutoff hours (optional)
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                    value={cutoffOverride}
                    onChange={(e) => setCutoffOverride(e.target.value)}
                    placeholder="e.g. 24"
                  />
                </label>
                <label className="block text-xs font-medium text-brand-muted">
                  Internal note (optional)
                  <textarea
                    className="mt-1 min-h-[64px] w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Why is this day different?"
                  />
                </label>
                <div className="flex flex-wrap gap-2 border-t border-brand-border pt-4">
                  <Button type="button" onClick={() => void saveOverride()}>
                    Save
                  </Button>
                  {selected?.override_exists ? (
                    <Button type="button" variant="danger" onClick={() => void clearOverride()}>
                      Clear
                    </Button>
                  ) : null}
                  <Dialog.Close asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </Dialog.Close>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <Dialog.Close asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </Dialog.Close>
              </div>
            )}

            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute right-4 top-4 rounded-sm p-1 text-brand-muted hover:text-brand-heading"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <BookingListModal
        tourId={tourId}
        date={bookingListDate ?? ""}
        open={bookingListOpen}
        onOpenChange={setBookingListOpen}
      />
    </div>
  );
}
