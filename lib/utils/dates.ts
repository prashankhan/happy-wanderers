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
