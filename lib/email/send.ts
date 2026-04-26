import { Resend } from "resend";

import { captureEmailFailure } from "@/lib/sentry/capture";
import { db } from "@/lib/db";
import { bookings, systemJobsLog, tours } from "@/lib/db/schema";
import { parseTourItineraryDays } from "@/lib/types/tour-itinerary";
import { eq } from "drizzle-orm";

import { getSystemSettings } from "@/lib/services/system-settings";
import { DEFAULT_TZ, formatDateInTz } from "@/lib/utils/dates";

const RESEND_FALLBACK_FROM = "Happy Wanderers <onboarding@resend.dev>";

function bookingSpanIso(b: {
  tourStartDate?: unknown;
  tourEndDate?: unknown;
  bookingDate: unknown;
}): { start: string; end: string } {
  const start = String(b.tourStartDate ?? b.bookingDate).slice(0, 10);
  const end = String(b.tourEndDate ?? b.bookingDate).slice(0, 10);
  return { start, end };
}

function formatBookingDatesForCustomerEmail(
  b: { tourStartDate?: unknown; tourEndDate?: unknown; bookingDate: unknown },
  tz: string
): string {
  const { start, end } = bookingSpanIso(b);
  if (start === end) {
    return formatDateInTz(new Date(`${start}T12:00:00Z`), tz, "EEEE d MMMM yyyy");
  }
  return `Departure ${formatDateInTz(new Date(`${start}T12:00:00Z`), tz, "EEEE d MMMM yyyy")} — Return ${formatDateInTz(new Date(`${end}T12:00:00Z`), tz, "EEEE d MMMM yyyy")}`;
}

function formatBookingDatesPlain(b: {
  tourStartDate?: unknown;
  tourEndDate?: unknown;
  bookingDate: unknown;
}): string {
  const { start, end } = bookingSpanIso(b);
  return start === end ? start : `${start} to ${end}`;
}

function buildTourItineraryEmailLines(
  raw: unknown,
  isMultiDay: boolean,
  durationDays: number
): string[] {
  const journey = Boolean(isMultiDay) && Math.max(1, durationDays) > 1;
  if (!journey) return [];
  const days = parseTourItineraryDays(raw);
  if (days.length === 0) return [];
  const lines: string[] = ["", "Itinerary pickup schedule:"];
  for (const d of days) {
    lines.push(`Day ${d.day_number} pickup: ${d.pickup_location} ${d.pickup_time}`);
    if (d.title.trim()) lines.push(`  ${d.title}`);
    if (d.summary.trim()) {
      for (const ln of d.summary.trim().split("\n")) lines.push(`  ${ln}`);
    }
  }
  return lines;
}

async function loadTourItineraryEmailLines(tourId: string): Promise<string[]> {
  const rows = await db
    .select({
      itineraryDays: tours.itineraryDays,
      isMultiDay: tours.isMultiDay,
      durationDays: tours.durationDays,
    })
    .from(tours)
    .where(eq(tours.id, tourId))
    .limit(1);
  const t = rows[0];
  if (!t) return [];
  return buildTourItineraryEmailLines(t.itineraryDays, t.isMultiDay, t.durationDays ?? 1);
}

/** Runtime key read — avoids any build-time substitution of server env in some bundler configs. */
function readEmailFromEnv(): string | undefined {
  const v = process.env["EMAIL_FROM"];
  return typeof v === "string" ? v : undefined;
}

