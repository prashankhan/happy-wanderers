import { NextResponse } from "next/server";

import { getTourBySlug } from "@/lib/services/tours-public";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const data = await getTourBySlug(slug);
    if (!data) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    const { tour, images, pickups, pricingRules: pr, availabilityRules: ar } = data;
    return NextResponse.json({
      tour: {
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
        short_description: tour.shortDescription,
        description: tour.description,
        duration_text: tour.durationText,
        duration_minutes: tour.durationMinutes,
        group_size_text: tour.groupSizeText,
        default_capacity: tour.defaultCapacity,
        price_from_text: tour.priceFromText,
        location_region: tour.locationRegion,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        what_to_bring: tour.whatToBring,
        pickup_notes: tour.pickupNotes,
        cancellation_policy: tour.cancellationPolicy,
        hero_badge: tour.heroBadge,
        booking_cutoff_hours: tour.bookingCutoffHours,
        seo_title: tour.seoTitle,
        seo_description: tour.seoDescription,
      },
      departure_locations: pickups,
      gallery: images,
      pricing_rules: pr,
      availability_rules: ar,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to load tour details right now." },
      { status: 500 }
    );
  }
}
