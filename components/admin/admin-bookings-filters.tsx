"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminCombobox } from "@/components/admin/admin-combobox";
import { adminFieldBaseClass, adminFieldClass } from "@/components/admin/form-field-styles";
import { Button } from "@/components/ui/button";

export interface AdminBookingsFiltersProps {
  date: string;
  status: string;
  tourId: string;
  customerEmail: string;
  tours: Array<{ id: string; title: string }>;
}

export function AdminBookingsFilters({
  date,
  status,
  tourId,
  customerEmail,
  tours,
}: AdminBookingsFiltersProps) {
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [selectedTourId, setSelectedTourId] = useState(tourId);
  const [selectedDate, setSelectedDate] = useState(date);
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState(customerEmail);

  const filterQuery = useMemo(() => {
    const qs = new URLSearchParams();
    if (selectedDate) qs.set("date", selectedDate);
    if (selectedStatus) qs.set("status", selectedStatus);
    if (selectedCustomerEmail) qs.set("customer_email", selectedCustomerEmail);
    if (selectedTourId) qs.set("tour_id", selectedTourId);
    return qs.toString();
  }, [selectedCustomerEmail, selectedDate, selectedStatus, selectedTourId]);

  return (
    <form
      method="get"
      className="flex flex-wrap items-end gap-3 rounded-sm border border-brand-border bg-white p-4 text-sm shadow-sm"
      action="/admin/bookings"
    >
      <input type="hidden" name="page" value="1" />
      <label className="text-xs font-medium text-brand-muted">
        Date
        <input
          type="date"
          name="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={`mt-1 block ${adminFieldClass}`}
        />
      </label>
      <label className="text-xs font-medium text-brand-muted">
        Status
        <AdminCombobox
          name="status"
          className="mt-1 block"
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          options={[
            { value: "", label: "Any" },
            { value: "pending", label: "pending" },
            { value: "confirmed", label: "confirmed" },
            { value: "failed", label: "failed" },
            { value: "expired", label: "expired" },
            { value: "cancelled", label: "cancelled" },
            { value: "refunded", label: "refunded" },
          ]}
        />
      </label>
      <label className="text-xs font-medium text-brand-muted">
        Tour
        <AdminCombobox
          name="tour_id"
          className="mt-1 block w-full min-w-[160px]"
          value={selectedTourId}
          onValueChange={setSelectedTourId}
          options={[
            { value: "", label: "Any" },
            ...tours.map((tour) => ({ value: tour.id, label: tour.title })),
          ]}
        />
      </label>
      <label className="text-xs font-medium text-brand-muted">
        Customer email
        <input
          type="search"
          name="customer_email"
          value={selectedCustomerEmail}
          onChange={(e) => setSelectedCustomerEmail(e.target.value)}
          placeholder="Contains…"
          className={`mt-1 block w-48 ${adminFieldBaseClass}`}
        />
      </label>
      <Button type="submit" size="sm" className="h-12 text-base font-bold">
        Apply
      </Button>
      {filterQuery ? (
        <Button asChild type="button" variant="secondary" size="sm" className="h-12 text-base font-bold">
          <Link href="/admin/bookings">
            Clear filters
          </Link>
        </Button>
      ) : null}
    </form>
  );
}
