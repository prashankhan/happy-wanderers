import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { createDraftTour } from "@/lib/services/admin-tours";
import { setAdminOperationContext } from "@/lib/sentry/context";

const bodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  is_multi_day: z.boolean().optional(),
  duration_days: z.number().int().min(2).max(30).optional(),
  requires_accommodation: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    json = {};
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Validation failed" }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "admin_tour_create_draft",
    admin_user_id: session.user.id,
  });

  try {
    const { id, slug } = await createDraftTour({
      title: parsed.data.title?.trim() || "New tour",
      isMultiDay: parsed.data.is_multi_day,
      durationDays: parsed.data.duration_days,
      requiresAccommodation: parsed.data.requires_accommodation,
    });
    return NextResponse.json({ success: true, tour_id: id, slug });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Create failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
