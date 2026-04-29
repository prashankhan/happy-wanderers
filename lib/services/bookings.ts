import * as Sentry from "@sentry/nextjs";
import { and, eq, inArray, isNotNull, lt, sql } from "drizzle-orm";
import { customAlphabet } from "nanoid";

import { db } from "@/lib/db";
import { bookings, departureLocations, tours } from "@/lib/db/schema";
import { getSystemSettings } from "@/lib/services/system-settings";
import {
  getMinimumAdvanceWindowForDate,
  resolveDayAvailability,
  validateSeatsForDate,
} from "@/lib/services/availability";
import { iterateIsoDateRangeInclusive, tourSpanFromDepartureDate } from "@/lib/utils/dates";
import { resolvePricing } from "@/lib/services/pricing";
import { logBookingActivity } from "@/lib/services/booking-activity";
import { getStripe } from "@/lib/stripe/client";

const suffixAlphabet = customAlphabet("0123456789", 4);

export async function generateBookingReference(bookingDate: string): Promise<string> {
  const settings = await getSystemSettings();
  const [Y, M, D] = bookingDate.split("-").map(Number);
  const yy = String(Y).slice(-2);
  const mm = String(M).padStart(2, "0");
  const dd = String(D).padStart(2, "0");
  const yyMMdd = `${yy}${mm}${dd}`;
  const prefix = settings.bookingReferencePrefix || "HW";

  for (let i = 0; i < 8; i++) {
    const ref = `${prefix}-${yyMMdd}-${suffixAlphabet()}`;
    const existing = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.bookingReference, ref))
      .limit(1);
    if (!existing[0]) return ref;
  }
  throw new Error("Could not allocate booking reference");
}

export async function createWebsitePendingBooking(input: {
  tourId: string;
  bookingDate: string;
  departureLocationId: string;
  adults: number;
  children: number;
  infants: number;
  pricingRuleId?: string | null;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerNotes?: string | null;
  appUrl: string;
}): Promise<
  | { ok: true; bookingId: string; checkoutUrl: string; bookingReference: string }
  | { ok: false; message: string }
