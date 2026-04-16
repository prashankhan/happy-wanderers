import { NextResponse } from "next/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { setAdminOperationContext } from "@/lib/sentry/context";
import { bookings, tours } from "@/lib/db/schema";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  setAdminOperationContext({
    operation_type: "admin_bookings_list",
    admin_user_id: session.user.id,
    tour_id: searchParams.get("tour_id") ?? undefined,
    date: searchParams.get("date") ?? undefined,
  });
  const date = searchParams.get("date");
  const month = searchParams.get("month");
  const tourId = searchParams.get("tour_id");
  const status = searchParams.get("status");
  const email = searchParams.get("customer_email");

  const conditions = [];
  if (date) conditions.push(sql`${bookings.bookingDate}::text = ${date}`);
  if (month) {
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;
    conditions.push(sql`${bookings.bookingDate}::text >= ${startDate}`);
    conditions.push(sql`${bookings.bookingDate}::text <= ${endDate}`);
  }
  if (tourId) conditions.push(eq(bookings.tourId, tourId));
  if (status) conditions.push(eq(bookings.status, status));
  if (email) conditions.push(eq(bookings.customerEmail, email));

  const rows = await db
    .select({
      booking: bookings,
      tourTitle: tours.title,
    })
    .from(bookings)
    .leftJoin(tours, eq(bookings.tourId, tours.id))
    .where(conditions.length ? and(...conditions) : sql`true`)
    .orderBy(desc(bookings.createdAt))
    .limit(500);

  return NextResponse.json(rows);
}
