import * as Sentry from "@sentry/nextjs";

export interface AdminOperationContext {
  operation_type: string;
  admin_user_id?: string | null;
  tour_id?: string;
  booking_id?: string;
  /** Booking date or YYYY-MM month key depending on route */
  date?: string;
  month?: string;
}

/**
 * Attach admin route metadata to the current scope so automatic error capture includes it.
 */
export function setAdminOperationContext(ctx: AdminOperationContext): void {
  Sentry.getCurrentScope().setContext("admin_operation", {
    operation_type: ctx.operation_type,
    admin_user_id: ctx.admin_user_id ?? undefined,
    tour_id: ctx.tour_id,
    booking_id: ctx.booking_id,
    date: ctx.date,
    month: ctx.month,
  });
  Sentry.getCurrentScope().setTag("operation_type", ctx.operation_type);
}

export interface AvailabilityRequestContext {
  operation_type: string;
  tour_id: string;
  month?: string;
  departure_location_id?: string;
}

export function setAvailabilityRequestContext(ctx: AvailabilityRequestContext): void {
  Sentry.getCurrentScope().setContext("availability", {
    operation_type: ctx.operation_type,
    tour_id: ctx.tour_id,
    month: ctx.month,
    departure_location_id: ctx.departure_location_id,
  });
  Sentry.getCurrentScope().setTag("operation_type", ctx.operation_type);
}
