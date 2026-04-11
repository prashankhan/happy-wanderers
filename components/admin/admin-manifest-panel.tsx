"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

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
}

export function AdminManifestPanel({ tours }: AdminManifestPanelProps) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
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
      <div className="flex flex-wrap items-end gap-4 print:hidden">
        <label className="text-xs font-medium text-gray-500">
          Date
          <input
            type="date"
            className="mt-1 block rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="text-xs font-medium text-gray-500">
          Tour (optional)
          <select
            className="mt-1 block min-w-[200px] rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={tourId}
            onChange={(e) => setTourId(e.target.value)}
          >
            <option value="">All tours</option>
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        <Button type="button" onClick={() => void load()} disabled={loading}>
          Load
        </Button>
        <Button type="button" variant="secondary" onClick={print} disabled={!rows.length}>
          Print
        </Button>
      </div>
      {msg ? <p className="text-sm text-red-600 print:hidden">{msg}</p> : null}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm print:border-gray-400 print:shadow-none">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 print:bg-white">
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
              <tr key={r.booking_reference} className="border-b border-gray-100">
                <td className="px-3 py-2 font-mono text-xs">{r.booking_reference}</td>
                <td className="px-3 py-2 text-gray-800">
                  {r.customer_first_name} {r.customer_last_name}
                  <div className="text-xs text-gray-500">{r.tour_title}</div>
                </td>
                <td className="px-3 py-2 text-gray-700">{r.customer_phone}</td>
                <td className="px-3 py-2 text-gray-700">
                  {r.pickup_location}
                  <div className="text-xs text-gray-500">{r.pickup_time}</div>
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {r.guest_total} ({r.adults}A/{r.children}C/{r.infants}I)
                </td>
                <td className="max-w-xs px-3 py-2 text-xs text-gray-600">{r.customer_notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && !loading ? (
          <p className="p-6 text-center text-sm text-gray-500 print:hidden">Load a date to see confirmed bookings.</p>
        ) : null}
      </div>
    </div>
  );
}
