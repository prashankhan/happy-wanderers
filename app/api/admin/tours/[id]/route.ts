import { NextResponse } from "next/server";
import { and, eq, isNull, ne } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { setAdminOperationContext } from "@/lib/sentry/context";
import { tours } from "@/lib/db/schema";

const patchSchema = z
  .object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    short_description: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    duration_text: z.string().min(1).optional(),
    duration_minutes: z.number().int().positive().optional(),
    group_size_text: z.string().min(1).optional(),
    default_capacity: z.number().int().positive().optional(),
    price_from_text: z.string().nullable().optional(),
    location_region: z.string().min(1).optional(),
    inclusions: z.array(z.string()).nullable().optional(),
    exclusions: z.array(z.string()).nullable().optional(),
    what_to_bring: z.array(z.string()).nullable().optional(),
    pickup_notes: z.string().nullable().optional(),
    cancellation_policy: z.string().nullable().optional(),
    hero_badge: z.string().nullable().optional(),
    booking_cutoff_hours: z.number().int().min(0).optional(),
    minimum_advance_booking_days: z.number().int().min(0).max(365).optional(),
    booking_enabled: z.boolean().optional(),
    is_active: z.boolean().optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    is_featured: z.boolean().optional(),
    display_order: z.number().int().optional(),
    seo_title: z.string().nullable().optional(),
    seo_description: z.string().nullable().optional(),
  })
  .strict();

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Validation failed" }, { status: 400 });
  }

  if (parsed.data.slug) {
    const clash = await db
      .select({ id: tours.id })
      .from(tours)
      .where(and(eq(tours.slug, parsed.data.slug), ne(tours.id, id), isNull(tours.deletedAt)))
      .limit(1);
    if (clash[0]) {
      return NextResponse.json({ success: false, message: "Slug already in use" }, { status: 400 });
    }
  }

  const row = await db.select().from(tours).where(and(eq(tours.id, id), isNull(tours.deletedAt))).limit(1);
  if (!row[0]) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  setAdminOperationContext({
    operation_type: "admin_tour_patch",
    admin_user_id: session.user.id,
    tour_id: id,
  });

  const d = parsed.data;
  const values: Partial<typeof tours.$inferInsert> = { updatedAt: new Date() };
  if (d.title !== undefined) values.title = d.title;
  if (d.slug !== undefined) values.slug = d.slug;
  if (d.short_description !== undefined) values.shortDescription = d.short_description;
  if (d.description !== undefined) values.description = d.description;
  if (d.duration_text !== undefined) values.durationText = d.duration_text;
  if (d.duration_minutes !== undefined) values.durationMinutes = d.duration_minutes;
  if (d.group_size_text !== undefined) values.groupSizeText = d.group_size_text;
  if (d.default_capacity !== undefined) values.defaultCapacity = d.default_capacity;
  if (d.price_from_text !== undefined) values.priceFromText = d.price_from_text;
  if (d.location_region !== undefined) values.locationRegion = d.location_region;
  if (d.inclusions !== undefined) values.inclusions = d.inclusions;
  if (d.exclusions !== undefined) values.exclusions = d.exclusions;
  if (d.what_to_bring !== undefined) values.whatToBring = d.what_to_bring;
  if (d.pickup_notes !== undefined) values.pickupNotes = d.pickup_notes;
  if (d.cancellation_policy !== undefined) values.cancellationPolicy = d.cancellation_policy;
  if (d.hero_badge !== undefined) values.heroBadge = d.hero_badge;
  if (d.booking_cutoff_hours !== undefined) values.bookingCutoffHours = d.booking_cutoff_hours;
  if (d.minimum_advance_booking_days !== undefined)
    values.minimumAdvanceBookingDays = d.minimum_advance_booking_days;
  if (d.booking_enabled !== undefined) values.bookingEnabled = d.booking_enabled;
  if (d.is_active !== undefined) values.isActive = d.is_active;
  if (d.status !== undefined) values.status = d.status;
  if (d.is_featured !== undefined) values.isFeatured = d.is_featured;
  if (d.display_order !== undefined) values.displayOrder = d.display_order;
  if (d.seo_title !== undefined) values.seoTitle = d.seo_title;
  if (d.seo_description !== undefined) values.seoDescription = d.seo_description;

  const [updated] = await db.update(tours).set(values).where(eq(tours.id, id)).returning();

  return NextResponse.json({ success: true, tour: updated });
}
