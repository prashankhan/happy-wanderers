import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { createManualBooking } from "@/lib/services/admin-booking-mutations";
import { setAdminOperationContext } from "@/lib/sentry/context";

const bodySchema = z
  .object({
    tour_id: z.string().uuid(),
    booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    departure_location_id: z.string().uuid(),
    adults: z.number().int().min(0),
    children: z.number().int().min(0),
    infants: z.number().int().min(0),
    customer_first_name: z.string().min(1),
    customer_last_name: z.string().min(1),
    customer_email: z.string().email(),
    customer_phone: z.union([z.string(), z.null()]).optional(),
    pickup_address: z.string().nullable().optional(),
    pickup_google_maps_link: z.string().url().nullable().optional(),
    customer_notes: z.string().nullable().optional(),
    payment_status: z.enum(["unpaid", "paid"]),
  })
  .refine((b) => b.adults + b.children + b.infants >= 1, { message: "At least one guest" });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

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

  setAdminOperationContext({
    operation_type: "admin_manual_booking_create",
    admin_user_id: session.user.id,
    tour_id: parsed.data.tour_id,
    date: parsed.data.booking_date,
  });

  const customerPhone = String(parsed.data.customer_phone ?? "").trim();

  const result = await createManualBooking({
    tourId: parsed.data.tour_id,
    bookingDate: parsed.data.booking_date,
    departureLocationId: parsed.data.departure_location_id,
    adults: parsed.data.adults,
    children: parsed.data.children,
    infants: parsed.data.infants,
    customerFirstName: parsed.data.customer_first_name,
    customerLastName: parsed.data.customer_last_name,
    customerEmail: parsed.data.customer_email,
    customerPhone,
    pickupAddress: parsed.data.pickup_address ?? null,
    pickupGoogleMapsLink: parsed.data.pickup_google_maps_link ?? null,
    customerNotes: parsed.data.customer_notes ?? null,
    paymentStatus: parsed.data.payment_status,
    performedBy: session.user.email,
  });

  if (!result.ok) {
    return NextResponse.json({ success: false, message: result.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    booking_id: result.bookingId,
    booking_reference: result.bookingReference,
  });
}
