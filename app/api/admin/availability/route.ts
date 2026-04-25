import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { setAdminOperationContext } from "@/lib/sentry/context";
import { derivePublicCalendarState, getMonthAvailability } from "@/lib/services/availability";

const querySchema = z.object({
  tour_id: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    tour_id: searchParams.get("tour_id") ?? "",
    month: searchParams.get("month") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid query" }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "admin_month_availability",
    admin_user_id: session.user.id,
    tour_id: parsed.data.tour_id,
    month: parsed.data.month,
  });

  let days;
  try {
    days = await getMonthAvailability({
      tourId: parsed.data.tour_id,
      month: parsed.data.month,
    });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { operation_type: "availability_engine_failure" },
      contexts: {
        availability: {
          operation_type: "admin_month_availability",
          tour_id: parsed.data.tour_id,
          month: parsed.data.month,
        },
      },
    });
    return NextResponse.json({ success: false, message: "Availability failed" }, { status: 500 });
  }

  return NextResponse.json(
    days.map((d) => ({
      date: d.date,
      is_available: d.isAvailable,
      remaining_capacity: d.availableSeats,
      total_capacity: d.capacityTotal,
      seats_reserved: d.seatsReserved,
      cutoff_passed: d.cutoffPassed,
      minimum_advance_blocked: d.minimumAdvanceBlocked,
      minimum_advance_booking_days: d.minimumAdvanceBookingDays,
      earliest_bookable_date: d.earliestBookableDate,
      override_exists: d.overrideExists,
      calendar_state: derivePublicCalendarState(d),
    }))
  );
}
