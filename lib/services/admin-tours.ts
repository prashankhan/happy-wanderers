import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  availabilityRules,
  departureLocations,
  pricingRules,
  tours,
} from "@/lib/db/schema";
import { getSystemSettings } from "@/lib/services/system-settings";

function slugify(raw: string): string {
  const s = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return s.length > 0 ? s : "tour";
}

async function uniqueSlug(base: string): Promise<string> {
  let candidate = base;
  for (let n = 0; n < 20; n++) {
    const existing = await db
      .select({ id: tours.id })
      .from(tours)
      .where(and(eq(tours.slug, candidate), isNull(tours.deletedAt)))
      .limit(1);
    if (!existing[0]) return candidate;
    candidate = `${base}-${n + 2}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Creates a draft tour with one default pickup, one placeholder pricing rule, and weekday rows
 * so the operator can open the editor and publish when ready.
 */
export async function createDraftTour(input: {
  title: string;
  isMultiDay?: boolean;
  durationDays?: number;
  requiresAccommodation?: boolean;
}): Promise<{ id: string; slug: string }> {
  const settings = await getSystemSettings();
  const title = input.title.trim() || "New tour";
  const baseSlug = slugify(title);
  const slug = await uniqueSlug(baseSlug);

  const orderRows = await db
    .select({ max: sql<number>`coalesce(max(${tours.displayOrder}), -1)` })
    .from(tours)
    .where(isNull(tours.deletedAt));
  const nextOrder = (orderRows[0]?.max ?? -1) + 1;

  const isMulti = Boolean(input.isMultiDay);
  const durationDays = isMulti ? Math.max(2, input.durationDays ?? 2) : 1;
  const requiresAccommodation = isMulti && Boolean(input.requiresAccommodation);

  const [tour] = await db
    .insert(tours)
    .values({
      title,
      slug,
      shortDescription: "Draft — add a short summary for listings and cards.",
      description:
        "Add your full tour description in the Content tab. This placeholder text is only visible while the tour is a draft.",
      durationText: "TBD",
      durationMinutes: 180,
      groupSizeText: "Configure group size",
      defaultCapacity: 10,
      priceFromText: null,
      priceContextText: null,
      locationRegion: "Queensland",
      inclusions: [],
      exclusions: [],
      whatToBring: [],
      pickupNotes: null,
      cancellationPolicy: null,
      heroBadge: null,
      bookingCutoffHours: settings.defaultCutoffHours,
      minimumAdvanceBookingDays: 0,
      durationDays,
      isMultiDay: isMulti,
      requiresAccommodation,
      bookingEnabled: false,
      isActive: true,
      status: "draft",
      isFeatured: false,
      displayOrder: nextOrder,
      seoTitle: null,
      seoDescription: null,
    })
    .returning({ id: tours.id, slug: tours.slug });

  const tourId = tour!.id;

  await db.insert(departureLocations).values({
    tourId,
    name: "Primary pickup (edit)",
    pickupTime: "07:00",
    pickupTimeLabel: "7:00 AM",
    priceAdjustmentType: "none",
    priceAdjustmentValue: "0",
    isDefault: true,
    isActive: true,
    displayOrder: 0,
  });

  await db.insert(pricingRules).values({
    tourId,
    label: "Standard",
    adultPrice: "99",
    childPrice: "79",
    infantPrice: "0",
    infantPricingType: "free",
    currencyCode: settings.currencyCode,
    validFrom: null,
    validUntil: null,
    priority: 1,
    isActive: true,
  });

  for (let weekday = 0; weekday <= 6; weekday++) {
    await db.insert(availabilityRules).values({
      tourId,
      weekday,
      defaultCapacity: null,
      isActive: true,
    });
  }

  return { id: tourId, slug: tour!.slug };
}
