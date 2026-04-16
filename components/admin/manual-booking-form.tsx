"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Toast, useToast } from "@/components/admin/toast";

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
  const { toast, showToast, hideToast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
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

  function resetForm() {
    setTourId(tours[0]?.id ?? "");
    setBookingDate("");
    setDepartureId("");
    setAdults(2);
    setChildren(0);
    setInfants(0);
    setCustomerFirstName("");
    setCustomerLastName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerNotes("");
    setPaymentStatus("paid");
  }

  function handleClose() {
    resetForm();
    setOpen(false);
  }

  const depsForTour = useMemo(
    () => departures.filter((d) => d.tourId === tourId),
    [departures, tourId]
  );

  async function submit() {
    if (!tourId || !bookingDate || !departureId) {
      showToast("Select tour, date, and departure.", "error");
      return;
    }
    setPending(true);
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
        showToast(data.message ?? "Failed", "error");
        return;
      }
      showToast("Booking created successfully");
      handleClose();
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
        <div className="rounded-sm border border-brand-border bg-white p-6 shadow-sm">
          {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
          <h2 className="text-sm font-bold text-brand-heading">Manual confirmed booking</h2>
          <p className="mt-1 text-xs text-brand-muted">
            Creates a confirmed booking, snapshots pricing, and sends confirmation emails.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Tour</label>
              <select
                className="w-full rounded-sm border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
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
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Date</label>
              <input
                type="date"
                className="w-full rounded-sm border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Departure</label>
              <select
                className="w-full rounded-sm border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
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
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Adults</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-sm border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Children</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-sm border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Infants</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-sm border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                value={infants}
                onChange={(e) => setInfants(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Payment</label>
              <select
                className="w-full rounded-sm border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as "unpaid" | "paid")}
              >
                <option value="paid">Paid (offline)</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">First name</label>
              <input
                className="w-full rounded-sm border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                value={customerFirstName}
                onChange={(e) => setCustomerFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Last name</label>
              <input
                className="w-full rounded-sm border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                value={customerLastName}
                onChange={(e) => setCustomerLastName(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Email</label>
              <input
                type="email"
                className="w-full rounded-sm border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Phone</label>
              <input
                className="w-full rounded-sm border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Notes</label>
              <textarea
                className="min-h-[64px] w-full rounded-sm border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button type="button" onClick={() => void submit()} disabled={pending}>
              Create booking
            </Button>
            <Button type="button" variant="secondary" onClick={handleClose} disabled={pending}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