> {
  const settings = await getSystemSettings();
  const holdMins = settings.holdExpiryMinutes ?? 10;

  const tourRow = await db
    .select()
    .from(tours)
    .where(
      and(
        eq(tours.id, input.tourId),
        eq(tours.status, "published"),
        eq(tours.bookingEnabled, true),
        eq(tours.isActive, true),
        sql`${tours.deletedAt} IS NULL`
      )
    )
    .limit(1);
  const tour = tourRow[0];
  if (!tour) return { ok: false, message: "Tour not available" };

  const locRows = await db
    .select()
    .from(departureLocations)
    .where(
      and(
        eq(departureLocations.id, input.departureLocationId),
        eq(departureLocations.tourId, input.tourId),
        eq(departureLocations.isActive, true)
      )
    )
    .limit(1);
  const loc = locRows[0];
  if (!loc) return { ok: false, message: "Invalid pickup location" };

  const guestTotal = input.adults + input.children + input.infants;
  if (guestTotal < 1) return { ok: false, message: "Guest count required" };

  const minimumAdvance = getMinimumAdvanceWindowForDate({
    bookingDate: input.bookingDate,
    minimumAdvanceBookingDays: tour.minimumAdvanceBookingDays ?? 0,
    timezone: settings.timezone,
  });
  if (minimumAdvance.blocked) {
    return { ok: false, message: "Minimum advance booking period not met" };
  }

  const pickupTime = loc.pickupTime;
  const seatCheck = await validateSeatsForDate({
    tourId: input.tourId,
    bookingDate: input.bookingDate,
    pickupTime,
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
    pricingRuleId: input.pricingRuleId,
  });
  if (!pricing.ok) return { ok: false, message: pricing.message };

  const bookingReference = await generateBookingReference(input.bookingDate);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + holdMins * 60 * 1000);

  const bookingDatetime = now;
  const { tourStartDate, tourEndDate } = tourSpanFromDepartureDate(
    input.bookingDate,
    tour.durationDays,
    tour.isMultiDay
  );
  const dateRangeLabel =
    tourStartDate === tourEndDate
      ? input.bookingDate
      : `${tourStartDate} → ${tourEndDate}`;

  const [row] = await db
    .insert(bookings)
    .values({
      bookingReference,
      tourId: input.tourId,
      departureLocationId: input.departureLocationId,
      tourTitleSnapshot: tour.title,
      pickupLocationNameSnapshot: loc.name,
      pickupTimeSnapshot: loc.pickupTime,
      bookingDate: input.bookingDate,
      tourStartDate,
      tourEndDate,
      bookingDatetime,
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
      status: "pending",
      paymentStatus: "unpaid",
      bookingSource: "website",
      expiresAt,
    })
    .returning({ id: bookings.id });

  const bookingId = row.id;

  // After inserting this pending hold, validate only capacity overflow.
  // A "full" day (availableSeats === 0) is valid if this hold exactly fills capacity.
  const dates = iterateIsoDateRangeInclusive(tourStartDate, tourEndDate);
  for (let i = 0; i < dates.length; i++) {
    const d = dates[i]!;
    const capacityCheck = await resolveDayAvailability({
      tourId: input.tourId,
      bookingDate: d,
      pickupTime,
      applyMinimumAdvance: i === 0,
      applyCutoff: i === 0,
    });
    if (capacityCheck.seatsReserved > capacityCheck.capacityTotal) {
      await db.delete(bookings).where(eq(bookings.id, bookingId));
      return { ok: false, message: "Not enough seats available" };
    }
  }

  const stripe = getStripe();
  const successUrl = `${input.appUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${input.appUrl}/booking/cancelled?booking_id=${bookingId}`;

  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.customerEmail,
      line_items: [
        {
          price_data: {
            currency: pricing.breakdown.currency.toLowerCase(),
            product_data: {
              name: `${tour.title} — ${dateRangeLabel}`,
              description: `Ref ${bookingReference}`,
            },
            unit_amount: Math.round(pricing.breakdown.total * 100),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        booking_id: bookingId,
        booking_reference: bookingReference,
      },
      payment_intent_data: {
        metadata: {
          booking_id: bookingId,
        },
      },
    });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { operation_type: "stripe_checkout_session_create" },
      contexts: {
        booking_lifecycle: {
          operation_type: "website_checkout_session_create",
          booking_id: bookingId,
          tour_id: input.tourId,
          date: input.bookingDate,
        },
      },
    });
    await db.delete(bookings).where(eq(bookings.id, bookingId));
    return { ok: false, message: "Payment session could not be created" };
  }

  await db
    .update(bookings)
    .set({
      stripeSessionId: session.id,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId));

  await logBookingActivity({
    bookingId,
    actionType: "booking_created",
    performedBy: "system",
    newValue: { source: "website", stripeSessionId: session.id },
  });

  if (!session.url) {
    await db.delete(bookings).where(eq(bookings.id, bookingId));
    return { ok: false, message: "Stripe session URL missing" };
  }

  return {
    ok: true,
    bookingId,
    bookingReference,
    checkoutUrl: session.url,
  };
}

export async function expirePendingBookings(): Promise<number> {
  const now = new Date();
  const pending = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "pending"),
        isNotNull(bookings.expiresAt),
        lt(bookings.expiresAt, now)
      )
    );

  if (!pending.length) return 0;

  const affectedIds = pending.map((p) => p.id);
  const jobStarted = Date.now();
  Sentry.getCurrentScope().setContext("background_job", {
    job_name: "expire_pending_bookings",
    affected_booking_ids: affectedIds,
    job_started_at: new Date(jobStarted).toISOString(),
  });
  Sentry.getCurrentScope().setTag("job_name", "expire_pending_bookings");

  await db
    .update(bookings)
    .set({ status: "expired", updatedAt: now })
    .where(inArray(bookings.id, affectedIds));

  for (const row of pending) {
    await logBookingActivity({
      bookingId: row.id,
      actionType: "status_changed",
      performedBy: "cron_expire_pending",
      oldValue: { status: "pending" },
      newValue: { status: "expired" },
    });
  }

  return pending.length;
}
