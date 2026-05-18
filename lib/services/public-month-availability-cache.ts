import { unstable_cache } from "next/cache";

import {
  getMonthAvailability,
  type AvailabilityDayResult,
} from "@/lib/services/availability";

/** Public calendar reads only — booking paths stay uncached. */
export const PUBLIC_MONTH_AVAILABILITY_CACHE_SECONDS = 60;

const getCachedMonthAvailability = unstable_cache(
  async (
    tourId: string,
    month: string,
    departureLocationId: string | undefined
  ): Promise<AvailabilityDayResult[]> =>
    getMonthAvailability({
      tourId,
      month,
      departureLocationId,
    }),
  ["public-month-availability"],
  { revalidate: PUBLIC_MONTH_AVAILABILITY_CACHE_SECONDS }
);

export function getPublicMonthAvailabilityCached(input: {
  tourId: string;
  month: string;
  departureLocationId?: string;
}): Promise<AvailabilityDayResult[]> {
  return getCachedMonthAvailability(
    input.tourId,
    input.month,
    input.departureLocationId
  );
}

export function publicMonthAvailabilityCacheControl(): string {
  const maxAge = PUBLIC_MONTH_AVAILABILITY_CACHE_SECONDS;
  const staleWhileRevalidate = maxAge * 2;
  return `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`;
}
