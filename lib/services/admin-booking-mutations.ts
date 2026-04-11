import * as Sentry from "@sentry/nextjs";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { bookings, departureLocations, tours } from "@/lib/db/schema";
import { sendBookingConfirmationEmails, sendCancellationEmail } from "@/lib/email/send";
import { countAllocatedSeats, resolveDayAvailability, validateSeatsForDate } from "@/lib/services/availability";
import { logBookingActivity } from "@/lib/services/booking-activity";
import { generateBookingReference } from "@/lib/services/bookings";
import { resolvePricing } from "@/lib/services/pricing";
import { getStripe } from "@/lib/stripe/client";

export async function validateGuestChangeForBooking(input: {
  bookingId: string;
  newGuestTotal: number;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const rows = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
  const b = rows[0];
  if (!b) return { ok: false, message: "Booking not found" };
  if (b.status !== "confirmed" && b.status !== "pending") {
    return { ok: false, message: "Booking cannot be edited" };
  }

  const loc = await db
    .select({ pickupTime: departureLocations.pickupTime })
    .from(departureLocations)
    .where(eq(departureLocations.id, b.departureLocationId))
    .limit(1);
  const pickupTime = loc[0]?.pickupTime ?? b.pickupTimeSnapshot;

  const day = await resolveDayAvailability({
    tourId: b.tourId,
    bookingDate: String(b.bookingDate),
    pickupTime,
  });

  const allocated = await countAllocatedSeats(b.tourId, String(b.bookingDate));
  const hypothetical = allocated - b.guestTotal + input.newGuestTotal;
  if (hypothetical > day.capacityTotal) {
    return { ok: false, message: "Capacity exceeded for this date" };
  }
  return { ok: true };
}

export async function updateBookingRecord(input: {
  bookingId: string;
  performedBy: string;
  patch: {
    adults?: number;
    children?: number;
    infants?: number;
    customerFirstName?: string;
    customerLastName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerNotes?: string | null;
    internalNotes?: string | null;
    departureLocationId?: string;
  };
  role: "admin" | "staff";
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const rows = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
  const b = rows[0];
  if (!b) return { ok: false, message: "Not found" };

  if (input.patch.departureLocationId && input.role !== "admin") {
    return { ok: false, message: "Forbidden" };
  }

  const nextAdults = input.patch.adults ?? b.adults;
  const nextChildren = input.patch.children ?? b.children;
  const nextInfants = input.patch.infants ?? b.infants;
  const nextGuest = nextAdults + nextChildren + nextInfants;
  if (nextGuest < 1) return { ok: false, message: "Invalid guest total" };

  if (nextGuest !== b.guestTotal) {
    const cap = await validateGuestChangeForBooking({ bookingId: input.bookingId, newGuestTotal: nextGuest });
    if (!cap.ok) return cap;
  }

  let pickupName = b.pickupLocationNameSnapshot;
  let pickupTime = b.pickupTimeSnapshot;
  let departureId = b.departureLocationId;

  if (input.patch.departureLocationId) {
    const dl = await db
      .select()
      .from(departureLocations)
      .where(
        and(
          eq(departureLocations.id, input.patch.departureLocationId),
          eq(departureLocations.tourId, b.tourId)
        )
      )
      .limit(1);
    if (!dl[0]) return { ok: false, message: "Invalid departure" };
    departureId = dl[0].id;
    pickupName = dl[0].name;
    pickupTime = dl[0].pickupTime;
  }

  const oldSnap = {
    adults: b.adults,
    children: b.children,
    infants: b.infants,
    guestTotal: b.guestTotal,
    departureLocationId: b.departureLocationId,
    pickupLocationNameSnapshot: b.pickupLocationNameSnapshot,
    pickupTimeSnapshot: b.pickupTimeSnapshot,
    customerFirstName: b.customerFirstName,
    customerLastName: b.customerLastName,
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone,
  };

  await db
    .update(bookings)
    .set({
      adults: nextAdults,
      children: nextChildren,
      infants: nextInfants,
      guestTotal: nextGuest,
      departureLocationId: departureId,
      pickupLocationNameSnapshot: pickupName,
      pickupTimeSnapshot: pickupTime,
      customerFirstName: input.patch.customerFirstName ?? b.customerFirstName,
      customerLastName: input.patch.customerLastName ?? b.customerLastName,
      customerEmail: input.patch.customerEmail ?? b.customerEmail,
      customerPhone: input.patch.customerPhone ?? b.customerPhone,
      customerNotes:
        input.patch.customerNotes !== undefined ? input.patch.customerNotes : b.customerNotes,
      internalNotes:
        input.patch.internalNotes !== undefined ? input.patch.internalNotes : b.internalNotes,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, input.bookingId));

  await logBookingActivity({
    bookingId: input.bookingId,
    actionType: "booking_updated",
    performedBy: input.performedBy,
    oldValue: oldSnap,
    newValue: input.patch,
  });

  return { ok: true };
}

export async function cancelBookingAdmin(input: {
  bookingId: string;
  performedBy: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const rows = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
  const b = rows[0];
  if (!b) return { ok: false, message: "Not found" };
  if (b.status === "cancelled" || b.status === "refunded") {
    return { ok: false, message: "Already finalised" };
  }

  await db
    .update(bookings)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(bookings.id, input.bookingId));

  await logBookingActivity({
    bookingId: input.bookingId,
    actionType: "booking_cancelled",
    performedBy: input.performedBy,
    oldValue: { status: b.status },
    newValue: { status: "cancelled" },
  });

  if (b.status === "confirmed") {
    await sendCancellationEmail(input.bookingId);
  }
  return { ok: true };
}

export async function refundBookingAdmin(input: {
  bookingId: string;
  performedBy: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const rows = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
  const b = rows[0];
  if (!b) return { ok: false, message: "Not found" };
  if (!b.stripePaymentIntentId) {
    return { ok: false, message: "No Stripe payment to refund" };
  }
  if (b.status !== "confirmed") {
    return { ok: false, message: "Only confirmed paid bookings can be refunded via Stripe" };
  }

  try {
    const stripe = getStripe();
    await stripe.refunds.create({ payment_intent: b.stripePaymentIntentId });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { operation_type: "admin_stripe_refund" },
      contexts: {
        admin_operation: {
          operation_type: "refund_via_stripe",
          booking_id: input.bookingId,
          admin_user_id: input.performedBy,
          stripe_payment_intent_id: b.stripePaymentIntentId,
          tour_id: b.tourId,
        },
      },
    });
    return { ok: false, message: "Stripe refund failed" };
  }

  await logBookingActivity({
    bookingId: input.bookingId,
    actionType: "refund_initiated",
    performedBy: input.performedBy,
    newValue: { stripePaymentIntentId: b.stripePaymentIntentId },
  });

  return { ok: true };
}

export async function createManualBooking(input: {
  tourId: string;
  bookingDate: string;
  departureLocationId: string;
  adults: number;
  children: number;
  infants: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerNotes?: string | null;
  paymentStatus: "unpaid" | "paid";
  performedBy: string;
}): Promise<{ ok: true; bookingId: string; bookingReference: string } | { ok: false; message: string }> {
  const loc = await db
    .select()
    .from(departureLocations)
    .where(
      and(
        eq(departureLocations.id, input.departureLocationId),
        eq(departureLocations.tourId, input.tourId)
      )
    )
    .limit(1);
  if (!loc[0]) return { ok: false, message: "Invalid departure" };

  const guestTotal = input.adults + input.children + input.infants;
  const seatCheck = await validateSeatsForDate({
    tourId: input.tourId,
    bookingDate: input.bookingDate,
    pickupTime: loc[0].pickupTime,
    requestedGuests: guestTotal,
  });
  if (!seatCheck.ok) return { ok: false, message: seatCheck.message };

  const pricing = await resolvePricing({
    tourId: input.tourId,
    departureLocationId: input.departureLocationId,
    bookingDate: input.bookingDate,
    adults: input.adults,
    children: input.children,
    infants: input.infants,
  });
  if (!pricing.ok) return { ok: false, message: pricing.message };

  const tourRows = await db
    .select()
    .from(tours)
    .where(and(eq(tours.id, input.tourId), sql`${tours.deletedAt} IS NULL`))
    .limit(1);
  const tourRow = tourRows[0];
  if (!tourRow) return { ok: false, message: "Tour not found" };

  const ref = await generateBookingReference(input.bookingDate);
  const now = new Date();

  const [row] = await db
    .insert(bookings)
    .values({
      bookingReference: ref,
      tourId: input.tourId,
      departureLocationId: input.departureLocationId,
      tourTitleSnapshot: tourRow.title,
      pickupLocationNameSnapshot: loc[0].name,
      pickupTimeSnapshot: loc[0].pickupTime,
      bookingDate: input.bookingDate,
      bookingDatetime: now,
      adults: input.adults,
      children: input.children,
      infants: input.infants,
      guestTotal,
      pricePerAdultSnapshot: String(pricing.breakdown.adultUnit),
      pricePerChildSnapshot: String(pricing.breakdown.childUnit),
      pricePerInfantSnapshot: String(pricing.breakdown.infantUnit),
      totalPriceSnapshot: String(pricing.breakdown.total),
      currency: pricing.breakdown.currency,
      customerFirstName: input.customerFirstName,
      customerLastName: input.customerLastName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      customerNotes: input.customerNotes ?? null,
      status: "confirmed",
      paymentStatus: input.paymentStatus,
      bookingSource: "admin_manual",
      expiresAt: null,
    })
    .returning({ id: bookings.id, bookingReference: bookings.bookingReference });

  const bookingId = row!.id;

  await logBookingActivity({
    bookingId,
    actionType: "manual_booking_created",
    performedBy: input.performedBy,
    newValue: { source: "admin_manual" },
  });

  await sendBookingConfirmationEmails(bookingId);

  return { ok: true, bookingId, bookingReference: row!.bookingReference };
}
