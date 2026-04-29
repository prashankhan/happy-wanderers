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
  addCalendarDaysIso,
  calendarDateTodayInTimeZone,
  combineDateAndPickupTime,
  DEFAULT_TZ,
  formatDateInTz,
  iterateIsoDateRangeInclusive,
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

export function getMinimumAdvanceWindowForDate(input: {
  bookingDate: string;
  minimumAdvanceBookingDays: number;
  timezone: string;
}): { blocked: boolean; earliestBookableDate: string } {
  const tz = input.timezone.trim() || DEFAULT_TZ;
  const days = Math.max(0, input.minimumAdvanceBookingDays);
  const todayInTz = calendarDateTodayInTimeZone(tz);
  const earliestBookableDate = addCalendarDaysIso(todayInTz, days);
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
  hasActiveBooking: boolean;
  /** When false, minimum advance is not applied (used for non-start days of a multi-day span). */
  applyMinimumAdvance?: boolean;
  /** When false, departure cutoff is not applied (used for non-start days of a multi-day span). */
  applyCutoff?: boolean;
}): AvailabilityDayResult {
  const {
    bookingDate,
    pickupTime,
    now,
    tour,
    settings,
    override,
    weekdayRule,
    seatsReserved,
    hasActiveBooking,
    applyMinimumAdvance = true,
    applyCutoff = true,
  } = input;
  const tz = settings.timezone || DEFAULT_TZ;
  const minimumAdvanceBookingDays = Math.max(0, tour.minimumAdvanceBookingDays ?? 0);
  const minimumAdvance = getMinimumAdvanceWindowForDate({
    bookingDate,
    minimumAdvanceBookingDays,
    timezone: tz,
  });
  const minimumAdvanceBlocked = applyMinimumAdvance ? minimumAdvance.blocked : false;

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
  const cutoffPassed = applyCutoff && now.getTime() >= cutoffAt.getTime();

  const availableSeats = hasActiveBooking ? 0 : Math.max(0, capacityTotal - seatsReserved);

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
      minimumAdvanceBlocked,
      earliestBookableDate: minimumAdvance.earliestBookableDate,
    };
  }

  const effectiveAvailable = minimumAdvanceBlocked
    ? false
    : cutoffPassed
      ? false
      : !hasActiveBooking && availableSeats > 0;
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
    minimumAdvanceBlocked,
    earliestBookableDate: minimumAdvance.earliestBookableDate,
  };
}

