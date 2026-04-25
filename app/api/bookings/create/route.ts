import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createWebsitePendingBooking } from "@/lib/services/bookings";
import { getSiteUrl } from "@/lib/site-url";
import { getRequestIp, isRateLimited } from "@/lib/utils/rate-limit";
import { zodErrorToApiMessage } from "@/lib/utils/zod-api-message";

const bodySchema = z.object({
  tour_id: z.string().uuid("Invalid tour selected."),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid booking date."),
  departure_location_id: z.string().uuid("Invalid pickup location."),
  adults: z.coerce.number().int().min(1, "At least 1 adult is required."),
  children: z.coerce.number().int().min(0, "Children count cannot be negative."),
  infants: z.coerce.number().int().min(0, "Infants count cannot be negative."),
  customer_first_name: z.string().trim().min(1, "First name is required."),
  customer_last_name: z.string().trim().min(1, "Last name is required."),
  customer_email: z.string().trim().email("Please enter a valid email address."),
  customer_phone: z.string().trim().min(5, "Please enter a valid phone number."),
  customer_notes: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  if (
    await isRateLimited(`public-booking:${ip}`, {
      maxRequests: 12,
      windowMs: 15 * 60 * 1000,
    })
  ) {
    return NextResponse.json(
      { success: false, message: "Too many booking attempts. Please wait and try again." },
      { status: 429 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: zodErrorToApiMessage(parsed.error, "Please check your details and try again."),
      },
      { status: 400 }
    );
  }

  try {
    const appUrl = getSiteUrl();

    Sentry.getCurrentScope().setContext("booking_lifecycle", {
      operation_type: "website_booking_create",
      tour_id: parsed.data.tour_id,
      date: parsed.data.booking_date,
    });
    Sentry.getCurrentScope().setTag("operation_type", "website_booking_create");

    const result = await createWebsitePendingBooking({
      tourId: parsed.data.tour_id,
      bookingDate: parsed.data.booking_date,
      departureLocationId: parsed.data.departure_location_id,
      adults: parsed.data.adults,
      children: parsed.data.children,
      infants: parsed.data.infants,
      customerFirstName: parsed.data.customer_first_name,
      customerLastName: parsed.data.customer_last_name,
      customerEmail: parsed.data.customer_email,
      customerPhone: parsed.data.customer_phone,
      customerNotes: parsed.data.customer_notes,
      appUrl,
    });

    if (!result.ok) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      booking_reference: result.bookingReference,
      stripe_checkout_url: result.checkoutUrl,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to create booking right now. Please try again." },
      { status: 500 }
    );
  }
}
