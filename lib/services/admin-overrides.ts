import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { availabilityOverrides } from "@/lib/db/schema";
import { countAllocatedSeats } from "@/lib/services/availability";

export async function upsertAvailabilityOverride(input: {
  tourId: string;
  date: string;
  isAvailable: boolean;
  capacityOverride: number | null;
  cutoffOverrideHours: number | null;
  note: string | null;
}) {
  if (input.capacityOverride != null) {
    const allocated = await countAllocatedSeats(input.tourId, input.date);
    if (input.capacityOverride < allocated) {
      return {
        ok: false as const,
        message: `Capacity cannot be lower than seats already held or confirmed (${allocated} guests)`,
      };
    }
  }

  await db
    .insert(availabilityOverrides)
    .values({
      tourId: input.tourId,
      date: input.date,
      isAvailable: input.isAvailable,
      capacityOverride: input.capacityOverride,
      cutoffOverrideHours: input.cutoffOverrideHours,
      note: input.note,
    })
    .onConflictDoUpdate({
      target: [availabilityOverrides.tourId, availabilityOverrides.date],
      set: {
        isAvailable: input.isAvailable,
        capacityOverride: input.capacityOverride,
        cutoffOverrideHours: input.cutoffOverrideHours,
        note: input.note,
        updatedAt: new Date(),
      },
    });

  return { ok: true as const };
}

export async function deleteAvailabilityOverride(tourId: string, date: string) {
  await db
    .delete(availabilityOverrides)
    .where(and(eq(availabilityOverrides.tourId, tourId), eq(availabilityOverrides.date, date)));
}
