import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { getManifestRows } from "@/lib/services/manifests";
import { setAdminOperationContext } from "@/lib/sentry/context";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tour_id: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    date: searchParams.get("date") ?? "",
    tour_id: searchParams.get("tour_id") || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid query" }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "admin_manifest_export",
    admin_user_id: session.user.id,
    tour_id: parsed.data.tour_id,
    date: parsed.data.date,
  });

  const rows = await getManifestRows({
    date: parsed.data.date,
    tourId: parsed.data.tour_id,
  });

  return NextResponse.json(
    rows.map((r) => ({
      booking_reference: r.bookingReference,
      customer_first_name: r.customerFirstName,
      customer_last_name: r.customerLastName,
      customer_phone: r.customerPhone,
      pickup_location: r.pickupLocationNameSnapshot,
      pickup_time: r.pickupTimeSnapshot,
      adults: r.adults,
      children: r.children,
      infants: r.infants,
      guest_total: r.guestTotal,
      customer_notes: r.customerNotes,
      tour_title: r.tourTitleSnapshot,
    }))
  );
}
