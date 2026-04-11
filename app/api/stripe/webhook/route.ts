import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/client";
import {
  handleChargeRefunded,
  handleCheckoutSessionCompleted,
  handlePaymentIntentFailed,
  insertStripeEventReceived,
  markStripeEventFailed,
  markStripeEventProcessed,
  wasStripeEventProcessed,
} from "@/lib/services/stripe-webhook";

export const runtime = "nodejs";

function addStripeWebhookBreadcrumb(event: Stripe.Event): void {
  let stripe_session_id: string | undefined;
  let payment_intent_id: string | undefined;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    stripe_session_id = session.id;
    const pi = session.payment_intent;
    payment_intent_id = typeof pi === "string" ? pi : pi?.id;
  } else if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    payment_intent_id = pi.id;
  } else if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const pi = charge.payment_intent;
    payment_intent_id = typeof pi === "string" ? pi : pi?.id;
  }

  Sentry.addBreadcrumb({
    category: "stripe.webhook",
    type: "default",
    level: "info",
    message: event.type,
    data: {
      event_type: event.type,
      stripe_session_id,
      payment_intent_id,
    },
  });
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    Sentry.captureMessage("Stripe webhook: STRIPE_WEBHOOK_SECRET not configured", {
      level: "error",
      tags: { operation_type: "stripe_webhook_event" },
    });
    return NextResponse.json({ success: false, message: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const hdrs = await headers();
  const sig = hdrs.get("stripe-signature");
  if (!sig) {
    Sentry.captureMessage("Stripe webhook: missing stripe-signature header", {
      level: "warning",
      tags: { operation_type: "stripe_webhook_signature" },
    });
    return NextResponse.json({ success: false, message: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    Sentry.captureException(err, {
      tags: { operation_type: "stripe_webhook_signature" },
      contexts: {
        stripe_webhook: { phase: "signature_verification" },
      },
    });
    return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
  }

  Sentry.getCurrentScope().setContext("stripe_webhook_event", {
    stripe_event_id: event.id,
    event_type: event.type,
  });
  Sentry.getCurrentScope().setTag("operation_type", "stripe_webhook_event");

  addStripeWebhookBreadcrumb(event);

  if (await wasStripeEventProcessed(event.id)) {
    return NextResponse.json({ received: true });
  }

  try {
    await insertStripeEventReceived(event);
  } catch (err) {
    if (await wasStripeEventProcessed(event.id)) {
      return NextResponse.json({ received: true });
    }
    Sentry.captureException(err, {
      tags: { operation_type: "stripe_webhook_duplicate_or_insert" },
      contexts: {
        stripe_webhook: {
          phase: "event_insert",
          stripe_event_id: event.id,
          event_type: event.type,
        },
      },
    });
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      default:
        break;
    }
    await markStripeEventProcessed(event.id);
  } catch (err) {
    await markStripeEventFailed(event.id);
    Sentry.captureException(err, {
      tags: { operation_type: "stripe_webhook_processing" },
      contexts: {
        stripe_webhook: {
          phase: "handler",
          stripe_event_id: event.id,
          event_type: event.type,
        },
      },
    });
    return NextResponse.json({ success: false, message: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
