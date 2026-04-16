import Link from "next/link";
import { and, asc, desc, eq, ilike, isNull, sql } from "drizzle-orm";

import { BookingStatusBadge, PaymentStatusBadge } from "@/components/admin/booking-status-badge";
import { ManualBookingForm } from "@/components/admin/manual-booking-form";
import { db } from "@/lib/db";
import { bookings, departureLocations, tours } from "@/lib/db/schema";

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

  const rows = await db
    .select({
      booking: bookings,
      tourTitle: tours.title,
    })
    .from(bookings)
    .leftJoin(tours, eq(bookings.tourId, tours.id))
    .where(conditions.length ? and(...conditions) : sql`true`)
    .orderBy(desc(bookings.createdAt))
    .limit(100);

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

  const qs = new URLSearchParams();
  if (date) qs.set("date", date);
  if (status) qs.set("status", status);
  if (customerEmail) qs.set("customer_email", customerEmail);
  if (tourId) qs.set("tour_id", tourId);
  const filterQuery = qs.toString();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-heading">Bookings</h1>
          <p className="mt-1 text-sm text-brand-muted">Filter and drill into lifecycle, snapshots, and activity.</p>
        </div>
        <ManualBookingForm tours={tourRows} departures={depRows} />
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-sm border border-brand-border bg-white p-4 text-sm shadow-sm"
        action="/admin/bookings"
      >
        <label className="text-xs font-medium text-brand-muted">
          Date
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="mt-1 block w-full rounded-sm border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
          />
        </label>
        <label className="text-xs font-medium text-brand-muted">
          Status
          <select name="status" defaultValue={status} className="mt-1 block w-full rounded-sm border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10">
            <option value="">Any</option>
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="failed">failed</option>
            <option value="expired">expired</option>
            <option value="cancelled">cancelled</option>
            <option value="refunded">refunded</option>
          </select>
        </label>
        <label className="text-xs font-medium text-brand-muted">
          Tour
          <select name="tour_id" defaultValue={tourId} className="mt-1 block w-full min-w-[160px] rounded-sm border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10">
            <option value="">Any</option>
            {tourRows.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-brand-muted">
          Customer email
          <input
            type="search"
            name="customer_email"
            defaultValue={customerEmail}
            placeholder="Contains…"
            className="mt-1 block w-48 rounded-sm border border-brand-border bg-white px-3 py-2 text-sm font-medium text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
          />
        </label>
        <button type="submit" className="rounded-sm bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-brand-primary-hover">
          Apply
        </button>
        {filterQuery ? (
          <Link href="/admin/bookings" className="text-xs text-brand-primary underline">
            Clear
          </Link>
        ) : null}
      </form>

      <div className="overflow-x-auto rounded-sm border border-brand-border bg-white shadow-sm">
        {rows.length > 0 && (
          <div className="border-b border-brand-border px-4 py-2 text-xs text-brand-muted">
            Showing {rows.length} booking{rows.length !== 1 ? "s" : ""}
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
    </div>
  );
}
