import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";

export async function getManifestRows(filters: { tourId?: string; date: string }) {
  const conditions = [
    eq(bookings.status, "confirmed"),
    sql`${bookings.tourStartDate}::text <= ${filters.date}`,
    sql`${bookings.tourEndDate}::text >= ${filters.date}`,
  ];
  if (filters.tourId) conditions.push(eq(bookings.tourId, filters.tourId));

  return db
    .select({
      bookingReference: bookings.bookingReference,
      customerFirstName: bookings.customerFirstName,
      customerLastName: bookings.customerLastName,
      customerPhone: bookings.customerPhone,
      pickupLocationNameSnapshot: bookings.pickupLocationNameSnapshot,
      pickupTimeSnapshot: bookings.pickupTimeSnapshot,
      adults: bookings.adults,
      children: bookings.children,
      infants: bookings.infants,
      guestTotal: bookings.guestTotal,
      customerNotes: bookings.customerNotes,
      tourTitleSnapshot: bookings.tourTitleSnapshot,
    })
    .from(bookings)
    .where(and(...conditions))
    .orderBy(asc(bookings.pickupTimeSnapshot), asc(bookings.pickupLocationNameSnapshot));
}
