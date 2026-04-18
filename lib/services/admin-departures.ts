import { and, asc, count, eq, ne, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { bookings, departureLocations } from "@/lib/db/schema";

/** After inserts/updates/deletes: inactive rows never stay default; at most one default among actives; if any active, one must be default. */
export async function reconcileDepartureDefaultsForTour(tourId: string): Promise<void> {
  const rows = await db
    .select()
    .from(departureLocations)
    .where(eq(departureLocations.tourId, tourId))
    .orderBy(asc(departureLocations.displayOrder), asc(departureLocations.name));

  const defaultRows = rows.filter((r) => r.isDefault);
  if (defaultRows.length > 1) {
    const keepId = defaultRows[0]!.id;
    for (const r of defaultRows) {
      if (r.id !== keepId) {
        await db
          .update(departureLocations)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(departureLocations.id, r.id));
      }
    }
  }

  await db
    .update(departureLocations)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(and(eq(departureLocations.tourId, tourId), eq(departureLocations.isActive, false)));

  const refreshed = await db
    .select()
    .from(departureLocations)
    .where(eq(departureLocations.tourId, tourId))
    .orderBy(asc(departureLocations.displayOrder), asc(departureLocations.name));

  const active = refreshed.filter((r) => r.isActive);
  const activeDefaults = active.filter((r) => r.isDefault);
  if (activeDefaults.length > 1) {
    const keepId = activeDefaults[0]!.id;
    for (const r of activeDefaults) {
      if (r.id !== keepId) {
        await db
          .update(departureLocations)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(departureLocations.id, r.id));
      }
    }
  }

  const again = await db
    .select()
    .from(departureLocations)
    .where(eq(departureLocations.tourId, tourId))
    .orderBy(asc(departureLocations.displayOrder), asc(departureLocations.name));

  const activeAgain = again.filter((r) => r.isActive);
  const hasActiveDefault = activeAgain.some((r) => r.isDefault);
  if (activeAgain.length > 0 && !hasActiveDefault) {
    await db
      .update(departureLocations)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(departureLocations.tourId, tourId));
    await db
      .update(departureLocations)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(departureLocations.id, activeAgain[0]!.id));
  }
}

export async function countBookingsForDeparture(departureLocationId: string): Promise<number> {
  const [row] = await db
    .select({ c: count() })
    .from(bookings)
    .where(eq(bookings.departureLocationId, departureLocationId));
  return Number(row?.c ?? 0);
}

export async function nextDepartureDisplayOrder(tourId: string): Promise<number> {
  const [row] = await db
    .select({
      mx: sql<number>`coalesce(max(${departureLocations.displayOrder}), -1)`.mapWith(Number),
    })
    .from(departureLocations)
    .where(eq(departureLocations.tourId, tourId));
  return (row?.mx ?? -1) + 1;
}

export async function clearDefaultExcept(tourId: string, exceptId: string): Promise<void> {
  await db
    .update(departureLocations)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(and(eq(departureLocations.tourId, tourId), ne(departureLocations.id, exceptId)));
}
