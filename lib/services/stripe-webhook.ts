import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import type Stripe from "stripe";

import { db } from "@/lib/db";
import { bookings, departureLocations, stripeWebhookEvents } from "@/lib/db/schema";
import { validateCapacityForConfirmingPendingHold } from "@/lib/services/availability";
import { logBookingActivity } from "@/lib/services/booking-activity";
import { sendBookingConfirmationEmails, sendRefundEmail } from "@/lib/email/send";
import { getStripe } from "@/lib/stripe/client";

export async function wasStripeEventProcessed(eventId: string): Promise<boolean> {
  const rows = await db
    .select({ status: stripeWebhookEvents.status })
    .from(stripeWebhookEvents)
    .where(eq(stripeWebhookEvents.stripeEventId, eventId))
    .limit(1);
  return rows[0]?.status === "processed";
}

/** Inserts webhook row if missing so Stripe retries can re-run handlers after failures. */
export async function insertStripeEventReceived(event: Stripe.Event): Promise<void> {
  await db
    .insert(stripeWebhookEvents)
    .values({
      stripeEventId: event.id,
      eventType: event.type,
      status: "received",
      payloadJson: event as unknown as Record<string, unknown>,
    })
    .onConflictDoNothing({ target: stripeWebhookEvents.stripeEventId });
}

export async function getStripeWebhookEventStatus(
  eventId: string
): Promise<"missing" | "received" | "processed" | "failed"> {
  const rows = await db
    .select({ status: stripeWebhookEvents.status })
    .from(stripeWebhookEvents)
    .where(eq(stripeWebhookEvents.stripeEventId, eventId))
    .limit(1);
  const s = rows[0]?.status;
  if (!s) return "missing";
  if (s === "processed" || s === "failed" || s === "received") return s;
  return "received";
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

async function resolveCheckoutSessionPaid(session: Stripe.Checkout.Session): Promise<boolean> {
  if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
    return true;
  }
  const piRef = session.payment_intent;
  if (!piRef) return false;
  try {
    const stripe = getStripe();
    const piId = typeof piRef === "string" ? piRef : piRef.id;
    const pi = await stripe.paymentIntents.retrieve(piId);
    return pi.status === "succeeded";
  } catch (err) {
    Sentry.captureException(err, {
      tags: { operation_type: "stripe_payment_intent_retrieve" },
      extra: { stripe_session_id: session.id },
    });
    return false;
  }
}

async function confirmPendingBookingAfterSuccessfulPayment(input: {
  bookingId: string;
  stripePaymentIntentId: string | null;
  performedBy: string;
}): Promise<void> {
  const rows = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
  const booking = rows[0];
  if (!booking || booking.status !== "pending") return;

  const dlRows = await db
    .select()
    .from(departureLocations)
    .where(eq(departureLocations.id, booking.departureLocationId))
    .limit(1);
  const pickupTime = dlRows[0]?.pickupTime ?? booking.pickupTimeSnapshot;

  const seatCheck = await validateCapacityForConfirmingPendingHold({
    tourId: booking.tourId,
    bookingDate: String(booking.bookingDate),
    pickupTime,
  });
  if (!seatCheck.ok) {
    const failedRows = await db
      .update(bookings)
      .set({
        status: "failed",
        paymentStatus: "failed",
        updatedAt: new Date(),
      })
      .where(and(eq(bookings.id, input.bookingId), eq(bookings.status, "pending")))
      .returning({ id: bookings.id });
    if (!failedRows[0]) return;

    await logBookingActivity({
      bookingId: input.bookingId,
      actionType: "payment_blocked_capacity",
      performedBy: input.performedBy,
      newValue: { message: seatCheck.message },
    });
    return;
  }

  const confirmedRows = await db
    .update(bookings)
    .set({
      status: "confirmed",
      paymentStatus: "paid",
      stripePaymentIntentId: input.stripePaymentIntentId,
      expiresAt: null,
      updatedAt: new Date(),
    })
    .where(and(eq(bookings.id, input.bookingId), eq(bookings.status, "pending")))
    .returning({ id: bookings.id });
  if (!confirmedRows[0]) return;

  await logBookingActivity({
    bookingId: input.bookingId,
    actionType: "status_changed",
    performedBy: input.performedBy,
    oldValue: { status: "pending" },
    newValue: { status: "confirmed" },
  });

  try {
    await sendBookingConfirmationEmails(input.bookingId);
  } catch (err) {
    Sentry.captureException(err, {
      tags: { operation_type: "booking_confirmation_email" },
      contexts: {
        booking_lifecycle: {
          booking_id: input.bookingId,
          phase: "sendBookingConfirmationEmails",
        },
      },
    });
  }
}

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.booking_id;
  if (!bookingId) return;

  const rows = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  const booking = rows[0];
  if (!booking) return;
  if (booking.status !== "pending") return;

  const paid = await resolveCheckoutSessionPaid(session);
  if (!paid) {
    Sentry.captureMessage("checkout.session.completed: payment not settled yet — awaiting PI or async event", {
      level: "info",
      tags: { operation_type: "stripe_checkout_payment_pending" },
      extra: {
        booking_id: bookingId,
        payment_status: session.payment_status,
        stripe_session_id: session.id,
      },
    });
    return;
  }

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

  const pi =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  await confirmPendingBookingAfterSuccessfulPayment({
    bookingId,
    stripePaymentIntentId: pi,
    performedBy: "stripe_webhook:checkout.session.completed",
  });
}

export async function handleCheckoutSessionAsyncPaymentSucceeded(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.booking_id;
  if (!bookingId) return;
  const paid = await resolveCheckoutSessionPaid(session);
  if (!paid) return;

  const pi =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  await confirmPendingBookingAfterSuccessfulPayment({
    bookingId,
    stripePaymentIntentId: pi,
    performedBy: "stripe_webhook:checkout.session.async_payment_succeeded",
  });
}

export async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  const bookingId = pi.metadata?.booking_id;
  if (!bookingId) return;
  if (pi.status !== "succeeded") return;

  Sentry.getCurrentScope().setContext("booking_lifecycle", {
    operation_type: "payment_intent_succeeded_confirm",
    booking_id: bookingId,
    payment_intent_id: pi.id,
  });

  await confirmPendingBookingAfterSuccessfulPayment({
    bookingId,
    stripePaymentIntentId: pi.id,
    performedBy: "stripe_webhook:payment_intent.succeeded",
  });
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
  if (booking.status === "refunded") {
    return;
  }
  if (booking.status !== "confirmed") {
    return;
  }

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
