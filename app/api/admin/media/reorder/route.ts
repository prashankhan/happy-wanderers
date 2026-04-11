import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { reorderTourImages } from "@/lib/services/admin-media";
import { setAdminOperationContext } from "@/lib/sentry/context";

const bodySchema = z.object({
  tour_id: z.string().uuid(),
  image_ids: z.array(z.string().uuid()),
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
    return NextResponse.json({ success: false, message: "Validation failed" }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "admin_media_reorder",
    admin_user_id: session.user.id,
    tour_id: parsed.data.tour_id,
  });

  const result = await reorderTourImages({
    tourId: parsed.data.tour_id,
    imageIds: parsed.data.image_ids,
  });

  if (!result.ok) {
    return NextResponse.json({ success: false, message: result.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
