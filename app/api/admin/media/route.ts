import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { listTourImages } from "@/lib/services/admin-media";
import { setAdminOperationContext } from "@/lib/sentry/context";

const querySchema = z.object({
  tour_id: z.string().uuid(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ tour_id: searchParams.get("tour_id") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid query" }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "admin_media_list",
    admin_user_id: session.user.id,
    tour_id: parsed.data.tour_id,
  });

  const images = await listTourImages(parsed.data.tour_id);
  return NextResponse.json(images);
}