function readResendFromEnv(): string | undefined {
  const v = process.env["RESEND_FROM"];
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

/** Domains Resend will never verify — common seed/placeholder values must not become `from`. */
function emailUsesDisallowedResendSenderDomain(email: string): boolean {
  const e = email.trim().toLowerCase();
  const at = e.lastIndexOf("@");
  if (at < 1 || at === e.length - 1) return true;
  const domain = e.slice(at + 1);
  if (domain === "example.com" || domain === "example.org" || domain === "example.net") return true;
  if (domain.endsWith(".example.com") || domain.endsWith(".example.org") || domain.endsWith(".example.net"))
    return true;
  if (domain === "localhost" || domain.endsWith(".localhost")) return true;
  if (domain === "invalid" || domain.endsWith(".invalid")) return true;
  return false;
}

function isValidPlainEmailAddress(email: string): boolean {
  const e = email.trim();
  if (e.includes("<") || e.includes(">") || /\s/.test(e)) return false;
  const at = e.indexOf("@");
  if (at <= 0 || at !== e.lastIndexOf("@")) return false;
  const local = e.slice(0, at);
  const domain = e.slice(at + 1);
  if (
    local.length === 0 ||
    domain.length === 0 ||
    !domain.includes(".") ||
    domain.startsWith(".") ||
    domain.endsWith(".")
  ) {
    return false;
  }
  if (emailUsesDisallowedResendSenderDomain(e)) return false;
  return true;
}

/**
 * Parse a single `from` candidate. Returns null if empty or not a valid Resend `from` shape.
 * Order for production is handled in {@link resolveResendFromForSend} (DB first, then env).
 */
function parseResendFromRaw(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== "string") return null;

  let s = normalizeEmailFromRaw(raw);
  if (s.length === 0) return null;

  s = s
    .replace(/\u2039/g, "<")
    .replace(/\u203a/g, ">")
    .replace(/＜/g, "<")
    .replace(/＞/g, ">");

  const angleOnly = s.match(/^<\s*([^\s<>]+@[^\s<>]+)\s*>$/i);
  if (angleOnly) {
    const email = angleOnly[1].trim();
    if (isValidPlainEmailAddress(email)) return email;
  }

  const bracketed = s.match(/^([^<]+)<\s*([^>\s]+@[^>\s]+)\s*>$/i);

  if (bracketed) {
    const email = bracketed[2].trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email)) return null;
    if (emailUsesDisallowedResendSenderDomain(email)) return null;
    return s;
  }

  if (isValidPlainEmailAddress(s)) return s.trim();

  return null;
}

interface ResendFromSettingsSlice {
  resendFromEmail: string | null;
}

/**
 * Resend `from`: prefer DB (`system_settings.resend_from_email`) so production does not depend on
 * `process.env.EMAIL_FROM` being visible inside the serverless bundle, then `EMAIL_FROM`, then `RESEND_FROM`.
 */
function resolveResendFromForSend(settings: ResendFromSettingsSlice): string {
  return (
    parseResendFromRaw(settings.resendFromEmail) ??
    parseResendFromRaw(readEmailFromEnv()) ??
    parseResendFromRaw(readResendFromEnv()) ??
    RESEND_FALLBACK_FROM
  );
}

function getResend(): Resend {
  const key = process.env["RESEND_API_KEY"];
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
  const from = resolveResendFromForSend(settings);

  const rows = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  const b = rows[0];
  if (!b || b.status !== "confirmed") return;

  if (!b.confirmationEmailSentAt) {
    const pickupTime = b.pickupTimeSnapshot;
    const dateLabel = formatBookingDatesForCustomerEmail(b, tz);
    const itineraryLines = await loadTourItineraryEmailLines(b.tourId);
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
          ...itineraryLines,
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
    const adminItineraryLines = await loadTourItineraryEmailLines(bookingFresh.tourId);
    try {
      const resend = getResend();
      const result = await resend.emails.send({
        from,
        to: settings.adminAlertEmail,
        subject: `New confirmed booking ${bookingFresh.bookingReference}`,
        text: [
          `Booking ${bookingFresh.bookingReference}`,
          `Tour: ${bookingFresh.tourTitleSnapshot}`,
          `Date: ${formatBookingDatesPlain(bookingFresh)}`,
          ...adminItineraryLines,
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
  const from = resolveResendFromForSend(settings);
  const rows = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  const b = rows[0];
  if (!b) return;
  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from,
      to: b.customerEmail,
      subject: `Booking cancelled — ${b.bookingReference}`,
      text: `Your booking ${b.bookingReference} for ${b.tourTitleSnapshot} on ${formatBookingDatesPlain(b)} has been cancelled.\n\n${settings.supportEmail ? `Contact: ${settings.supportEmail}` : ""}`,
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
  const from = resolveResendFromForSend(settings);
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
  try {
    const settings = await getSystemSettings();
    if (!settings.adminAlertEmail) return;
    const from = resolveResendFromForSend(settings);
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
      recipient_email: undefined,
    });
  }
}
