"use client";

import { useState } from "react";

import { AdminCombobox } from "@/components/admin/admin-combobox";
import { adminFieldClass, adminToolbarButtonClass } from "@/components/admin/form-field-styles";
import { Button } from "@/components/ui/button";
import { calendarDateTodayInTimeZone } from "@/lib/utils/dates";

export interface ManifestTourOption {
  id: string;
  title: string;
}

interface ManifestRow {
  booking_reference: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  pickup_location: string;
  pickup_time: string;
  adults: number;
  children: number;
  infants: number;
  guest_total: number;
  customer_notes: string | null;
  tour_title: string;
}

export interface AdminManifestPanelProps {
  tours: ManifestTourOption[];
  /** IANA zone from Admin → Settings (`system_settings.timezone`). */
  businessTimezone: string;
}

export function AdminManifestPanel({ tours, businessTimezone }: AdminManifestPanelProps) {
  const [date, setDate] = useState(() => calendarDateTodayInTimeZone(businessTimezone));
  const [tourId, setTourId] = useState<string>("");
  const [rows, setRows] = useState<ManifestRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const q = new URLSearchParams({ date });
      if (tourId) q.set("tour_id", tourId);
      const res = await fetch(`/api/admin/manifests?${q.toString()}`);
      if (!res.ok) {
        setMsg("Could not load manifest");
        return;
      }
      setRows((await res.json()) as ManifestRow[]);
    } finally {
      setLoading(false);
    }
  }

  function print() {
    window.print();
  }

  return (
    <div className="space-y-4 print:space-y-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end print:hidden">
        <label className="text-xs font-medium text-brand-muted">
          Date
          <input
            type="date"
            className={`mt-1 block sm:w-auto ${adminFieldClass}`}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="text-xs font-medium text-brand-muted">
          Tour (optional)
          <AdminCombobox
            className="mt-1 block sm:min-w-[200px] sm:w-auto"
            value={tourId}
            onValueChange={setTourId}
            options={[
              { value: "", label: "All tours" },
              ...tours.map((tour) => ({ value: tour.id, label: tour.title })),
            ]}
          />
        </label>
        <Button
          type="button"
          variant="primary"
          size="md"
          className={adminToolbarButtonClass}
          onClick={() => void load()}
          disabled={loading}
        >
          Load
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          className={adminToolbarButtonClass}
          onClick={print}
          disabled={!rows.length}
        >
          Print
        </Button>
      </div>
      {msg ? <p className="text-sm text-red-600 print:hidden">{msg}</p> : null}
      <div className="overflow-x-auto rounded-sm border border-brand-border bg-white shadow-sm print:border-brand-border print:shadow-none">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-brand-border bg-brand-surface text-xs uppercase tracking-wide text-brand-muted print:bg-white">
            <tr>
              <th className="px-3 py-2">Ref</th>
              <th className="px-3 py-2">Guest</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Pickup</th>
              <th className="px-3 py-2">Guests</th>
              <th className="px-3 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.booking_reference} className="border-b border-brand-border">
                <td className="px-3 py-2 font-mono text-xs">{r.booking_reference}</td>
                <td className="px-3 py-2 text-brand-heading">
                  {r.customer_first_name} {r.customer_last_name}
                  <div className="text-xs text-brand-muted">{r.tour_title}</div>
                </td>
                <td className="px-3 py-2 text-brand-body">{r.customer_phone}</td>
                <td className="px-3 py-2 text-brand-body">
                  {r.pickup_location}
                  <div className="text-xs text-brand-muted">{r.pickup_time}</div>
                </td>
                <td className="px-3 py-2 text-brand-body">
                  {r.guest_total} ({r.adults}A/{r.children}C/{r.infants}I)
                </td>
                <td className="max-w-xs px-3 py-2 text-xs text-brand-body">{r.customer_notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && !loading ? (
          <p className="p-6 text-center text-sm text-brand-muted print:hidden">Load a date to see confirmed bookings.</p>
        ) : null}
      </div>
    </div>
  );
}
