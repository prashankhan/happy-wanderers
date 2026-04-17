import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { reportRevenueByDay, reportTourPerformance } from "@/lib/services/admin-reports";
import { setAdminOperationContext } from "@/lib/sentry/context";

const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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
  const parsed = querySchema.safeParse({
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid query" }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "admin_report_revenue",
    admin_user_id: session.user.id,
    date: `${parsed.data.from}…${parsed.data.to}`,
  });

  const [byDay, byTour] = await Promise.all([
    reportRevenueByDay({ from: parsed.data.from, to: parsed.data.to }),
    reportTourPerformance({ from: parsed.data.from, to: parsed.data.to }),
  ]);

  return NextResponse.json({
    by_day: byDay.map((r) => ({
      date: r.day,
      revenue: r.revenue,
      bookings: r.bookings,
    })),
    by_tour: byTour.map((r) => ({
      tour_id: r.tourId,
      tour_title: r.tourTitle,
      bookings: r.bookings,
      guests: r.guests,
      revenue: r.revenue,
    })),
  });
}
