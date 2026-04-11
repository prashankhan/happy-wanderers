import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

import { db } from "@/lib/db";
import { bookings, departureLocations, stripeWebhookEvents } from "@/lib/db/schema";
import { validateSeatsForDate } from "@/lib/services/availability";
import { logBookingActivity } from "@/lib/services/booking-activity";
import { sendBookingConfirmationEmails, sendRefundEmail } from "@/lib/email/send";

export async function wasStripeEventProcessed(eventId: string): Promise<boolean> {
  const rows = await db
    .select({ status: stripeWebhookEvents.status })
    .from(stripeWebhookEvents)
    .where(eq(stripeWebhookEvents.stripeEventId, eventId))
    .limit(1);
  return rows[0]?.status === "processed";
}

export async function insertStripeEventReceived(event: Stripe.Event) {
  await db.insert(stripeWebhookEvents).values({
    stripeEventId: event.id,
    eventType: event.type,
    status: "received",
    payloadJson: event as unknown as Record<string, unknown>,
  });
}

export async function markStripeEventProcessed(eventId: string) {
  await db
    .update(stripeWebhookEvents)
    .set({ status: "processed", processedAt: new Date() })
    .where(eq(stripeWebhookEvents.stripeEventId, eventId));
}

export async function markStripeEventFailed(eventId: string) {
  await db
    .update(stripeWebhookEvents)
    .set({ status: "failed", processedAt: new Date() })
    .where(eq(stripeWebhookEvents.stripeEventId, eventId));
}

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.booking_id;
  if (!bookingId) return;

  const rows = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  const booking = rows[0];
  if (!booking) return;
  if (booking.status !== "pending") return;

  const piForCtx =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? undefined;
  Sentry.getCurrentScope().setContext("booking_lifecycle", {
    operation_type: "booking_confirm_attempt",
    booking_id: bookingId,
    tour_id: booking.tourId,
    date: String(booking.bookingDate),
    stripe_session_id: session.id,
    payment_intent_id: piForCtx,
  });

  const dlRows = await db
    .select()
    .from(departureLocations)
    .where(eq(departureLocations.id, booking.departureLocationId))
    .limit(1);
  const pickupTime = dlRows[0]?.pickupTime ?? booking.pickupTimeSnapshot;

  const seatCheck = await validateSeatsForDate({
    tourId: booking.tourId,
    bookingDate: String(booking.bookingDate),
    pickupTime,
    requestedGuests: booking.guestTotal,
  });
  if (!seatCheck.ok) {
    await db
      .update(bookings)
      .set({
        status: "failed",
        paymentStatus: "failed",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));
    await logBookingActivity({
      bookingId,
      actionType: "payment_blocked_capacity",
      performedBy: "stripe_webhook",
      newValue: { message: seatCheck.message },
    });
    return;
  }

  const pi =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  await db
    .update(bookings)
    .set({
      status: "confirmed",
      paymentStatus: "paid",
      stripePaymentIntentId: pi,
      expiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId));

  await logBookingActivity({
    bookingId,
    actionType: "status_changed",
    performedBy: "stripe_webhook",
    oldValue: { status: "pending" },
    newValue: { status: "confirmed" },
  });

  await sendBookingConfirmationEmails(bookingId);
}

export async function handlePaymentIntentFailed(pi: Stripe.PaymentIntent) {
  const bookingId = pi.metadata?.booking_id;
  if (!bookingId) return;
  const rows = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  const booking = rows[0];
  if (!booking || booking.status !== "pending") return;

  Sentry.getCurrentScope().setContext("booking_lifecycle", {
    operation_type: "payment_intent_failed",
    booking_id: bookingId,
    tour_id: booking.tourId,
    date: String(booking.bookingDate),
    payment_intent_id: pi.id,
  });

  await db
    .update(bookings)
    .set({
      status: "failed",
      paymentStatus: "failed",
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId));

  await logBookingActivity({
    bookingId,
    actionType: "payment_failed",
    performedBy: "stripe_webhook",
    newValue: { paymentIntentId: pi.id },
  });
}

export async function handleChargeRefunded(charge: Stripe.Charge) {
  const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!piId) return;

  const rows = await db
    .select()
    .from(bookings)
    .where(eq(bookings.stripePaymentIntentId, piId))
    .limit(1);
  const booking = rows[0];
  if (!booking) return;

  Sentry.getCurrentScope().setContext("booking_lifecycle", {
    operation_type: "stripe_refund_lifecycle",
    booking_id: booking.id,
    tour_id: booking.tourId,
    date: String(booking.bookingDate),
    payment_intent_id: piId,
  });

  await db
    .update(bookings)
    .set({
      status: "refunded",
      paymentStatus: "refunded",
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, booking.id));

  await logBookingActivity({
    bookingId: booking.id,
    actionType: "refund_processed",
    performedBy: "stripe_webhook",
    newValue: { chargeId: charge.id },
  });

  await sendRefundEmail(booking.id);
}
