import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { cancelBookingAdmin } from "@/lib/services/admin-booking-mutations";
import { setAdminOperationContext } from "@/lib/sentry/context";

const bodySchema = z.object({
  booking_id: z.string().uuid(),
});

export async function PATCH(request: Request) {
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
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Validation failed" }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "admin_booking_cancel",
    admin_user_id: session.user.id,
    booking_id: parsed.data.booking_id,
  });

  const result = await cancelBookingAdmin({
    bookingId: parsed.data.booking_id,
    performedBy: session.user.email,
  });

  if (!result.ok) {
    const status = result.message === "Not found" ? 404 : 400;
    return NextResponse.json({ success: false, message: result.message }, { status });
  }

  return NextResponse.json({ success: true });
}
