import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { softDeleteTourImage } from "@/lib/services/admin-media";
import { setAdminOperationContext } from "@/lib/sentry/context";

const querySchema = z.object({
  tour_id: z.string().uuid(),
  image_id: z.string().uuid(),
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
  const parsed = querySchema.safeParse({
    tour_id: searchParams.get("tour_id") ?? "",
    image_id: searchParams.get("image_id") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid query" }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "admin_media_delete",
    admin_user_id: session.user.id,
    tour_id: parsed.data.tour_id,
  });

  const result = await softDeleteTourImage({
    tourId: parsed.data.tour_id,
    imageId: parsed.data.image_id,
  });

  if (!result.ok) {
    return NextResponse.json({ success: false, message: result.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
