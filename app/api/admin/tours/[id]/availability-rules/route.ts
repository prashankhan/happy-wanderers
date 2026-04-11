import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { setAdminOperationContext } from "@/lib/sentry/context";
import { availabilityRules, tours } from "@/lib/db/schema";

const ruleSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  default_capacity: z.number().int().positive().nullable(),
  is_active: z.boolean(),
});

const putSchema = z.object({
  rules: z.array(ruleSchema).length(7),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id: tourId } = await context.params;

  const t = await db
    .select({ id: tours.id })
    .from(tours)
    .where(and(eq(tours.id, tourId), isNull(tours.deletedAt)))
    .limit(1);
  if (!t[0]) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  setAdminOperationContext({
    operation_type: "admin_tour_availability_rules_read",
    admin_user_id: session.user.id,
    tour_id: tourId,
  });

  const rows = await db.select().from(availabilityRules).where(eq(availabilityRules.tourId, tourId));

  const byWeekday = new Map(rows.map((r) => [r.weekday, r]));
  const merged = [];
  for (let w = 0; w <= 6; w++) {
    const r = byWeekday.get(w);
    merged.push(
      r
        ? {
            id: r.id,
            weekday: r.weekday,
            default_capacity: r.defaultCapacity,
            is_active: r.isActive,
          }
        : {
            id: null,
            weekday: w,
            default_capacity: null,
            is_active: true,
          }
    );
  }

  return NextResponse.json({ rules: merged });
}

export async function PUT(
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

  const { id: tourId } = await context.params;

  const t = await db
    .select({ id: tours.id })
    .from(tours)
    .where(and(eq(tours.id, tourId), isNull(tours.deletedAt)))
    .limit(1);
  if (!t[0]) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Validation failed" }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "admin_tour_availability_rules_write",
    admin_user_id: session.user.id,
    tour_id: tourId,
  });

  const weekdays = new Set(parsed.data.rules.map((r) => r.weekday));
  if (weekdays.size !== 7) {
    return NextResponse.json({ success: false, message: "Each weekday 0–6 must appear once" }, { status: 400 });
  }

  await db.delete(availabilityRules).where(eq(availabilityRules.tourId, tourId));

  for (const r of parsed.data.rules) {
    await db.insert(availabilityRules).values({
      tourId,
      weekday: r.weekday,
      defaultCapacity: r.default_capacity,
      isActive: r.is_active,
    });
  }

  return NextResponse.json({ success: true });
}
