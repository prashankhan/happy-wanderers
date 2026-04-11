import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { setAvailabilityRequestContext } from "@/lib/sentry/context";
import { derivePublicCalendarState, getMonthAvailability } from "@/lib/services/availability";

const querySchema = z.object({
  tour_id: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  departure_location_id: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    tour_id: searchParams.get("tour_id") ?? "",
    month: searchParams.get("month") ?? "",
    departure_location_id: searchParams.get("departure_location_id") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid query" }, { status: 400 });
  }

  setAvailabilityRequestContext({
    operation_type: "public_month_availability",
    tour_id: parsed.data.tour_id,
    month: parsed.data.month,
    departure_location_id: parsed.data.departure_location_id,
  });

  try {
    const days = await getMonthAvailability({
      tourId: parsed.data.tour_id,
      month: parsed.data.month,
      departureLocationId: parsed.data.departure_location_id,
    });
    return NextResponse.json(
      days.map((d) => ({
        date: d.date,
        available: d.isAvailable,
        remaining_capacity: d.availableSeats,
        total_capacity: d.capacityTotal,
        seats_reserved: d.seatsReserved,
        cutoff_passed: d.cutoffPassed,
        override_exists: d.overrideExists,
        calendar_state: derivePublicCalendarState(d),
      }))
    );
  } catch (err) {
    Sentry.captureException(err, {
      tags: { operation_type: "availability_engine_failure" },
      contexts: {
        availability: {
          operation_type: "public_month_availability",
          tour_id: parsed.data.tour_id,
          month: parsed.data.month,
        },
      },
    });
    return NextResponse.json({ success: false, message: "Availability failed" }, { status: 500 });
  }
}
