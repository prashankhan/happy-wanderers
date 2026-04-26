import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import {
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  parse,
} from "date-fns";

export const DEFAULT_TZ = "Australia/Brisbane";

/** Calendar date `yyyy-MM-dd` for “now” in the given IANA zone (falls back if zone is invalid). */
export function calendarDateTodayInTimeZone(timeZone: string): string {
  const tz = timeZone.trim() || DEFAULT_TZ;
  try {
    return formatInTimeZone(new Date(), tz, "yyyy-MM-dd");
  } catch {
    return formatInTimeZone(new Date(), DEFAULT_TZ, "yyyy-MM-dd");
  }
}

export function formatDateInTz(date: Date, tz: string, fmt: string): string {
  return formatInTimeZone(date, tz, fmt);
}

/** Interprets bookingDate + pickupTime as wall clock in `tz`, returns UTC instant. */
export function combineDateAndPickupTime(
  bookingDateStr: string,
  pickupTimeStr: string,
  tz: string
): Date {
  const timePart = pickupTimeStr.length <= 5 ? `${pickupTimeStr}:00` : pickupTimeStr;
  const local = parse(`${bookingDateStr} ${timePart}`, "yyyy-MM-dd HH:mm:ss", new Date(0));
  return fromZonedTime(local, tz);
}

export function monthRangeUtcStrings(monthStr: string): { start: string; end: string } {
  const d = parseISO(`${monthStr}-01`);
  const start = startOfMonth(d);
  const end = endOfMonth(d);
  return { start: format(start, "yyyy-MM-dd"), end: format(end, "yyyy-MM-dd") };
}

export function daysInMonthStrings(monthStr: string): string[] {
  const d = parseISO(`${monthStr}-01`);
  const days = eachDayOfInterval({ start: startOfMonth(d), end: endOfMonth(d) });
  return days.map((x) => format(x, "yyyy-MM-dd"));
}

/** Calendar `yyyy-MM-dd` + whole days in UTC date math (matches availability engine). */
export function addCalendarDaysIso(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

export function iterateIsoDateRangeInclusive(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addCalendarDaysIso(cur, 1);
  }
  return out;
}

/** Calendar span for a booking from the selected departure date and tour duration flags. */
export function tourSpanFromDepartureDate(
  departureDate: string,
  durationDays: number | null | undefined,
  isMultiDay: boolean | null | undefined
): { tourStartDate: string; tourEndDate: string } {
  const n = Math.max(1, durationDays ?? 1);
  const multi = Boolean(isMultiDay) && n > 1;
  const tourStartDate = departureDate;
  const tourEndDate = multi ? addCalendarDaysIso(departureDate, n - 1) : departureDate;
  return { tourStartDate, tourEndDate };
}
