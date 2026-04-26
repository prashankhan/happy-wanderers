/** Stored in `tours.itinerary_days` (JSONB). Presentation only — not used by booking or availability. */
export interface TourItineraryDay {
  day_number: number;
  title: string;
  pickup_location: string;
  pickup_time: string;
  summary: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Parses DB/API JSON into a clean list; invalid entries are dropped. */
export function parseTourItineraryDays(raw: unknown): TourItineraryDay[] {
  if (!Array.isArray(raw)) return [];
  const out: TourItineraryDay[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const day_number = Number(item.day_number);
    if (!Number.isFinite(day_number) || day_number < 1) continue;
    const title = typeof item.title === "string" ? item.title.trim() : "";
    const pickup_location =
      typeof item.pickup_location === "string" ? item.pickup_location.trim() : "";
    const pickup_time = typeof item.pickup_time === "string" ? item.pickup_time.trim() : "";
    const summary = typeof item.summary === "string" ? item.summary : "";
    if (!title || !pickup_location || !pickup_time) continue;
    out.push({ day_number, title, pickup_location, pickup_time, summary });
  }
  return out.sort((a, b) => a.day_number - b.day_number);
}

export function hasStructuredItinerary(
  isMultiDay: boolean | null | undefined,
  durationDays: number | null | undefined,
  raw: unknown
): boolean {
  const journey = Boolean(isMultiDay) && Math.max(1, durationDays ?? 1) > 1;
  if (!journey) return false;
  const days = parseTourItineraryDays(raw);
  return days.length > 0;
}
