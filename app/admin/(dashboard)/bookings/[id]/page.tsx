import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { BookingDetailActions } from "@/components/admin/booking-detail-actions";
import { db } from "@/lib/db";
import { bookingActivityLog, bookings, departureLocations } from "@/lib/db/schema";

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const role = session?.user?.role === "admin" ? "admin" : "staff";

  const rows = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  const b = rows[0];
  if (!b) notFound();

  const log = await db
    .select()
    .from(bookingActivityLog)
    .where(eq(bookingActivityLog.bookingId, id))
    .orderBy(desc(bookingActivityLog.createdAt));

  const locs = await db
    .select({ id: departureLocations.id, name: departureLocations.name })
    .from(departureLocations)
    .where(and(eq(departureLocations.tourId, b.tourId), eq(departureLocations.isActive, true)))
    .orderBy(departureLocations.displayOrder);

  return (
    <div className="space-y-8">
      <Link href="/admin/bookings" className="text-sm text-blue-900 hover:underline">
        ← Bookings
      </Link>
      <div>
        <h1 className="font-serif text-3xl font-semibold">{b.bookingReference}</h1>
        <p className="text-sm text-gray-600">
          {b.status} · {b.paymentStatus}
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Customer</h2>
          <p className="mt-2 text-sm text-gray-600">
            {b.customerFirstName} {b.customerLastName}
            <br />
            {b.customerEmail}
            <br />
            {b.customerPhone}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Snapshots</h2>
          <p className="mt-2 text-sm text-gray-600">
            {b.tourTitleSnapshot}
            <br />
            {String(b.bookingDate)} · {b.pickupLocationNameSnapshot} @ {b.pickupTimeSnapshot}
            <br />
            Guests {b.guestTotal} ({b.adults}A/{b.children}C/{b.infants}I)
            <br />
            Total {b.currency} {b.totalPriceSnapshot}
          </p>
        </div>
      </div>

      <BookingDetailActions
        bookingId={b.id}
        status={b.status}
        paymentStatus={b.paymentStatus}
        hasStripePayment={Boolean(b.stripePaymentIntentId)}
        role={role}
        initial={{
          adults: b.adults,
          children: b.children,
          infants: b.infants,
          customerFirstName: b.customerFirstName,
          customerLastName: b.customerLastName,
          customerEmail: b.customerEmail,
          customerPhone: b.customerPhone,
          customerNotes: b.customerNotes,
          internalNotes: b.internalNotes,
          departureLocationId: b.departureLocationId,
        }}
        departures={locs}
      />

      <div>
        <h2 className="text-sm font-semibold text-gray-900">Activity</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          {log.map((entry) => (
            <li key={entry.id}>
              <span className="font-medium">{entry.actionType}</span> · {entry.performedBy} ·{" "}
              {entry.createdAt.toISOString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
