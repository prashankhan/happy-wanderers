import { Resend } from "resend";

import { captureEmailFailure } from "@/lib/sentry/capture";
import { db } from "@/lib/db";
import { bookings, systemJobsLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import { getSystemSettings } from "@/lib/services/system-settings";
import { DEFAULT_TZ, formatDateInTz } from "@/lib/utils/dates";

const RESEND_FALLBACK_FROM = "Happy Wanderers <onboarding@resend.dev>";

/** Runtime key read — avoids any build-time substitution of server env in some bundler configs. */
function readEmailFromEnv(): string | undefined {
  const v = process.env["EMAIL_FROM"];
  return typeof v === "string" ? v : undefined;
}

function normalizeEmailFromRaw(raw: string): string {
  let s = raw
    .replace(/^\uFEFF/, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .trim();
  s = s.replace(/^["']+|["']+$/g, "").trim();
  if (s.toLowerCase().startsWith("mailto:")) s = s.slice("mailto:".length).trim();
  return s;
}

function isValidPlainEmailAddress(email: string): boolean {
  const e = email.trim();
  if (e.includes("<") || e.includes(">") || /\s/.test(e)) return false;
  const at = e.indexOf("@");
  if (at <= 0 || at !== e.lastIndexOf("@")) return false;
  const local = e.slice(0, at);
  const domain = e.slice(at + 1);
  return (
    local.length > 0 &&
    domain.length > 0 &&
    domain.includes(".") &&
    !domain.startsWith(".") &&
    !domain.endsWith(".")
  );
}

/**
 * Resend requires `from` like `email@domain.com` or `Display Name <email@domain.com>`.
 * Production failures often come from:
 * - `EMAIL_FROM` missing or only whitespace on the server
 * - accidental JSON quotes or NBSP / zero-width characters from copy-paste (value looks right in the dashboard but fails checks here)
 * - smart/unicode angle brackets
 * - `Display <email>` stored as `<email>` only (no display name before `<`) — previously fell through to onboarding@resend.dev
 */
function resolveResendFrom(): string {
  const rawEnv = readEmailFromEnv();
  if (rawEnv == null) return RESEND_FALLBACK_FROM;

  let s = normalizeEmailFromRaw(rawEnv);
  if (s.length === 0) return RESEND_FALLBACK_FROM;

  s = s
    .replace(/\u2039/g, "<")
    .replace(/\u203a/g, ">")
    .replace(/＜/g, "<")
    .replace(/＞/g, ">");

  // `<local@domain.tld>` with no display name (dashboard paste / partial config)
  const angleOnly = s.match(/^<\s*([^\s<>]+@[^\s<>]+)\s*>$/i);
  if (angleOnly) {
    const email = angleOnly[1].trim();
    if (isValidPlainEmailAddress(email)) return email;
  }

  const bracketed = s.match(/^([^<]+)<\s*([^>\s]+@[^>\s]+)\s*>$/i);

  if (bracketed) {
    const email = bracketed[2].trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email)) return RESEND_FALLBACK_FROM;
    return s;
  }

  if (isValidPlainEmailAddress(s)) return s.trim();

  return RESEND_FALLBACK_FROM;
}

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

/** Resend Node SDK returns `{ data, error }` and does not throw on 4xx — treat `error` as failure. */
function ensureResendOk(result: { data?: unknown; error?: unknown }, context: string): void {
  if (result.error != null) {
    const err = result.error as { message?: string; name?: string };
    const msg =
      typeof err?.message === "string" && err.message.length > 0
        ? err.message
        : typeof result.error === "object"
          ? JSON.stringify(result.error)
          : String(result.error);
    throw new Error(`Resend (${context}): ${msg}`);
  }
}

export async function sendBookingConfirmationEmails(bookingId: string) {
  const settings = await getSystemSettings();
  const tz = settings.timezone || DEFAULT_TZ;
  const from = resolveResendFrom();

  const rows = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  const b = rows[0];
  if (!b || b.status !== "confirmed") return;

  if (!b.confirmationEmailSentAt) {
    const pickupTime = b.pickupTimeSnapshot;
    const dateLabel = formatDateInTz(new Date(`${b.bookingDate}T12:00:00Z`), tz, "EEEE d MMMM yyyy");
    try {
      const resend = getResend();
      const result = await resend.emails.send({
        from,
        to: b.customerEmail,
        subject: `Your booking is confirmed — Reference ${b.bookingReference}`,
        text: [
          `Hi ${b.customerFirstName},`,
          ``,
          `Your booking ${b.bookingReference} is confirmed.`,
          `Tour: ${b.tourTitleSnapshot}`,
          `Date: ${dateLabel}`,
          `Pickup: ${b.pickupLocationNameSnapshot} at ${pickupTime}`,
          `Guests: ${b.adults} adults, ${b.children} children, ${b.infants} infants`,
          `Total: ${b.currency} ${b.totalPriceSnapshot}`,
          ``,
          settings.supportEmail ? `Support: ${settings.supportEmail}` : "",
          settings.supportPhone ? `Phone: ${settings.supportPhone}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      });
      ensureResendOk(result, "customer_confirmation");
      await db
        .update(bookings)
        .set({ confirmationEmailSentAt: new Date(), updatedAt: new Date() })
        .where(eq(bookings.id, bookingId));
    } catch (e) {
      captureEmailFailure(e, {
        email_type: "confirmation",
        booking_id: bookingId,
        recipient_email: b.customerEmail,
      });
      await db.insert(systemJobsLog).values({
        jobName: "send_confirmation_email",
        runAt: new Date(),
        status: "failed",
        errorMessage: e instanceof Error ? e.message : "unknown",
      });
    }
  }

  const afterCustomer = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  const bookingFresh = afterCustomer[0];
  if (!bookingFresh || bookingFresh.status !== "confirmed") return;

  if (settings.adminAlertEmail && !bookingFresh.adminAlertSentAt) {
    try {
      const resend = getResend();
      const result = await resend.emails.send({
        from,
        to: settings.adminAlertEmail,
        subject: `New confirmed booking ${bookingFresh.bookingReference}`,
        text: [
          `Booking ${bookingFresh.bookingReference}`,
          `Tour: ${bookingFresh.tourTitleSnapshot}`,
          `Date: ${bookingFresh.bookingDate}`,
          `Pickup: ${bookingFresh.pickupLocationNameSnapshot} ${bookingFresh.pickupTimeSnapshot}`,
          `Guests: ${bookingFresh.guestTotal}`,
          `Customer: ${bookingFresh.customerFirstName} ${bookingFresh.customerLastName}`,
          `Phone: ${bookingFresh.customerPhone}`,
          bookingFresh.customerNotes ? `Notes: ${bookingFresh.customerNotes}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      });
      ensureResendOk(result, "admin_alert");
      await db
        .update(bookings)
        .set({ adminAlertSentAt: new Date(), updatedAt: new Date() })
        .where(eq(bookings.id, bookingId));
    } catch (e) {
      captureEmailFailure(e, {
        email_type: "admin_alert",
        booking_id: bookingId,
        recipient_email: settings.adminAlertEmail ?? undefined,
      });
      await db.insert(systemJobsLog).values({
        jobName: "send_admin_alert_email",
        runAt: new Date(),
        status: "failed",
        errorMessage: e instanceof Error ? e.message : "unknown",
      });
    }
  }
}

export async function sendCancellationEmail(bookingId: string) {
  const settings = await getSystemSettings();
  const from = resolveResendFrom();
  const rows = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  const b = rows[0];
  if (!b) return;
  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from,
      to: b.customerEmail,
      subject: `Booking cancelled — ${b.bookingReference}`,
      text: `Your booking ${b.bookingReference} for ${b.tourTitleSnapshot} on ${b.bookingDate} has been cancelled.\n\n${settings.supportEmail ? `Contact: ${settings.supportEmail}` : ""}`,
    });
    ensureResendOk(result, "cancellation");
  } catch (e) {
    captureEmailFailure(e, {
      email_type: "cancellation",
      booking_id: bookingId,
      recipient_email: b.customerEmail,
    });
    await db.insert(systemJobsLog).values({
      jobName: "send_cancellation_email",
      runAt: new Date(),
      status: "failed",
      errorMessage: e instanceof Error ? e.message : "unknown",
    });
  }
}

