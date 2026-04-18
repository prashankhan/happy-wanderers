import { NextResponse } from "next/server";
import { and, count, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { departureLocations } from "@/lib/db/schema";
import {
  clearDefaultExcept,
  reconcileDepartureDefaultsForTour,
} from "@/lib/services/admin-departures";
import { setAdminOperationContext } from "@/lib/sentry/context";
import { zodErrorToApiMessage } from "@/lib/utils/zod-api-message";

const pickupTimeRe = /^([01]\d|2[0-3]):[0-5]\d$/;

const bodySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  pickup_time: z.string().regex(pickupTimeRe, "Pickup time must be HH:mm (24h)").optional(),
  pickup_time_label: z.string().nullable().optional(),
  price_adjustment_type: z.enum(["none", "fixed", "percentage"]).optional(),
  price_adjustment_value: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, "Adjustment value must be a non-negative number")
    .optional(),
  google_maps_link: z.string().max(2048).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
});

export async function PATCH(request: Request) {
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

  if (parsed.data.is_active === false) {
    const [cnt] = await db
      .select({ c: count() })
      .from(departureLocations)
      .where(
        and(
          eq(departureLocations.tourId, tourId),
          eq(departureLocations.isActive, true),
          ne(departureLocations.id, parsed.data.id)
        )
      );
    if (Number(cnt?.c ?? 0) === 0) {
      return NextResponse.json(
        { success: false, message: "Cannot deactivate the only active pickup for this tour." },
        { status: 400 }
      );
    }
  }

  const willBeActive = parsed.data.is_active ?? existing.isActive;
  if (parsed.data.is_default === true && !willBeActive) {
    return NextResponse.json(
      {
        success: false,
        message:
          "The default pickup must be active. Turn this pickup on, or clear “default” and set another pickup as default first.",
      },
      { status: 400 }
    );
  }

  const nextType = parsed.data.price_adjustment_type ?? existing.priceAdjustmentType;
  const nextValueRaw = parsed.data.price_adjustment_value;
  const nextValue =
    nextType === "none"
      ? "0"
      : nextValueRaw !== undefined
        ? nextValueRaw
        : String(existing.priceAdjustmentValue);

  setAdminOperationContext({
    operation_type: "admin_departures_update",
    admin_user_id: session.user.id,
    tour_id: tourId,
  });

  const patch: Partial<typeof departureLocations.$inferInsert> = {
    updatedAt: new Date(),
    ...(parsed.data.name !== undefined ? { name: parsed.data.name.trim() } : {}),
    ...(parsed.data.pickup_time !== undefined ? { pickupTime: parsed.data.pickup_time } : {}),
    ...(parsed.data.pickup_time_label !== undefined
      ? { pickupTimeLabel: parsed.data.pickup_time_label?.trim() || null }
      : {}),
    ...(parsed.data.price_adjustment_type !== undefined
      ? { priceAdjustmentType: parsed.data.price_adjustment_type }
      : {}),
    ...(parsed.data.price_adjustment_type !== undefined || parsed.data.price_adjustment_value !== undefined
      ? { priceAdjustmentValue: nextValue }
      : {}),
    ...(parsed.data.google_maps_link !== undefined
      ? { googleMapsLink: parsed.data.google_maps_link?.trim() ? parsed.data.google_maps_link.trim() : null }
      : {}),
    ...(parsed.data.notes !== undefined
      ? { notes: parsed.data.notes?.trim() ? parsed.data.notes.trim() : null }
      : {}),
    ...(parsed.data.is_active !== undefined ? { isActive: parsed.data.is_active } : {}),
    ...(parsed.data.display_order !== undefined ? { displayOrder: parsed.data.display_order } : {}),
  };

  if (parsed.data.is_default === true) {
    patch.isDefault = true;
  } else if (parsed.data.is_default === false) {
    patch.isDefault = false;
  }

  await db.update(departureLocations).set(patch).where(eq(departureLocations.id, parsed.data.id));

  if (parsed.data.is_default === true) {
    await clearDefaultExcept(tourId, parsed.data.id);
    await db
      .update(departureLocations)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(departureLocations.id, parsed.data.id));
  }

  await reconcileDepartureDefaultsForTour(tourId);

  const [row] = await db.select().from(departureLocations).where(eq(departureLocations.id, parsed.data.id)).limit(1);

  return NextResponse.json({ success: true, departure: row });
}
