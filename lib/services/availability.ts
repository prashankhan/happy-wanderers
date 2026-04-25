import { and, eq, gt, gte, isNotNull, lte, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  availabilityOverrides,
  availabilityRules,
  bookings,
  departureLocations,
  tours,
} from "@/lib/db/schema";
import {
  calendarDateTodayInTimeZone,
  combineDateAndPickupTime,
  DEFAULT_TZ,
  formatDateInTz,
} from "@/lib/utils/dates";
import { getSystemSettings } from "@/lib/services/system-settings";

export type CapacitySource = "override" | "weekday_rule" | "tour_default";
export type CutoffSource = "override" | "tour" | "system";

/** Maps engine output to calendar UI states (see docs/availability-engine.md). */
export type PublicCalendarState =
  | "available"
  | "limited"
  | "sold_out"
  | "cutoff_passed"
  | "unavailable";

export interface AvailabilityDayResult {
  date: string;
  isAvailable: boolean;
  availableSeats: number;
  capacityTotal: number;
  seatsReserved: number;
  cutoffPassed: boolean;
  effectiveCutoffTime: string;
  sourceOfCapacity: CapacitySource;
  sourceOfCutoff: CutoffSource;
  overrideExists: boolean;
  minimumAdvanceBookingDays: number;
  minimumAdvanceBlocked: boolean;
  earliestBookableDate: string;
}

function addDaysToIsoDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

export function getMinimumAdvanceWindowForDate(input: {
  bookingDate: string;
  minimumAdvanceBookingDays: number;
  timezone: string;
}): { blocked: boolean; earliestBookableDate: string } {
  const tz = input.timezone.trim() || DEFAULT_TZ;
  const days = Math.max(0, input.minimumAdvanceBookingDays);
  const todayInTz = calendarDateTodayInTimeZone(tz);
  const earliestBookableDate = addDaysToIsoDate(todayInTz, days);
  return {
    blocked: input.bookingDate < earliestBookableDate,
    earliestBookableDate,
  };
}

function weekdayFromDateStr(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCDay();
}

export function derivePublicCalendarState(d: AvailabilityDayResult): PublicCalendarState {
  if (d.cutoffPassed) return "cutoff_passed";
  if (!d.isAvailable) {
    if (d.capacityTotal > 0 && d.seatsReserved >= d.capacityTotal) return "sold_out";
    return "unavailable";
  }
  if (d.availableSeats <= 0) return "sold_out";
  if (d.capacityTotal > 0 && d.availableSeats / d.capacityTotal <= 0.25) return "limited";
  return "available";
}

