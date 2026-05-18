import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { setAvailabilityRequestContext } from "@/lib/sentry/context";
import { findFirstBookableAvailability } from "@/lib/services/availability";

const querySchema = z.object({
  tour_id: z.string().uuid(),
  from_month: z.string().regex(/^\d{4}-\d{2}$/),
  departure_location_id: z.string().uuid().optional(),
  horizon_months: z.coerce.number().int().min(1).max(25).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    tour_id: searchParams.get("tour_id") ?? "",
    from_month: searchParams.get("from_month") ?? "",
    departure_location_id: searchParams.get("departure_location_id") ?? undefined,
    horizon_months: searchParams.get("horizon_months") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid query" }, { status: 400 });
  }

  setAvailabilityRequestContext({
    operation_type: "public_first_open_availability",
    tour_id: parsed.data.tour_id,
    month: parsed.data.from_month,
    departure_location_id: parsed.data.departure_location_id,
  });

  try {
    const result = await findFirstBookableAvailability({
      tourId: parsed.data.tour_id,
      departureLocationId: parsed.data.departure_location_id,
      fromMonth: parsed.data.from_month,
      horizonMonths: parsed.data.horizon_months,
    });
    return NextResponse.json({
      first_open_date: result.firstOpenDate,
      first_open_month: result.firstOpenMonth,
      earliest_bookable_date: result.earliestBookableDate,
    });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { operation_type: "availability_engine_failure" },
      contexts: {
        availability: {
          operation_type: "public_first_open_availability",
          tour_id: parsed.data.tour_id,
          month: parsed.data.from_month,
        },
      },
    });
    return NextResponse.json({ success: false, message: "Availability failed" }, { status: 500 });
  }
}
