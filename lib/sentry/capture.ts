import * as Sentry from "@sentry/nextjs";

function isResendTestingRecipientRestriction(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("only send testing emails") ||
    msg.includes("verify a domain at resend.com/domains")
  );
}

function isResendSenderDomainError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("domain is not verified") ||
    msg.includes("add and verify your domain on https://resend.com/domains")
  );
}

export function captureEmailFailure(
  error: unknown,
  ctx: {
    email_type: string;
    booking_id?: string;
    recipient_email?: string;
  }
): void {
  const fingerprint = {
    tags: { email_type: ctx.email_type },
    contexts: {
      email: {
        email_type: ctx.email_type,
        booking_id: ctx.booking_id,
        recipient_email: ctx.recipient_email,
      },
    },
  };

  // Resend rejects non-owner recipients until the sender domain is verified; not an app bug.
  if (isResendTestingRecipientRestriction(error)) {
    const message = error instanceof Error ? error.message : String(error);
    Sentry.captureMessage(message, { level: "warning", ...fingerprint });
    return;
  }

  // Misconfigured or placeholder `from` domain (e.g. example.com); fix in Admin → Settings or env.
  if (isResendSenderDomainError(error)) {
    const message = error instanceof Error ? error.message : String(error);
    Sentry.captureMessage(message, { level: "warning", ...fingerprint });
    return;
  }

  Sentry.captureException(error, fingerprint);
}

export function captureJobFailure(
  error: unknown,
  ctx: {
    job_name: string;
    job_execution_time_ms?: number;
    affected_booking_ids?: string[];
  }
): void {
  Sentry.captureException(error, {
    tags: { job_name: ctx.job_name },
    contexts: {
      background_job: {
        job_name: ctx.job_name,
        job_execution_time_ms: ctx.job_execution_time_ms,
        affected_booking_ids: ctx.affected_booking_ids,
      },
    },
  });
}

export function captureMediaUploadFailure(
  error: unknown,
  ctx: { tour_id: string; operation_type?: string }
): void {
  Sentry.captureException(error, {
    tags: { operation_type: ctx.operation_type ?? "media_upload" },
    contexts: { media: { tour_id: ctx.tour_id } },
  });
}
