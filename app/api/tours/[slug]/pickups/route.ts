import { NextResponse } from "next/server";

import { getTourBySlug } from "@/lib/services/tours-public";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const data = await getTourBySlug(slug);
  if (!data) {
    return NextResponse.json([], { status: 200 });
  }

  const pickups = data.pickups.map((p) => ({
    id: p.id,
    name: p.name,
    timeLabel: p.pickupTimeLabel ?? p.pickupTime,
  }));

  return NextResponse.json(pickups);
}
