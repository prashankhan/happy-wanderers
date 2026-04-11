import * as Sentry from "@sentry/nextjs";

export function captureEmailFailure(
  error: unknown,
  ctx: {
    email_type: string;
    booking_id?: string;
    recipient_email?: string;
  }
): void {
  Sentry.captureException(error, {
    tags: { email_type: ctx.email_type },
    contexts: {
      email: {
        email_type: ctx.email_type,
        booking_id: ctx.booking_id,
        recipient_email: ctx.recipient_email,
      },
    },
  });
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
