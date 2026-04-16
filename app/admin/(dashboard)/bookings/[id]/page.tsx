import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/admin/booking-status-badge";
import { BookingDetailActions } from "@/components/admin/booking-detail-actions";
import { db } from "@/lib/db";
import { bookingActivityLog, bookings, departureLocations } from "@/lib/db/schema";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

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
      <Link href="/admin/bookings" className="text-sm text-brand-primary hover:underline">
        ← Bookings
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-brand-heading">{b.bookingReference}</h1>
        <div className="mt-1 flex items-center gap-2">
          <BookingStatusBadge status={b.status as "pending" | "confirmed" | "failed" | "expired" | "cancelled" | "refunded"} />
          <span className="text-brand-muted">·</span>
          <PaymentStatusBadge status={b.paymentStatus} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-sm border border-brand-border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-brand-heading">Customer</h2>
          <p className="mt-2 text-sm text-brand-body">
            {b.customerFirstName} {b.customerLastName}
            <br />
            {b.customerEmail}
            <br />
            {b.customerPhone}
          </p>
        </div>
        <div className="rounded-sm border border-brand-border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-brand-heading">Snapshots</h2>
          <p className="mt-2 text-sm text-brand-body">
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
        <h2 className="text-sm font-bold text-brand-heading">Activity</h2>
        {log.length === 0 ? (
          <p className="mt-3 text-sm text-brand-muted">No activity recorded.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-brand-body">
            {log.map((entry) => (
              <li key={entry.id}>
                <span className="font-medium">{entry.actionType}</span> · {entry.performedBy} ·{" "}
                {formatDate(entry.createdAt)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
