import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import {
  deleteAvailabilityOverride,
  upsertAvailabilityOverride,
} from "@/lib/services/admin-overrides";
import { setAdminOperationContext } from "@/lib/sentry/context";

const postSchema = z.object({
  tour_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  is_available: z.boolean(),
  capacity_override: z.number().int().positive().nullable().optional(),
  cutoff_override_hours: z.number().int().positive().nullable().optional(),
  note: z.string().nullable().optional(),
});

const deleteSchema = z.object({
  tour_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Validation failed" }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "availability_override_attempt",
    admin_user_id: session.user.id,
    tour_id: parsed.data.tour_id,
    date: parsed.data.date,
  });

  const result = await upsertAvailabilityOverride({
    tourId: parsed.data.tour_id,
    date: parsed.data.date,
    isAvailable: parsed.data.is_available,
    capacityOverride: parsed.data.capacity_override ?? null,
    cutoffOverrideHours: parsed.data.cutoff_override_hours ?? null,
    note: parsed.data.note ?? null,
  });

  if (!result.ok) {
    return NextResponse.json({ success: false, message: result.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = deleteSchema.safeParse({
    tour_id: searchParams.get("tour_id") ?? "",
    date: searchParams.get("date") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid query" }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "availability_override_delete",
    admin_user_id: session.user.id,
    tour_id: parsed.data.tour_id,
    date: parsed.data.date,
  });

  await deleteAvailabilityOverride(parsed.data.tour_id, parsed.data.date);
  return NextResponse.json({ success: true });
}