/** Guests allocated on `bookingDateStr` (any booking whose span covers this calendar day). */
export async function countAllocatedSeats(tourId: string, bookingDateStr: string): Promise<number> {
  const now = new Date();
  const rows = await db
    .select({ sum: sql<number>`coalesce(sum(${bookings.guestTotal}), 0)` })
    .from(bookings)
    .where(
      and(
        eq(bookings.tourId, tourId),
        sql`${bookings.tourStartDate}::text <= ${bookingDateStr}`,
        sql`${bookings.tourEndDate}::text >= ${bookingDateStr}`,
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

/** True when any active booking/hold already covers this date (exclusive private departure mode). */
async function hasActiveBookingOnDate(tourId: string, bookingDateStr: string): Promise<boolean> {
  const now = new Date();
  const rows = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.tourId, tourId),
        sql`${bookings.tourStartDate}::text <= ${bookingDateStr}`,
        sql`${bookings.tourEndDate}::text >= ${bookingDateStr}`,
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
    .limit(1);
  return Boolean(rows[0]);
}

function mergeMultiDayStartCell(startDate: string, spanDays: AvailabilityDayResult[]): AvailabilityDayResult {
  const first = spanDays[0]!;
  let worstIdx = 0;
  for (let i = 1; i < spanDays.length; i++) {
    if (spanDays[i]!.availableSeats < spanDays[worstIdx]!.availableSeats) worstIdx = i;
  }
  const w = spanDays[worstIdx]!;
  const mergedOpen =
    !first.minimumAdvanceBlocked &&
    !first.cutoffPassed &&
    spanDays.every((d) => d.isAvailable && d.availableSeats > 0);
  return {
    date: startDate,
    isAvailable: mergedOpen,
    availableSeats: w.availableSeats,
    capacityTotal: w.capacityTotal,
    seatsReserved: w.seatsReserved,
    cutoffPassed: first.cutoffPassed,
    effectiveCutoffTime: first.effectiveCutoffTime,
    sourceOfCapacity: w.sourceOfCapacity,
    sourceOfCutoff: first.sourceOfCutoff,
    overrideExists: spanDays.some((d) => d.overrideExists),
    minimumAdvanceBookingDays: first.minimumAdvanceBookingDays,
    minimumAdvanceBlocked: first.minimumAdvanceBlocked,
    earliestBookableDate: first.earliestBookableDate,
  };
}

export async function resolveDayAvailability(input: {
  tourId: string;
  bookingDate: string;
  pickupTime: string;
  now?: Date;
  applyMinimumAdvance?: boolean;
  applyCutoff?: boolean;
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

  const durationDays = Math.max(1, tour.durationDays ?? 1);
  const isMultiDay = Boolean(tour.isMultiDay) && durationDays > 1;

  if (!isMultiDay) {
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

    const [seatsReserved, hasActiveBooking] = await Promise.all([
      countAllocatedSeats(input.tourId, input.bookingDate),
      hasActiveBookingOnDate(input.tourId, input.bookingDate),
    ]);

    return computeAvailabilityDay({
      bookingDate: input.bookingDate,
      pickupTime: input.pickupTime,
      now,
      tour,
      settings,
      override,
      weekdayRule,
      seatsReserved,
      hasActiveBooking,
      applyMinimumAdvance: input.applyMinimumAdvance ?? true,
      applyCutoff: input.applyCutoff ?? true,
    });
  }

  const spanDates: string[] = [];
  for (let i = 0; i < durationDays; i++) {
    spanDates.push(addCalendarDaysIso(input.bookingDate, i));
  }

  const spanResults: AvailabilityDayResult[] = [];
  for (let i = 0; i < spanDates.length; i++) {
    const d = spanDates[i]!;
    const overrideRows = await db
      .select()
      .from(availabilityOverrides)
      .where(
        and(eq(availabilityOverrides.tourId, input.tourId), sql`${availabilityOverrides.date}::text = ${d}`)
      )
      .limit(1);
    const override = overrideRows[0];

    const wd = weekdayFromDateStr(d);
    const ruleRows = await db
      .select()
      .from(availabilityRules)
      .where(and(eq(availabilityRules.tourId, input.tourId), eq(availabilityRules.weekday, wd)))
      .limit(1);
    const weekdayRule = ruleRows[0];

    const [seatsReserved, hasActiveBooking] = await Promise.all([
      countAllocatedSeats(input.tourId, d),
      hasActiveBookingOnDate(input.tourId, d),
    ]);
    spanResults.push(
      computeAvailabilityDay({
        bookingDate: d,
        pickupTime: input.pickupTime,
        now,
        tour,
        settings,
        override,
        weekdayRule,
        seatsReserved,
        hasActiveBooking,
        applyMinimumAdvance: i === 0 ? (input.applyMinimumAdvance ?? true) : false,
        applyCutoff: i === 0 ? (input.applyCutoff ?? true) : false,
      })
    );
  }

  return mergeMultiDayStartCell(input.bookingDate, spanResults);
}

export async function validateSeatsForDate(input: {
  tourId: string;
  bookingDate: string;
  pickupTime: string;
  requestedGuests: number;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const tourRows = await db
    .select()
    .from(tours)
    .where(and(eq(tours.id, input.tourId), sql`${tours.deletedAt} IS NULL`))
    .limit(1);
  const tour = tourRows[0];
  if (!tour) return { ok: false, message: "Tour not found" };

  const durationDays = Math.max(1, tour.durationDays ?? 1);
  const isMultiDay = Boolean(tour.isMultiDay) && durationDays > 1;

  if (!isMultiDay) {
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
      return {
        ok: false,
        message:
          res.availableSeats > 0
            ? `Only ${res.availableSeats} seat${res.availableSeats === 1 ? "" : "s"} remaining for this date`
            : "No seats remaining for this date",
      };
    }
    return { ok: true };
  }

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
    return {
      ok: false,
      message:
        res.availableSeats > 0
          ? `Only ${res.availableSeats} seat${res.availableSeats === 1 ? "" : "s"} remaining across the full journey dates`
          : "No seats remaining across the full journey dates",
    };
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
  tourStartDate: string;
  tourEndDate: string;
  pickupTime: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const dates = iterateIsoDateRangeInclusive(input.tourStartDate, input.tourEndDate);
  for (let i = 0; i < dates.length; i++) {
    const d = dates[i]!;
    const res = await resolveDayAvailability({
      tourId: input.tourId,
      bookingDate: d,
      pickupTime: input.pickupTime,
      applyMinimumAdvance: i === 0,
      applyCutoff: i === 0,
    });
    if (i === 0 && res.cutoffPassed) return { ok: false, message: "Booking cutoff has passed" };

    const allocated = await countAllocatedSeats(input.tourId, d);
    if (allocated > res.capacityTotal) {
      return { ok: false, message: "Capacity exceeded for this date" };
    }
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

function buildAllocatedByDateMap(input: {
  tourId: string;
  rangeStart: string;
  rangeEnd: string;
  now: Date;
}): Promise<{ allocatedByDate: Map<string, number>; bookingCountByDate: Map<string, number> }> {
  return (async () => {
    const spanRows = await db
      .select({
        tourStartDate: bookings.tourStartDate,
        tourEndDate: bookings.tourEndDate,
        guestTotal: bookings.guestTotal,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.tourId, input.tourId),
          sql`${bookings.tourStartDate}::text <= ${input.rangeEnd}`,
          sql`${bookings.tourEndDate}::text >= ${input.rangeStart}`,
          or(
            eq(bookings.status, "confirmed"),
            and(
              eq(bookings.status, "pending"),
              isNotNull(bookings.expiresAt),
              gt(bookings.expiresAt, input.now)
            )
          )
        )
      );

    const allocatedByDate = new Map<string, number>();
    const bookingCountByDate = new Map<string, number>();
    for (const row of spanRows) {
      const s = dateStringFromBookingDate(row.tourStartDate);
      const e = dateStringFromBookingDate(row.tourEndDate);
      const g = Number(row.guestTotal ?? 0);
      for (const d of iterateIsoDateRangeInclusive(s, e)) {
        if (d < input.rangeStart || d > input.rangeEnd) continue;
        allocatedByDate.set(d, (allocatedByDate.get(d) ?? 0) + g);
        bookingCountByDate.set(d, (bookingCountByDate.get(d) ?? 0) + 1);
      }
    }
    return { allocatedByDate, bookingCountByDate };
  })();
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

  const durationDays = Math.max(1, tour.durationDays ?? 1);
  const pad = tour.isMultiDay && durationDays > 1 ? durationDays - 1 : 0;
  const expandedStart = addCalendarDaysIso(start, -pad);
  const expandedEnd = addCalendarDaysIso(end, pad);

  const overrideRows = await db
    .select()
    .from(availabilityOverrides)
    .where(
      and(
        eq(availabilityOverrides.tourId, input.tourId),
        gte(availabilityOverrides.date, expandedStart),
        lte(availabilityOverrides.date, expandedEnd)
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

  const { allocatedByDate, bookingCountByDate } = await buildAllocatedByDateMap({
    tourId: input.tourId,
    rangeStart: expandedStart,
    rangeEnd: expandedEnd,
    now,
  });

  const days: string[] = [];
  const cur = new Date(`${start}T00:00:00Z`);
  const endD = new Date(`${end}T00:00:00Z`);
  while (cur <= endD) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  const isMultiDay = Boolean(tour.isMultiDay) && durationDays > 1;

  return days.map((d) => {
    if (!isMultiDay) {
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
        hasActiveBooking: (bookingCountByDate.get(d) ?? 0) > 0,
      });
    }

    const spanDates: string[] = [];
    for (let i = 0; i < durationDays; i++) {
      spanDates.push(addCalendarDaysIso(d, i));
    }

    const spanDays: AvailabilityDayResult[] = [];
    for (let i = 0; i < spanDates.length; i++) {
      const dt = spanDates[i]!;
      const wd = weekdayFromDateStr(dt);
      spanDays.push(
        computeAvailabilityDay({
          bookingDate: dt,
          pickupTime,
          now,
          tour,
          settings,
          override: overrideByDate.get(dt),
          weekdayRule: ruleByWeekday.get(wd),
          seatsReserved: allocatedByDate.get(dt) ?? 0,
          hasActiveBooking: (bookingCountByDate.get(dt) ?? 0) > 0,
          applyMinimumAdvance: i === 0,
          applyCutoff: i === 0,
        })
      );
    }
    return mergeMultiDayStartCell(d, spanDays);
  });
}

export async function confirmedGuestsOnDate(tourId: string, bookingDateStr: string) {
  const rows = await db
    .select({ sum: sql<number>`coalesce(sum(${bookings.guestTotal}), 0)` })
    .from(bookings)
    .where(
      and(
        eq(bookings.tourId, tourId),
        sql`${bookings.tourStartDate}::text <= ${bookingDateStr}`,
        sql`${bookings.tourEndDate}::text >= ${bookingDateStr}`,
        eq(bookings.status, "confirmed")
      )
    );
  return Number(rows[0]?.sum ?? 0);
}
