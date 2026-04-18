import type { ZodError } from "zod";

/** First Zod issue message, or a short combined line for admins (toast-friendly). */
export function zodErrorToApiMessage(error: ZodError, fallback = "Check the form and try again."): string {
  const issues = error.issues;
  if (issues.length === 0) return fallback;
  if (issues.length === 1) return issues[0].message;
  return issues.map((i) => i.message).join(" ");
}
