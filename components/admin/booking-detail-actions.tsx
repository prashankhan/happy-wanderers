"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export interface BookingDetailActionsProps {
  bookingId: string;
  status: string;
  paymentStatus: string;
  hasStripePayment: boolean;
  role: "admin" | "staff";
  initial: {
    adults: number;
    children: number;
    infants: number;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhone: string;
    customerNotes: string | null;
    internalNotes: string | null;
    departureLocationId: string;
  };
  departures: { id: string; name: string }[];
}

export function BookingDetailActions({
  bookingId,
  status,
  paymentStatus,
  hasStripePayment,
  role,
  initial,
  departures,
}: BookingDetailActionsProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState(initial);

  async function patchUpdate(body: Record<string, unknown>) {
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/bookings/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, ...body }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok) {
        setMessage(data.message ?? "Request failed");
        return;
      }
      setMessage("Saved.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function saveDetails() {
    await patchUpdate({
      adults: form.adults,
      children: form.children,
      infants: form.infants,
      customer_first_name: form.customerFirstName,
      customer_last_name: form.customerLastName,
      customer_email: form.customerEmail,
      customer_phone: form.customerPhone,
      customer_notes: form.customerNotes,
      ...(role === "admin" ? { internal_notes: form.internalNotes } : {}),
      ...(role === "admin" ? { departure_location_id: form.departureLocationId } : {}),
    });
  }

  async function cancelBooking() {
    if (!confirm("Cancel this booking?")) return;
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/bookings/cancel", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok) {
        setMessage(data.message ?? "Request failed");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function refundBooking() {
    if (!confirm("Issue a Stripe refund? Final state syncs from webhooks.")) return;
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/bookings/refund", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok) {
        setMessage(data.message ?? "Request failed");
        return;
      }
      setMessage("Refund initiated.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const canEditLifecycle = status === "confirmed" || status === "pending";
  const showAdminActions = role === "admin" && canEditLifecycle;

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900">Edit booking</h2>
      {message ? <p className="text-sm text-gray-600">{message}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-xs font-medium text-gray-500">
          Adults
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.adults}
            onChange={(e) => setForm((f) => ({ ...f, adults: Number(e.target.value) }))}
            disabled={!canEditLifecycle || pending}
          />
        </label>
        <label className="block text-xs font-medium text-gray-500">
          Children
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.children}
            onChange={(e) => setForm((f) => ({ ...f, children: Number(e.target.value) }))}
            disabled={!canEditLifecycle || pending}
          />
        </label>
        <label className="block text-xs font-medium text-gray-500">
          Infants
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.infants}
            onChange={(e) => setForm((f) => ({ ...f, infants: Number(e.target.value) }))}
            disabled={!canEditLifecycle || pending}
          />
        </label>
        {role === "admin" ? (
          <label className="block text-xs font-medium text-gray-500 md:col-span-2">
            Departure pickup
            <select
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={form.departureLocationId}
              onChange={(e) => setForm((f) => ({ ...f, departureLocationId: e.target.value }))}
              disabled={!canEditLifecycle || pending}
            >
              {departures.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block text-xs font-medium text-gray-500">
          First name
          <input
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.customerFirstName}
            onChange={(e) => setForm((f) => ({ ...f, customerFirstName: e.target.value }))}
            disabled={pending}
          />
        </label>
        <label className="block text-xs font-medium text-gray-500">
          Last name
          <input
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.customerLastName}
            onChange={(e) => setForm((f) => ({ ...f, customerLastName: e.target.value }))}
            disabled={pending}
          />
        </label>
        <label className="block text-xs font-medium text-gray-500 md:col-span-2">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.customerEmail}
            onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
            disabled={pending}
          />
        </label>
        <label className="block text-xs font-medium text-gray-500 md:col-span-2">
          Phone
          <input
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.customerPhone}
            onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
            disabled={pending}
          />
        </label>
        <label className="block text-xs font-medium text-gray-500 md:col-span-2">
          Customer notes
          <textarea
            className="mt-1 min-h-[72px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.customerNotes ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, customerNotes: e.target.value || null }))}
            disabled={pending}
          />
        </label>
        {role === "admin" ? (
          <label className="block text-xs font-medium text-gray-500 md:col-span-2">
            Internal notes
            <textarea
              className="mt-1 min-h-[72px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={form.internalNotes ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, internalNotes: e.target.value || null }))}
              disabled={pending}
            />
          </label>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => void saveDetails()} disabled={pending || !canEditLifecycle}>
          Save changes
        </Button>
        {showAdminActions ? (
          <>
            <Button type="button" variant="danger" onClick={() => void cancelBooking()} disabled={pending}>
              Cancel booking
            </Button>
            {paymentStatus === "paid" && hasStripePayment ? (
              <Button type="button" variant="secondary" onClick={() => void refundBooking()} disabled={pending}>
                Refund via Stripe
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
      <p className="text-xs text-gray-500">
        Status {status} · Payment {paymentStatus}. Refunds update rows when Stripe sends{" "}
        <code className="rounded bg-gray-100 px-1">charge.refunded</code>.
      </p>
    </div>
  );
}
