"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AdminCombobox } from "@/components/admin/admin-combobox";
import { adminFieldClass, adminTextareaClass } from "@/components/admin/form-field-styles";
import { Button } from "@/components/ui/button";
import { Toast, useToast } from "@/components/admin/toast";
import { calendarDateTodayInTimeZone } from "@/lib/utils/dates";

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
  businessTimezone: string;
}

export function ManualBookingForm({ tours, departures, businessTimezone }: ManualBookingFormProps) {
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
  
  const today = calendarDateTodayInTimeZone(businessTimezone);

  function isValidDate(dateStr: string): boolean {
    return dateStr >= today;
  }

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

  function handleOpenChange(openState: boolean) {
    if (!openState) {
      resetForm();
    }
    setOpen(openState);
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
    if (!customerFirstName.trim() || !customerLastName.trim() || !customerEmail.trim()) {
      showToast("First name, last name, and email are required.", "error");
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
      setTimeout(() => {
        handleOpenChange(false);
        router.push(`/admin/bookings/${data.booking_id}`);
        router.refresh();
      }, 1000);
    } finally {
      setPending(false);
    }
  }

  if (tours.length === 0) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button type="button" variant="secondary" size="sm">
          New manual booking
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-sm border border-brand-border bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold text-brand-heading">New manual booking</Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-brand-muted">
            Creates a confirmed booking, snapshots pricing, and sends confirmation emails.
          </Dialog.Description>

          {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Tour <span className="text-red-500">*</span>
                </label>
                <AdminCombobox
                  className={adminFieldClass}
                  value={tourId}
                  onValueChange={(nextTourId) => {
                    setTourId(nextTourId);
                    setDepartureId("");
                  }}
                  options={tours.map((tour) => ({ value: tour.id, label: tour.title }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={today}
                  className={adminFieldClass}
                  value={bookingDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    if (isValidDate(newDate)) {
                      setBookingDate(newDate);
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">
                Departure <span className="text-red-500">*</span>
              </label>
              <AdminCombobox
                className={adminFieldClass}
                value={departureId}
                onValueChange={setDepartureId}
                options={[
                  { value: "", label: "Select..." },
                  ...depsForTour.map((departure) => ({ value: departure.id, label: departure.name })),
                ]}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">Adults</label>
                <input
                  type="number"
                  min={1}
                  className={adminFieldClass}
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">Children</label>
                <input
                  type="number"
                  min={0}
                  className={adminFieldClass}
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">Infants</label>
                <input
                  type="number"
                  min={0}
                  className={adminFieldClass}
                  value={infants}
                  onChange={(e) => setInfants(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Payment</label>
              <AdminCombobox
                className={adminFieldClass}
                value={paymentStatus}
                onValueChange={(nextStatus) => setPaymentStatus(nextStatus as "unpaid" | "paid")}
                options={[
                  { value: "paid", label: "Paid (offline)" },
                  { value: "unpaid", label: "Unpaid" },
                ]}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  className={adminFieldClass}
                  value={customerFirstName}
                  onChange={(e) => setCustomerFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  className={adminFieldClass}
                  value={customerLastName}
                  onChange={(e) => setCustomerLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={adminFieldClass}
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Phone</label>
              <input
                className={adminFieldClass}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Notes</label>
              <textarea
                className={`${adminTextareaClass} min-h-[64px]`}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button type="button" variant="secondary" size="sm" disabled={pending}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="button" variant="primary" size="sm" onClick={() => void submit()} disabled={pending}>
              {pending ? "Creating…" : "Create booking"}
            </Button>
          </div>

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
  );
}
