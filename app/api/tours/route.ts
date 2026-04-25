import { NextResponse } from "next/server";

import { listPublishedTours } from "@/lib/services/tours-public";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";
    const region = searchParams.get("region") ?? undefined;
    const rows = await listPublishedTours({ featured, region });
    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        short_description: r.shortDescription,
        duration_text: r.durationText,
        group_size_text: r.groupSizeText,
        price_from_text: r.priceFromText,
        minimum_advance_booking_days: r.minimumAdvanceBookingDays,
        hero_image: r.heroImage,
        is_featured: r.isFeatured,
      }))
    );
  } catch {
    return NextResponse.json({ success: false, message: "Failed to load tours" }, { status: 500 });
  }
}