function computeAvailabilityDay(input: {
  bookingDate: string;
  pickupTime: string;
  now: Date;
  tour: typeof tours.$inferSelect;
  settings: { timezone: string; defaultCutoffHours: number };
  override: (typeof availabilityOverrides.$inferSelect) | undefined;
  weekdayRule: (typeof availabilityRules.$inferSelect) | undefined;
  seatsReserved: number;
}): AvailabilityDayResult {
  const { bookingDate, pickupTime, now, tour, settings, override, weekdayRule, seatsReserved } = input;
  const tz = settings.timezone || DEFAULT_TZ;
  const minimumAdvanceBookingDays = Math.max(0, tour.minimumAdvanceBookingDays ?? 0);
  const minimumAdvance = getMinimumAdvanceWindowForDate({
    bookingDate,
    minimumAdvanceBookingDays,
    timezone: tz,
  });

  let sourceOfCapacity: CapacitySource = "tour_default";
  let capacityTotal = tour.defaultCapacity;
  let isAvailable = true;

  if (override) {
    isAvailable = override.isAvailable;
    if (override.capacityOverride != null) {
      capacityTotal = override.capacityOverride;
      sourceOfCapacity = "override";
    } else if (weekdayRule?.defaultCapacity != null) {
      capacityTotal = weekdayRule.defaultCapacity;
      sourceOfCapacity = "weekday_rule";
    } else {
      capacityTotal = tour.defaultCapacity;
      sourceOfCapacity = "tour_default";
    }
  } else if (weekdayRule) {
    sourceOfCapacity = weekdayRule.defaultCapacity != null ? "weekday_rule" : "tour_default";
    capacityTotal = weekdayRule.defaultCapacity ?? tour.defaultCapacity;
    isAvailable = weekdayRule.isActive;
  }

  const systemDefault = settings.defaultCutoffHours;
  let sourceOfCutoff: CutoffSource;
  let cutoffHours: number;
  if (override?.cutoffOverrideHours != null) {
    cutoffHours = override.cutoffOverrideHours;
    sourceOfCutoff = "override";
  } else {
    cutoffHours = tour.bookingCutoffHours ?? systemDefault;
    sourceOfCutoff = tour.bookingCutoffHours != null ? "tour" : "system";
  }

  const departure = combineDateAndPickupTime(bookingDate, pickupTime, tz);
  const cutoffAt = new Date(departure.getTime() - cutoffHours * 60 * 60 * 1000);
  const cutoffPassed = now.getTime() >= cutoffAt.getTime();

  const availableSeats = Math.max(0, capacityTotal - seatsReserved);

  if (!isAvailable) {
    return {
      date: bookingDate,
      isAvailable: false,
      availableSeats: 0,
      capacityTotal,
      seatsReserved,
      cutoffPassed,
      effectiveCutoffTime: formatDateInTz(cutoffAt, tz, "yyyy-MM-dd'T'HH:mm:ssXXX"),
      sourceOfCapacity,
      sourceOfCutoff,
      overrideExists: Boolean(override),
      minimumAdvanceBookingDays,
      minimumAdvanceBlocked: minimumAdvance.blocked,
      earliestBookableDate: minimumAdvance.earliestBookableDate,
    };
  }

  const effectiveAvailable = minimumAdvance.blocked ? false : cutoffPassed ? false : availableSeats > 0;
  return {
    date: bookingDate,
    isAvailable: effectiveAvailable && !cutoffPassed,
    availableSeats: cutoffPassed ? 0 : availableSeats,
    capacityTotal,
    seatsReserved,
    cutoffPassed,
    effectiveCutoffTime: formatDateInTz(cutoffAt, tz, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    sourceOfCapacity,
    sourceOfCutoff,
    overrideExists: Boolean(override),
    minimumAdvanceBookingDays,
    minimumAdvanceBlocked: minimumAdvance.blocked,
    earliestBookableDate: minimumAdvance.earliestBookableDate,
  };
}

export async function countAllocatedSeats(tourId: string, bookingDateStr: string): Promise<number> {
  const now = new Date();
  const rows = await db
    .select({ sum: sql<number>`coalesce(sum(${bookings.guestTotal}), 0)` })
    .from(bookings)
    .where(
      and(
        eq(bookings.tourId, tourId),
        sql`${bookings.bookingDate}::text = ${bookingDateStr}`,
        or(
          eq(bookings.status, "confirmed"),
          and(
            eq(bookings.status, "pending"),
            isNotNull(bookings.expiresAt),
            gt(bookings.expiresAt, now)
          )
        )
      )
    );
  return Number(rows[0]?.sum ?? 0);
}

export async function resolveDayAvailability(input: {
  tourId: string;
  bookingDate: string;
  pickupTime: string;
  now?: Date;
}): Promise<AvailabilityDayResult> {
  const now = input.now ?? new Date();
  const settings = await getSystemSettings();

  const tourRows = await db
    .select()
    .from(tours)
    .where(and(eq(tours.id, input.tourId), sql`${tours.deletedAt} IS NULL`))
    .limit(1);
  const tour = tourRows[0];
  if (!tour) {
    throw new Error("Tour not found");
  }

  const overrideRows = await db
    .select()
    .from(availabilityOverrides)
    .where(
      and(
        eq(availabilityOverrides.tourId, input.tourId),
        sql`${availabilityOverrides.date}::text = ${input.bookingDate}`
      )
    )
    .limit(1);
  const override = overrideRows[0];

  const wd = weekdayFromDateStr(input.bookingDate);
  const ruleRows = await db
    .select()
    .from(availabilityRules)
    .where(and(eq(availabilityRules.tourId, input.tourId), eq(availabilityRules.weekday, wd)))
    .limit(1);
  const weekdayRule = ruleRows[0];

  const seatsReserved = await countAllocatedSeats(input.tourId, input.bookingDate);

  return computeAvailabilityDay({
    bookingDate: input.bookingDate,
    pickupTime: input.pickupTime,
    now,
    tour,
    settings,
    override,
    weekdayRule,
    seatsReserved,
  });
}

export async function validateSeatsForDate(input: {
  tourId: string;
  bookingDate: string;
  pickupTime: string;
  requestedGuests: number;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await resolveDayAvailability({
    tourId: input.tourId,
    bookingDate: input.bookingDate,
    pickupTime: input.pickupTime,
  });
  if (res.minimumAdvanceBlocked) {
    return {
      ok: false,
      message: `This tour requires at least ${res.minimumAdvanceBookingDays} day${res.minimumAdvanceBookingDays === 1 ? "" : "s"} advance booking.`,
    };
  }
  if (res.cutoffPassed) return { ok: false, message: "Booking cutoff has passed" };
  if (!res.isAvailable || res.availableSeats < input.requestedGuests) {
    return { ok: false, message: "Not enough seats available" };
  }
  return { ok: true };
}

/**
 * Validates capacity when confirming an existing **pending** hold after payment.
 * Must NOT use {@link validateSeatsForDate} here: that compares `availableSeats >= guestTotal`,
 * but `availableSeats` is net of this hold, so a full-capacity pending booking would read as 0
 * and incorrectly block confirmation after Stripe succeeds.
 */
export async function validateCapacityForConfirmingPendingHold(input: {
  tourId: string;
  bookingDate: string;
  pickupTime: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await resolveDayAvailability({
    tourId: input.tourId,
    bookingDate: input.bookingDate,
    pickupTime: input.pickupTime,
  });
  if (res.cutoffPassed) return { ok: false, message: "Booking cutoff has passed" };

  const allocated = await countAllocatedSeats(input.tourId, input.bookingDate);
  if (allocated > res.capacityTotal) {
    return { ok: false, message: "Capacity exceeded for this date" };
  }

  return { ok: true };
}

export async function getDefaultPickupTime(
  tourId: string,
  departureLocationId: string
): Promise<string> {
  const loc = await db
    .select({ pickupTime: departureLocations.pickupTime })
    .from(departureLocations)
    .where(
      and(eq(departureLocations.id, departureLocationId), eq(departureLocations.tourId, tourId))
    )
    .limit(1);
  return loc[0]?.pickupTime ?? "07:00";
}

function dateStringFromBookingDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

export async function getMonthAvailability(input: {
  tourId: string;
  month: string;
  departureLocationId?: string;
}): Promise<AvailabilityDayResult[]> {
  const [y, m] = input.month.split("-").map(Number);
  const start = `${input.month}-01`;
  const last = new Date(Date.UTC(y, m, 0));
  const end = `${input.month}-${String(last.getUTCDate()).padStart(2, "0")}`;

  let pickupTime = "07:00";
  if (input.departureLocationId) {
    pickupTime = await getDefaultPickupTime(input.tourId, input.departureLocationId);
  } else {
    const def = await db
      .select({ pickupTime: departureLocations.pickupTime })
      .from(departureLocations)
      .where(
        and(
          eq(departureLocations.tourId, input.tourId),
          eq(departureLocations.isDefault, true),
          eq(departureLocations.isActive, true)
        )
      )
      .limit(1);
    pickupTime = def[0]?.pickupTime ?? "07:00";
  }

  const now = new Date();
  const settings = await getSystemSettings();

  const tourRows = await db
    .select()
    .from(tours)
    .where(and(eq(tours.id, input.tourId), sql`${tours.deletedAt} IS NULL`))
    .limit(1);
  const tour = tourRows[0];
  if (!tour) {
    throw new Error("Tour not found");
  }

  const overrideRows = await db
    .select()
    .from(availabilityOverrides)
    .where(
      and(
        eq(availabilityOverrides.tourId, input.tourId),
        gte(availabilityOverrides.date, start),
        lte(availabilityOverrides.date, end)
      )
    );
  const overrideByDate = new Map(
    overrideRows.map((o) => [dateStringFromBookingDate(o.date), o])
  );

  const ruleRows = await db
    .select()
    .from(availabilityRules)
    .where(eq(availabilityRules.tourId, input.tourId));
  const ruleByWeekday = new Map(ruleRows.map((r) => [r.weekday, r]));

  const allocatedRows = await db
    .select({
      bookingDate: bookings.bookingDate,
      sum: sql<string>`coalesce(sum(${bookings.guestTotal}), 0)::text`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.tourId, input.tourId),
        gte(bookings.bookingDate, start),
        lte(bookings.bookingDate, end),
        or(
          eq(bookings.status, "confirmed"),
          and(
            eq(bookings.status, "pending"),
            isNotNull(bookings.expiresAt),
            gt(bookings.expiresAt, now)
          )
        )
      )
    )
    .groupBy(bookings.bookingDate);

  const allocatedByDate = new Map(
    allocatedRows.map((r) => [dateStringFromBookingDate(r.bookingDate), Number(r.sum)])
  );

  const days: string[] = [];
  const cur = new Date(`${start}T00:00:00Z`);
  const endD = new Date(`${end}T00:00:00Z`);
  while (cur <= endD) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return days.map((d) => {
    const wd = weekdayFromDateStr(d);
    return computeAvailabilityDay({
      bookingDate: d,
      pickupTime,
      now,
      tour,
      settings,
      override: overrideByDate.get(d),
      weekdayRule: ruleByWeekday.get(wd),
      seatsReserved: allocatedByDate.get(d) ?? 0,
    });
  });
}

export async function confirmedGuestsOnDate(tourId: string, bookingDateStr: string) {
  const rows = await db
    .select({ sum: sql<number>`coalesce(sum(${bookings.guestTotal}), 0)` })
    .from(bookings)
    .where(
      and(
        eq(bookings.tourId, tourId),
        sql`${bookings.bookingDate}::text = ${bookingDateStr}`,
        eq(bookings.status, "confirmed")
      )
    );
  return Number(rows[0]?.sum ?? 0);
}
