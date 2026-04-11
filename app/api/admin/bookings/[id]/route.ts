import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { setAdminOperationContext } from "@/lib/sentry/context";
import { bookingActivityLog, bookings } from "@/lib/db/schema";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  setAdminOperationContext({
    operation_type: "admin_booking_detail",
    admin_user_id: session.user.id,
    booking_id: id,
  });

  const rows = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  const booking = rows[0];
  if (!booking) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const log = await db
    .select()
    .from(bookingActivityLog)
    .where(eq(bookingActivityLog.bookingId, id))
    .orderBy(desc(bookingActivityLog.createdAt));

  return NextResponse.json({ booking, activity: log });
}
