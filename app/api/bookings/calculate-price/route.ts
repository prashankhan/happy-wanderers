import { NextResponse } from "next/server";
import { z } from "zod";

import { resolvePricing } from "@/lib/services/pricing";

const bodySchema = z.object({
  tour_id: z.string().uuid(),
  departure_location_id: z.string().uuid(),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.coerce.number().int().min(1),
  children: z.coerce.number().int().min(0),
  infants: z.coerce.number().int().min(0),
});

export async function POST(request: Request) {
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

  try {
    const pricing = await resolvePricing({
      tourId: parsed.data.tour_id,
      departureLocationId: parsed.data.departure_location_id,
      bookingDate: parsed.data.booking_date,
      adults: parsed.data.adults,
      children: parsed.data.children,
      infants: parsed.data.infants,
    });

    if (!pricing.ok) {
      return NextResponse.json({ success: false, message: pricing.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      breakdown: {
        pricingMode: pricing.breakdown.pricingMode,
        currency: pricing.breakdown.currency,
        adultUnit: pricing.breakdown.adultUnit,
        childUnit: pricing.breakdown.childUnit,
        infantUnit: pricing.breakdown.infantUnit,
        total: pricing.breakdown.total,
        includedGuests: pricing.breakdown.includedGuests,
        includedAdults: pricing.breakdown.includedAdults,
        packageBase: pricing.breakdown.packageBase,
        extraAdultUnit: pricing.breakdown.extraAdultUnit,
        extraChildUnit: pricing.breakdown.extraChildUnit,
        extraAdultsCount: pricing.breakdown.extraAdultsCount,
        extraChildrenCount: pricing.breakdown.extraChildrenCount,
        adultSubtotal: pricing.breakdown.adultSubtotal,
        childSubtotal: pricing.breakdown.childSubtotal,
        infantSubtotal: pricing.breakdown.infantSubtotal,
        adults: parsed.data.adults,
        children: parsed.data.children,
        infants: parsed.data.infants,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to calculate pricing right now. Please try again." },
      { status: 500 }
    );
  }
}
