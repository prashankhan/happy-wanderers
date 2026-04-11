import type { ErrorEvent } from "@sentry/core";

/** Substrings of Error.message we treat as expected business-rule outcomes (not system faults). */
const IGNORED_ERROR_MESSAGE_PARTS = [
  "Booking cutoff has passed",
  "Not enough seats available",
  "Capacity exceeded for this date",
  "Capacity cannot be lower than seats already held",
  "Tour not available",
  "Invalid pickup location",
  "Guest count required",
  "Invalid departure",
  "Booking cannot be edited",
  "Already finalised",
  "Only admins can set hero images",
  "BLOB_READ_WRITE_TOKEN is not configured",
  "Invalid image id for this tour",
  "image_ids must include every active image",
  "Image not found",
  "No Stripe payment to refund",
  "Only confirmed paid bookings can be refunded via Stripe",
];

function originalException(hint: unknown): unknown {
  if (!hint || typeof hint !== "object") return undefined;
  if (!("originalException" in hint)) return undefined;
  return (hint as { originalException: unknown }).originalException;
}

function shouldDropForMessage(message: string): boolean {
  const m = message.toLowerCase();
  for (const part of IGNORED_ERROR_MESSAGE_PARTS) {
    if (message.includes(part) || m.includes(part.toLowerCase())) return true;
  }
  return false;
}

/**
 * Drops expected validation and business-rule errors; keeps unexpected failures.
 */
export function sentryBeforeSend(event: ErrorEvent, hint: unknown): ErrorEvent | null {
  const err = originalException(hint);
  if (err && typeof err === "object" && err !== null && "name" in err) {
    const name = String((err as { name: unknown }).name);
    if (name === "ZodError") return null;
  }
  if (err instanceof Error && shouldDropForMessage(err.message)) return null;

  const values = event.exception?.values;
  const first = values?.[0];
  const msg = first?.value;
  if (typeof msg === "string" && shouldDropForMessage(msg)) return null;

  return event;
}
