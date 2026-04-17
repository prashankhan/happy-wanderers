import Link from "next/link";
import { Suspense } from "react";
import { and, asc, count, desc, eq, ilike, isNull, sql } from "drizzle-orm";

import { AdminBookingsFilters } from "@/components/admin/admin-bookings-filters";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/admin/booking-status-badge";
import { ManualBookingForm } from "@/components/admin/manual-booking-form";
import { Pagination } from "@/components/admin/pagination";
import { db } from "@/lib/db";
import { bookings, departureLocations, tours } from "@/lib/db/schema";
import { getSystemSettings } from "@/lib/services/system-settings";
import { DEFAULT_TZ } from "@/lib/utils/dates";

const PAGE_SIZE = 20;

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const date = typeof sp.date === "string" ? sp.date : "";
  const statusRaw = typeof sp.status === "string" ? sp.status : "";
  const customerEmail = typeof sp.customer_email === "string" ? sp.customer_email.trim() : "";
  const tourId = typeof sp.tour_id === "string" ? sp.tour_id : "";
  const pageRaw = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;
  const page = isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
  const offset = (page - 1) * PAGE_SIZE;

  const bookingStatuses = [
    "pending",
    "confirmed",
    "failed",
    "expired",
    "cancelled",
    "refunded",
  ] as const;
  const status = bookingStatuses.includes(statusRaw as (typeof bookingStatuses)[number])
    ? statusRaw
    : "";

  const conditions = [];
  if (date) conditions.push(sql`${bookings.bookingDate}::text = ${date}`);
  if (status) conditions.push(eq(bookings.status, status));
  if (customerEmail) conditions.push(ilike(bookings.customerEmail, `%${customerEmail}%`));
  if (tourId) conditions.push(eq(bookings.tourId, tourId));

  const whereClause = conditions.length ? and(...conditions) : sql`true`;

  const [countResult] = await db
    .select({ count: count() })
    .from(bookings)
    .where(whereClause);

  const totalCount = countResult?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const rows = await db
    .select({
      booking: bookings,
      tourTitle: tours.title,
    })
    .from(bookings)
    .leftJoin(tours, eq(bookings.tourId, tours.id))
    .where(whereClause)
    .orderBy(desc(bookings.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  const tourRows = await db
    .select({ id: tours.id, title: tours.title })
    .from(tours)
    .where(isNull(tours.deletedAt))
    .orderBy(asc(tours.title));

  const depRows = await db
    .select({
      id: departureLocations.id,
      tourId: departureLocations.tourId,
      name: departureLocations.name,
    })
    .from(departureLocations)
    .where(eq(departureLocations.isActive, true))
    .orderBy(departureLocations.displayOrder);

  const settings = await getSystemSettings();
  const businessTimezone = settings.timezone?.trim() || DEFAULT_TZ;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-heading">Bookings</h1>
          <p className="mt-1 text-sm text-brand-muted">Filter and drill into lifecycle, snapshots, and activity.</p>
        </div>
        <ManualBookingForm tours={tourRows} departures={depRows} businessTimezone={businessTimezone} />
      </div>

      <AdminBookingsFilters
        date={date}
        status={status}
        customerEmail={customerEmail}
        tourId={tourId}
        tours={tourRows}
      />

      <div className="overflow-x-auto rounded-sm border border-brand-border bg-white shadow-sm">
        {rows.length > 0 && (
          <div className="border-b border-brand-border px-4 py-2 text-xs text-brand-muted">
            Showing {offset + 1}-{Math.min(offset + rows.length, totalCount)} of {totalCount} booking{totalCount !== 1 ? "s" : ""}
          </div>
        )}
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-brand-border bg-brand-surface text-xs font-bold uppercase tracking-normal text-brand-muted">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Tour</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Guests</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ booking, tourTitle }) => (
              <tr key={booking.id} className="border-b border-brand-border/50 hover:bg-brand-surface-soft">
                <td className="px-4 py-3 font-mono text-xs text-brand-heading">{booking.bookingReference}</td>
                <td className="px-4 py-3 text-brand-body">{tourTitle}</td>
                <td className="px-4 py-3 text-brand-body">{String(booking.bookingDate)}</td>
                <td className="px-4 py-3 text-brand-body">{booking.guestTotal}</td>
                <td className="px-4 py-3">
                  <BookingStatusBadge status={booking.status as "pending" | "confirmed" | "failed" | "expired" | "cancelled" | "refunded"} />
                </td>
                <td className="px-4 py-3">
                  <PaymentStatusBadge status={booking.paymentStatus} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/bookings/${booking.id}`} className="text-brand-primary hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="p-8 text-center text-sm text-brand-muted">
            No bookings found.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center py-4">
          <Suspense fallback={<div className="h-8" aria-hidden />}>
            <Pagination currentPage={page} totalPages={totalPages} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
