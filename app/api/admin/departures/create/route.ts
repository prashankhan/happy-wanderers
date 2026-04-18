import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { departureLocations } from "@/lib/db/schema";
import {
  clearDefaultExcept,
  nextDepartureDisplayOrder,
  reconcileDepartureDefaultsForTour,
} from "@/lib/services/admin-departures";
import { setAdminOperationContext } from "@/lib/sentry/context";
import { zodErrorToApiMessage } from "@/lib/utils/zod-api-message";

const pickupTimeRe = /^([01]\d|2[0-3]):[0-5]\d$/;

const bodySchema = z.object({
  tour_id: z.string().uuid(),
  name: z.string().min(1),
  pickup_time: z.string().regex(pickupTimeRe, "Pickup time must be HH:mm (24h), e.g. 07:30"),
  pickup_time_label: z.string().nullable().optional(),
  price_adjustment_type: z.enum(["none", "fixed", "percentage"]),
  price_adjustment_value: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, "Adjustment value must be a non-negative number"),
  google_maps_link: z.string().max(2048).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: zodErrorToApiMessage(parsed.error) },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const isActive = d.is_active ?? true;
  const isDefault = d.is_default ?? false;
  const displayOrder = d.display_order ?? (await nextDepartureDisplayOrder(d.tour_id));

  setAdminOperationContext({
    operation_type: "admin_departures_create",
    admin_user_id: session.user.id,
    tour_id: d.tour_id,
  });

  const [row] = await db
    .insert(departureLocations)
    .values({
      tourId: d.tour_id,
      name: d.name.trim(),
      pickupTime: d.pickup_time,
      pickupTimeLabel: d.pickup_time_label?.trim() || null,
      priceAdjustmentType: d.price_adjustment_type,
      priceAdjustmentValue:
        d.price_adjustment_type === "none" ? "0" : d.price_adjustment_value,
      googleMapsLink: d.google_maps_link?.trim() ? d.google_maps_link.trim() : null,
      notes: d.notes?.trim() ? d.notes.trim() : null,
      isDefault,
      isActive,
      displayOrder,
    })
    .returning();

  if (!row) {
    return NextResponse.json({ success: false, message: "Insert failed" }, { status: 500 });
  }

  if (isDefault) {
    await clearDefaultExcept(d.tour_id, row.id);
    await db
      .update(departureLocations)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(departureLocations.id, row.id));
  }

  await reconcileDepartureDefaultsForTour(d.tour_id);

  const [finalRow] = await db.select().from(departureLocations).where(eq(departureLocations.id, row.id)).limit(1);

  return NextResponse.json({ success: true, departure: finalRow });
}
