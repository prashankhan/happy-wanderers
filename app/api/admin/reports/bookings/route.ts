import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { reportBookingTotals } from "@/lib/services/admin-reports";
import { setAdminOperationContext } from "@/lib/sentry/context";

const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tour_id: z.string().uuid().optional(),
  status: z.enum(["pending", "confirmed", "failed", "expired", "cancelled", "refunded"]).optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const statusRaw = searchParams.get("status");
  const parsed = querySchema.safeParse({
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
    tour_id: searchParams.get("tour_id") || undefined,
    status: statusRaw && statusRaw.length > 0 ? statusRaw : undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid query" }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "admin_report_bookings",
    admin_user_id: session.user.id,
    tour_id: parsed.data.tour_id,
    date: `${parsed.data.from}…${parsed.data.to}`,
  });

  const totals = await reportBookingTotals({
    from: parsed.data.from,
    to: parsed.data.to,
    tourId: parsed.data.tour_id,
    status: parsed.data.status,
  });

  return NextResponse.json({
    booking_count: totals.count,
    guest_total: totals.guestSum,
    revenue_total: totals.revenue,
    status_filter: parsed.data.status ?? "confirmed",
  });
}