export async function sendRefundEmail(bookingId: string) {
  const settings = await getSystemSettings();
  const from = resolveResendFrom();
  const rows = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  const b = rows[0];
  if (!b) return;
  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from,
      to: b.customerEmail,
      subject: `Refund processed — ${b.bookingReference}`,
      text: `A refund has been initiated for booking ${b.bookingReference}. Amount: ${b.currency} ${b.totalPriceSnapshot}.\n\nProcessing times vary by bank.\n\n${settings.supportEmail ? `Contact: ${settings.supportEmail}` : ""}`,
    });
    ensureResendOk(result, "refund");
  } catch (e) {
    captureEmailFailure(e, {
      email_type: "refund",
      booking_id: bookingId,
      recipient_email: b.customerEmail,
    });
    await db.insert(systemJobsLog).values({
      jobName: "send_refund_email",
      runAt: new Date(),
      status: "failed",
      errorMessage: e instanceof Error ? e.message : "unknown",
    });
  }
}

export async function sendContactAlert(input: {
  name: string;
  email: string;
  phone?: string | null;
  topic?: string | null;
  message: string;
}) {
  const settings = await getSystemSettings();
  if (!settings.adminAlertEmail) return;
  const from = resolveResendFrom();
  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from,
      to: settings.adminAlertEmail,
      subject: `Contact: ${input.topic ?? "General"}`,
      text: `From: ${input.name} <${input.email}>\nPhone: ${input.phone ?? "—"}\n\n${input.message}`,
    });
    ensureResendOk(result, "contact_notification");
  } catch (e) {
    captureEmailFailure(e, {
      email_type: "contact_notification",
      recipient_email: settings.adminAlertEmail,
    });
  }
}
