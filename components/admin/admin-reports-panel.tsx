"use client";

import { useState } from "react";

import { AdminCombobox } from "@/components/admin/admin-combobox";
import { adminFieldClass } from "@/components/admin/form-field-styles";
import { Button } from "@/components/ui/button";
import { calendarDateTodayInTimeZone } from "@/lib/utils/dates";

export interface ReportTourOption {
  id: string;
  title: string;
}

export interface AdminReportsPanelProps {
  tours: ReportTourOption[];
  /** IANA zone from Admin → Settings (`system_settings.timezone`). */
  businessTimezone: string;
}

export function AdminReportsPanel({ tours, businessTimezone }: AdminReportsPanelProps) {
  const today = calendarDateTodayInTimeZone(businessTimezone);
  const monthStart = `${today.slice(0, 7)}-01`;
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [tourId, setTourId] = useState("");
  const [status, setStatus] = useState("confirmed");
  const [bookingTotals, setBookingTotals] = useState<{
    booking_count: number;
    guest_total: number;
    revenue_total: string;
  } | null>(null);
  const [revenue, setRevenue] = useState<{
    by_day: { date: string; revenue: string; bookings: number }[];
    by_tour: { tour_id: string; tour_title: string | null; bookings: number; guests: number; revenue: string }[];
  } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      if (from > to) {
        setMsg("“From” date must be on or before “To”.");
        return;
      }
      const q1 = new URLSearchParams({ from, to, status });
      if (tourId) q1.set("tour_id", tourId);
      const [res1, res2] = await Promise.all([
        fetch(`/api/admin/reports/bookings?${q1.toString()}`),
        fetch(`/api/admin/reports/revenue?${new URLSearchParams({ from, to }).toString()}`),
      ]);
      if (!res1.ok || !res2.ok) {
        setMsg("Could not load reports");
        return;
      }
      setBookingTotals((await res1.json()) as typeof bookingTotals);
      setRevenue((await res2.json()) as typeof revenue);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="text-xs font-medium text-brand-muted">
          From
          <input
            type="date"
            className={`mt-1 block sm:w-auto ${adminFieldClass}`}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-xs font-medium text-brand-muted">
          To
          <input
            type="date"
            className={`mt-1 block sm:w-auto ${adminFieldClass}`}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <label className="text-xs font-medium text-brand-muted">
          Tour
          <AdminCombobox
            className="mt-1 block sm:min-w-[160px] sm:w-auto"
            value={tourId}
            onValueChange={setTourId}
            options={[
              { value: "", label: "All" },
              ...tours.map((tour) => ({ value: tour.id, label: tour.title })),
            ]}
          />
        </label>
        <label className="text-xs font-medium text-brand-muted">
          Status (bookings report)
          <AdminCombobox
            className="mt-1 block"
            value={status}
            onValueChange={setStatus}
            options={[
              { value: "confirmed", label: "confirmed" },
              { value: "pending", label: "pending" },
              { value: "failed", label: "failed" },
              { value: "expired", label: "expired" },
              { value: "cancelled", label: "cancelled" },
              { value: "refunded", label: "refunded" },
            ]}
          />
        </label>
        <Button type="button" onClick={() => void load()} disabled={loading}>
          Run report
        </Button>
      </div>
      {msg ? <p className="text-sm text-red-600">{msg}</p> : null}

      {bookingTotals ? (
        <section className="rounded-sm border border-brand-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-heading">Booking totals</h2>
          <p className="mt-2 text-sm text-brand-body">
            Bookings {bookingTotals.booking_count} · Guests {bookingTotals.guest_total} · Revenue{" "}
            {bookingTotals.revenue_total}
          </p>
        </section>
      ) : null}

      {revenue ? (
        <>
          <section className="rounded-sm border border-brand-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-heading">Revenue by day (confirmed)</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b text-xs uppercase text-brand-muted">
                  <tr>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Bookings</th>
                    <th className="py-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.by_day.map((d) => (
                    <tr key={d.date} className="border-b border-brand-border">
                      <td className="py-2 pr-4">{d.date}</td>
                      <td className="py-2 pr-4">{d.bookings}</td>
                      <td className="py-2">{d.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="rounded-sm border border-brand-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-heading">By tour (confirmed)</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b text-xs uppercase text-brand-muted">
                  <tr>
                    <th className="py-2 pr-4">Tour</th>
                    <th className="py-2 pr-4">Bookings</th>
                    <th className="py-2 pr-4">Guests</th>
                    <th className="py-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.by_tour.map((t) => (
                    <tr key={t.tour_id} className="border-b border-brand-border">
                      <td className="py-2 pr-4">{t.tour_title ?? t.tour_id}</td>
                      <td className="py-2 pr-4">{t.bookings}</td>
                      <td className="py-2 pr-4">{t.guests}</td>
                      <td className="py-2">{t.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
