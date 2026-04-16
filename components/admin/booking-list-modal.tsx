"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";

interface Booking {
  booking: {
    id: string;
    bookingReference: string;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhone: string | null;
    status: string;
    guestTotal: number;
    adults: number;
    children: number;
    infants: number;
    totalPriceSnapshot: string;
    bookingDate: string;
    createdAt: string;
  };
  tourTitle: string | null;
}

interface BookingListModalProps {
  tourId: string;
  date: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingListModal({ tourId, date, open, onOpenChange }: BookingListModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAllTours = tourId === "all";

  useEffect(() => {
    if (!open || !date) return;

    async function fetchBookings() {
      setLoading(true);
      setError(null);
      try {
        const url = isAllTours
          ? `/api/admin/bookings?date=${encodeURIComponent(date)}`
          : `/api/admin/bookings?tour_id=${encodeURIComponent(tourId)}&date=${encodeURIComponent(date)}`;
        const res = await fetch(url);
        if (!res.ok) {
          setError("Failed to load bookings");
          return;
        }
        const data = await res.json();
        setBookings(data);
      } catch {
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }

    void fetchBookings();
  }, [open, tourId, date, isAllTours]);

  const groupedBookings = useMemo(() => {
    if (!isAllTours) return null;
    const groups: Record<string, Booking[]> = {};
    bookings.forEach((b) => {
      const tour = b.tourTitle ?? "Unknown Tour";
      if (!groups[tour]) groups[tour] = [];
      groups[tour].push(b);
    });
    return groups;
  }, [bookings, isAllTours]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-sm border border-brand-border bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-brand-heading">
            Bookings for {formatDate(date)}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-brand-muted">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} for this day · Click to view details
          </Dialog.Description>

          <div className="mt-4 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-border border-t-brand-primary" />
              </div>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : bookings.length === 0 ? (
              <p className="py-8 text-center text-sm text-brand-muted">No bookings for this day.</p>
            ) : isAllTours && groupedBookings ? (
              <div className="space-y-4">
                {Object.entries(groupedBookings).map(([tourName, tourBookings]) => (
                  <div key={tourName}>
                    <h4 className="mb-2 text-xs font-semibold text-brand-heading">{tourName}</h4>
                    <div className="space-y-2">
                      {tourBookings.map((item) => (
                        <Link
                          key={item.booking.id}
                          href={`/admin/bookings/${item.booking.id}`}
                          className="flex items-center justify-between rounded-sm border border-brand-border p-3 transition-colors hover:border-brand-primary hover:bg-brand-surface"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-brand-heading">
                                {item.booking.customerFirstName} {item.booking.customerLastName}
                              </span>
                              <StatusBadge status={item.booking.status} />
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
                              <span>{item.booking.customerEmail}</span>
                              {item.booking.customerPhone && <span>{item.booking.customerPhone}</span>}
                              <span>
                                {item.booking.guestTotal} guest{item.booking.guestTotal !== 1 ? "s" : ""} ({item.booking.adults}A
                                {item.booking.children > 0 ? `/${item.booking.children}C` : ""}
                                {item.booking.infants > 0 ? `/${item.booking.infants}I` : ""})
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-brand-muted">
                              Ref: <span className="font-mono">{item.booking.bookingReference}</span>
                            </div>
                          </div>
                          <div className="ml-4 flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-brand-heading">
                                ${Number(item.booking.totalPriceSnapshot).toFixed(2)}
                              </p>
                              <p className="text-xs text-brand-muted">{formatTime(item.booking.createdAt)}</p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-muted">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {bookings.map((item) => (
                  <Link
                    key={item.booking.id}
                    href={`/admin/bookings/${item.booking.id}`}
                    className="flex items-center justify-between rounded-sm border border-brand-border p-3 transition-colors hover:border-brand-primary hover:bg-brand-surface"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-brand-heading">
                          {item.booking.customerFirstName} {item.booking.customerLastName}
                        </span>
                        <StatusBadge status={item.booking.status} />
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
                        <span>{item.booking.customerEmail}</span>
                        {item.booking.customerPhone && <span>{item.booking.customerPhone}</span>}
                        <span>
                          {item.booking.guestTotal} guest{item.booking.guestTotal !== 1 ? "s" : ""} ({item.booking.adults}A
                          {item.booking.children > 0 ? `/${item.booking.children}C` : ""}
                          {item.booking.infants > 0 ? `/${item.booking.infants}I` : ""})
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-brand-muted">
                        Ref: <span className="font-mono">{item.booking.bookingReference}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-brand-heading">
                          ${Number(item.booking.totalPriceSnapshot).toFixed(2)}
                        </p>
                        <p className="text-xs text-brand-muted">{formatTime(item.booking.createdAt)}</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-muted">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Dialog.Close asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </Dialog.Close>
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
