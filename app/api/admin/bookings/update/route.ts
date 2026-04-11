import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { updateBookingRecord } from "@/lib/services/admin-booking-mutations";
import { setAdminOperationContext } from "@/lib/sentry/context";

const bodySchema = z.object({
  booking_id: z.string().uuid(),
  adults: z.number().int().min(0).optional(),
  children: z.number().int().min(0).optional(),
  infants: z.number().int().min(0).optional(),
  customer_first_name: z.string().min(1).optional(),
  customer_last_name: z.string().min(1).optional(),
  customer_email: z.string().email().optional(),
  customer_phone: z.string().min(1).optional(),
  customer_notes: z.string().nullable().optional(),
  internal_notes: z.string().nullable().optional(),
  departure_location_id: z.string().uuid().optional(),
});

export async function PATCH(request: Request) {
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
    operation_type: "admin_booking_update",
    admin_user_id: session.user.id,
    booking_id: parsed.data.booking_id,
  });

  const role = session.user.role === "admin" ? "admin" : "staff";
  if (role === "staff" && parsed.data.internal_notes !== undefined) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const result = await updateBookingRecord({
    bookingId: parsed.data.booking_id,
    performedBy: session.user.email,
    role,
    patch: {
      adults: parsed.data.adults,
      children: parsed.data.children,
      infants: parsed.data.infants,
      customerFirstName: parsed.data.customer_first_name,
      customerLastName: parsed.data.customer_last_name,
      customerEmail: parsed.data.customer_email,
      customerPhone: parsed.data.customer_phone,
      customerNotes: parsed.data.customer_notes,
      internalNotes: parsed.data.internal_notes,
      departureLocationId: parsed.data.departure_location_id,
    },
  });

  if (!result.ok) {
    const status = result.message === "Forbidden" ? 403 : result.message === "Not found" ? 404 : 400;
    return NextResponse.json({ success: false, message: result.message }, { status });
  }

  return NextResponse.json({ success: true });
}
