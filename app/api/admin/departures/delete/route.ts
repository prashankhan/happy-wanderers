import { NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { departureLocations } from "@/lib/db/schema";
import { countBookingsForDeparture, reconcileDepartureDefaultsForTour } from "@/lib/services/admin-departures";
import { setAdminOperationContext } from "@/lib/sentry/context";

const querySchema = z.object({
  id: z.string().uuid(),
});

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ id: searchParams.get("id") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid query" }, { status: 400 });
  }

  const existingRows = await db
    .select()
    .from(departureLocations)
    .where(eq(departureLocations.id, parsed.data.id))
    .limit(1);
  const existing = existingRows[0];
  if (!existing) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const tourId = existing.tourId;

  const [totalRow] = await db
    .select({ c: count() })
    .from(departureLocations)
    .where(eq(departureLocations.tourId, tourId));
  if (Number(totalRow?.c ?? 0) <= 1) {
    return NextResponse.json(
      { success: false, message: "Cannot delete the only pickup for this tour." },
      { status: 400 }
    );
  }

  const bookingCount = await countBookingsForDeparture(parsed.data.id);
  if (bookingCount > 0) {
    return NextResponse.json(
      {
        success: false,
        message:
          "This pickup is used by existing bookings and cannot be deleted. Deactivate it instead so new bookings cannot select it.",
      },
      { status: 400 }
    );
  }

  setAdminOperationContext({
    operation_type: "admin_departures_delete",
    admin_user_id: session.user.id,
    tour_id: tourId,
  });

  const deleted = await db.delete(departureLocations).where(eq(departureLocations.id, parsed.data.id)).returning({
    id: departureLocations.id,
  });
  if (!deleted[0]) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  await reconcileDepartureDefaultsForTour(tourId);

  return NextResponse.json({ success: true });
}
