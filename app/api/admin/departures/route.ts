import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { departureLocations } from "@/lib/db/schema";
import { setAdminOperationContext } from "@/lib/sentry/context";

const querySchema = z.object({
  tour_id: z.string().uuid(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ tour_id: searchParams.get("tour_id") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid query" }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "admin_departures_list",
    admin_user_id: session.user.id,
    tour_id: parsed.data.tour_id,
  });

  const rows = await db
    .select()
    .from(departureLocations)
    .where(eq(departureLocations.tourId, parsed.data.tour_id))
    .orderBy(asc(departureLocations.displayOrder), asc(departureLocations.name));

  return NextResponse.json(rows);
}
