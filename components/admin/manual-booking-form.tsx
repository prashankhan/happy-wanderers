"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

export interface TourOption {
  id: string;
  title: string;
}

export interface DepartureOption {
  id: string;
  tourId: string;
  name: string;
}

export interface ManualBookingFormProps {
  tours: TourOption[];
  departures: DepartureOption[];
}

export function ManualBookingForm({ tours, departures }: ManualBookingFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tourId, setTourId] = useState(tours[0]?.id ?? "");
  const [bookingDate, setBookingDate] = useState("");
  const [departureId, setDepartureId] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "paid">("paid");

  const depsForTour = useMemo(
    () => departures.filter((d) => d.tourId === tourId),
    [departures, tourId]
  );

  async function submit() {
    if (!tourId || !bookingDate || !departureId) {
      setMessage("Select tour, date, and departure.");
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/bookings/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tour_id: tourId,
          booking_date: bookingDate,
          departure_location_id: departureId,
          adults,
          children,
          infants,
          customer_first_name: customerFirstName,
          customer_last_name: customerLastName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_notes: customerNotes || null,
          payment_status: paymentStatus,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        booking_id?: string;
        booking_reference?: string;
      };
      if (!res.ok) {
        setMessage(data.message ?? "Failed");
        return;
      }
      setOpen(false);
      router.push(`/admin/bookings/${data.booking_id}`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (tours.length === 0) {
    return null;
  }

  return (
    <div>
      {!open ? (
        <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
          New manual booking
        </Button>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Manual confirmed booking</h2>
          <p className="mt-1 text-xs text-gray-500">
            Creates a confirmed booking, snapshots pricing, and sends confirmation emails.
          </p>
          {message ? <p className="mt-2 text-sm text-red-700">{message}</p> : null}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-xs font-medium text-gray-500">
              Tour
              <select
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={tourId}
                onChange={(e) => {
                  setTourId(e.target.value);
                  setDepartureId("");
                }}
              >
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-gray-500">
              Date
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </label>
            <label className="text-xs font-medium text-gray-500 md:col-span-2">
              Departure
              <select
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={departureId}
                onChange={(e) => setDepartureId(e.target.value)}
              >
                <option value="">Select…</option>
                {depsForTour.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-gray-500">
              Adults
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
              />
            </label>
            <label className="text-xs font-medium text-gray-500">
              Children
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
              />
            </label>
            <label className="text-xs font-medium text-gray-500">
              Infants
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={infants}
                onChange={(e) => setInfants(Number(e.target.value))}
              />
            </label>
            <label className="text-xs font-medium text-gray-500">
              Payment
              <select
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as "unpaid" | "paid")}
              >
                <option value="paid">Paid (offline)</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </label>
            <label className="text-xs font-medium text-gray-500">
              First name
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={customerFirstName}
                onChange={(e) => setCustomerFirstName(e.target.value)}
              />
            </label>
            <label className="text-xs font-medium text-gray-500">
              Last name
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={customerLastName}
                onChange={(e) => setCustomerLastName(e.target.value)}
              />
            </label>
            <label className="text-xs font-medium text-gray-500 md:col-span-2">
              Email
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </label>
            <label className="text-xs font-medium text-gray-500 md:col-span-2">
              Phone
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </label>
            <label className="text-xs font-medium text-gray-500 md:col-span-2">
              Notes
              <textarea
                className="mt-1 min-h-[64px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
              />
            </label>
          </div>
          <div className="mt-4 flex gap-3">
            <Button type="button" onClick={() => void submit()} disabled={pending}>
              Create booking
            </Button>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
