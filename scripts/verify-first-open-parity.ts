/**
 * Compares findFirstBookableAvailability (Phase 1) with the legacy month-by-month scan.
 * Run: npx tsx scripts/verify-first-open-parity.ts
 */
import { format, startOfMonth } from "date-fns";

import { db } from "@/lib/db";
import { tours } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import {
  findFirstBookableAvailability,
  getMonthAvailability,
} from "@/lib/services/availability";

function monthKeyOffset(baseMonth: string, offset: number): string {
  const [y, m] = baseMonth.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + offset, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function legacyFirstOpen(input: {
  tourId: string;
  departureLocationId?: string;
  fromMonth: string;
  horizonMonths: number;
}) {
  let earliestBookableDate: string | null = null;
  let firstOpenDate: string | null = null;
  let firstOpenMonth: string | null = null;

  for (let offset = 0; offset < input.horizonMonths; offset += 1) {
    const probeMonth = monthKeyOffset(input.fromMonth, offset);
    const days = await getMonthAvailability({
      tourId: input.tourId,
      month: probeMonth,
      departureLocationId: input.departureLocationId,
    });

    if (offset === 0) {
      const firstWithEarliest = days.find((d) => Boolean(d.earliestBookableDate));
      earliestBookableDate = firstWithEarliest?.earliestBookableDate ?? null;
    }

    const openDay = days.find((d) => d.isAvailable && !d.cutoffPassed && d.availableSeats > 0);
    if (openDay) {
      firstOpenDate = openDay.date;
      firstOpenMonth = probeMonth;
      break;
    }
  }

  return { firstOpenDate, firstOpenMonth, earliestBookableDate };
}

async function main() {
  const published = await db
    .select({ id: tours.id, title: tours.title })
    .from(tours)
    .where(and(eq(tours.status, "published"), isNull(tours.deletedAt), eq(tours.isActive, true)));

  if (published.length === 0) {
    console.log("No published tours — skipping DB parity check.");
    return;
  }

  const fromMonth = format(startOfMonth(new Date()), "yyyy-MM");
  let failures = 0;

  for (const tour of published) {
    for (const horizon of [6, 25] as const) {
      const [next, legacy] = await Promise.all([
        findFirstBookableAvailability({
          tourId: tour.id,
          fromMonth,
          horizonMonths: horizon,
        }),
        legacyFirstOpen({ tourId: tour.id, fromMonth, horizonMonths: horizon }),
      ]);

      const match =
        next.firstOpenDate === legacy.firstOpenDate &&
        next.firstOpenMonth === legacy.firstOpenMonth &&
        next.earliestBookableDate === legacy.earliestBookableDate;

      if (!match) {
        failures += 1;
        console.error(`MISMATCH: ${tour.title} (horizon=${horizon})`);
        console.error("  new:", next);
        console.error("  legacy:", legacy);
      } else {
        console.log(`OK: ${tour.title} (horizon=${horizon}) → ${next.firstOpenDate ?? "none"}`);
      }
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
    console.error(`\n${failures} mismatch(es).`);
  } else {
    console.log(`\nAll ${published.length} tour(s) match legacy scan for horizons 6 and 25.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
