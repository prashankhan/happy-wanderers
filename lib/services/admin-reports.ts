import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";

export async function reportBookingTotals(input: {
  from: string;
  to: string;
  tourId?: string;
  status?: string;
}) {
  const status = input.status ?? "confirmed";
  const conditions = [
    sql`${bookings.bookingDate}::text >= ${input.from}`,
    sql`${bookings.bookingDate}::text <= ${input.to}`,
    eq(bookings.status, status),
  ];
  if (input.tourId) conditions.push(eq(bookings.tourId, input.tourId));

  const rows = await db
    .select({
      count: sql<number>`count(*)::int`,
      guestSum: sql<number>`coalesce(sum(${bookings.guestTotal}), 0)::int`,
      revenue: sql<string>`coalesce(sum(${bookings.totalPriceSnapshot}), 0)::text`,
    })
    .from(bookings)
    .where(and(...conditions));

  return rows[0] ?? { count: 0, guestSum: 0, revenue: "0" };
}

export async function reportRevenueByDay(input: { from: string; to: string }) {
  return db
    .select({
      day: sql<string>`${bookings.bookingDate}::text`,
      revenue: sql<string>`coalesce(sum(${bookings.totalPriceSnapshot}), 0)::text`,
      bookings: sql<number>`count(*)::int`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "confirmed"),
        sql`${bookings.bookingDate}::text >= ${input.from}`,
        sql`${bookings.bookingDate}::text <= ${input.to}`
      )
    )
    .groupBy(bookings.bookingDate)
    .orderBy(bookings.bookingDate);
}

export async function reportTourPerformance(input: { from: string; to: string }) {
  return db
    .select({
      tourId: bookings.tourId,
      tourTitle: bookings.tourTitleSnapshot,
      bookings: sql<number>`count(*)::int`,
      guests: sql<number>`coalesce(sum(${bookings.guestTotal}), 0)::int`,
      revenue: sql<string>`coalesce(sum(${bookings.totalPriceSnapshot}), 0)::text`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "confirmed"),
        sql`${bookings.bookingDate}::text >= ${input.from}`,
        sql`${bookings.bookingDate}::text <= ${input.to}`
      )
    )
    .groupBy(bookings.tourId, bookings.tourTitleSnapshot)
    .orderBy(desc(sql`coalesce(sum(${bookings.totalPriceSnapshot}), 0)`));
}
