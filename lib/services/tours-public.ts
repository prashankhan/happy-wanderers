import { and, asc, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  availabilityRules,
  departureLocations,
  pricingRules,
  tourImages,
  tours,
} from "@/lib/db/schema";

export async function listPublishedTours(filters: { featured?: boolean; region?: string }) {
  const conditions = [
    eq(tours.status, "published"),
    isNull(tours.deletedAt),
    eq(tours.isActive, true),
  ];
  if (filters.featured) conditions.push(eq(tours.isFeatured, true));
  if (filters.region) conditions.push(eq(tours.locationRegion, filters.region));

  return db
    .select({
      id: tours.id,
      title: tours.title,
      slug: tours.slug,
      shortDescription: tours.shortDescription,
      durationText: tours.durationText,
      groupSizeText: tours.groupSizeText,
      priceFromText: tours.priceFromText,
      locationRegion: tours.locationRegion,
      isFeatured: tours.isFeatured,
      minimumAdvanceBookingDays: tours.minimumAdvanceBookingDays,
      durationDays: tours.durationDays,
      isMultiDay: tours.isMultiDay,
      heroImage: tourImages.imageUrl,
    })
    .from(tours)
    .leftJoin(
      tourImages,
      and(
        eq(tourImages.tourId, tours.id),
        eq(tourImages.isHero, true),
        isNull(tourImages.deletedAt)
      )
    )
    .where(and(...conditions))
    .orderBy(asc(tours.displayOrder), asc(tours.title));
}

async function loadTourBundle(tour: typeof tours.$inferSelect) {

  const [images, pickups, pricing, availability] = await Promise.all([
    db
      .select()
      .from(tourImages)
      .where(and(eq(tourImages.tourId, tour.id), isNull(tourImages.deletedAt)))
      .orderBy(asc(tourImages.sortOrder)),
    db
      .select()
      .from(departureLocations)
      .where(and(eq(departureLocations.tourId, tour.id), eq(departureLocations.isActive, true)))
      .orderBy(asc(departureLocations.displayOrder)),
    db
      .select()
      .from(pricingRules)
      .where(and(eq(pricingRules.tourId, tour.id), eq(pricingRules.isActive, true)))
      .orderBy(desc(pricingRules.priority)),
    db
      .select()
      .from(availabilityRules)
      .where(eq(availabilityRules.tourId, tour.id)),
  ]);

  return {
    tour,
    images,
    pickups,
    pricingRules: pricing,
    availabilityRules: availability,
  };
}

export async function getTourBySlug(slug: string) {
  const rows = await db
    .select()
    .from(tours)
    .where(
      and(eq(tours.slug, slug), eq(tours.status, "published"), isNull(tours.deletedAt))
    )
    .limit(1);
  const tour = rows[0];
  if (!tour) return null;
  return loadTourBundle(tour);
}

export async function getPublishedTourById(id: string) {
  const rows = await db
    .select()
    .from(tours)
    .where(
      and(eq(tours.id, id), eq(tours.status, "published"), isNull(tours.deletedAt))
    )
    .limit(1);
  const tour = rows[0];
  if (!tour) return null;
  return loadTourBundle(tour);
}
