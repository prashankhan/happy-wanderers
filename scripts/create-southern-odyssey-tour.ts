import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  availabilityRules,
  departureLocations,
  pricingRules,
  tourImages,
  tours,
} from "@/lib/db/schema";
import type { TourItineraryDay } from "@/lib/types/tour-itinerary";

async function main() {
  const slug = "southern-odyssey-two-day-tour";

  const existing = await db
    .select({ id: tours.id })
    .from(tours)
    .where(and(eq(tours.slug, slug), isNull(tours.deletedAt)))
    .limit(1);
  if (existing[0]) {
    console.log(`Tour already exists: ${existing[0].id}`);
    return;
  }

  const itineraryDays: TourItineraryDay[] = [
    {
      day_number: 1,
      title: "Rainforest Highlands & Waterfalls",
      pickup_location: "Cairns",
      pickup_time: "07:30",
      summary:
        "Depart Cairns for a full day exploring waterfalls, crater lakes and rainforest landscapes across the southern Tablelands before overnight accommodation in the highlands.",
    },
    {
      day_number: 2,
      title: "Southern Tablelands Exploration & Return",
      pickup_location: "Accommodation (Tablelands region)",
      pickup_time: "08:30",
      summary:
        "Continue exploration of southern Tablelands landscapes before returning to Cairns in the afternoon.",
    },
  ];

  const [tour] = await db
    .insert(tours)
    .values({
      title: "Southern Odyssey (Two-Day Tour)",
      slug,
      status: "draft",
      isActive: true,
      bookingEnabled: true,
      isFeatured: true,
      displayOrder: 7,
      shortDescription:
        "A curated two-day private journey through the southern rainforest highlands featuring waterfalls, crater lakes, wildlife encounters and an overnight stay within the Atherton Tablelands region.",
      description:
        "Experience a deeper exploration of Tropical North Queensland on this curated two-day private journey through the southern rainforest highlands. Travel inland from Cairns to discover waterfalls, crater lakes, elevated rainforest landscapes and unique wildlife habitats across the Atherton Tablelands region. Enjoy a relaxed overnight stay in the highlands before continuing your journey on Day 2 with further scenic exploration, curated stops and a comfortable return to Cairns. This extended experience allows time to immerse yourself in landscapes rarely reached on standard day tours.",
      durationText: "2 Days / 1 Night Journey",
      durationMinutes: 2880,
      groupSizeText: "Private experience packages for 2-4 guests",
      defaultCapacity: 4,
      priceFromText: "Package pricing available (2-day curated journey)",
      locationRegion: "Cairns & Southern Atherton Tablelands",
      inclusions: [
        "Private guided two-day touring experience",
        "Waterfall and rainforest exploration across the southern Tablelands region",
        "Crater lake scenic stops",
        "Wildlife spotting opportunities",
        "Overnight accommodation in the Tablelands region",
        "Curated meals as outlined in itinerary",
        "Luxury private touring transport across both days",
      ],
      exclusions: [
        "Personal purchases and souvenirs",
        "Additional meals not specified in itinerary",
        "Travel insurance",
      ],
      whatToBring: [
        "Comfortable walking shoes",
        "Hat and sunscreen",
        "Reusable water bottle",
        "Swimwear and towel",
        "Camera or phone for photography",
        "Insect repellent",
        "Light overnight bag",
      ],
      pickupNotes:
        "Day 1 pickup available from Cairns accommodation locations. Day 2 begins from overnight accommodation within the Tablelands region.",
      cancellationPolicy:
        "Due to accommodation coordination requirements, bookings require at least 7 days advance notice unless otherwise agreed.",
      heroBadge: "2-Day Journey - Waterfalls - Rainforest Highlands",
      minimumAdvanceBookingDays: 7,
      bookingCutoffHours: 24,
      seoTitle:
        "Southern Odyssey Two-Day Private Tour | Atherton Tablelands Overnight Journey",
      seoDescription:
        "Explore waterfalls, crater lakes and rainforest landscapes across the Atherton Tablelands on a curated two-day private journey including overnight accommodation and guided exploration.",
      isMultiDay: true,
      durationDays: 2,
      requiresAccommodation: true,
      itineraryDays,
    })
    .returning({ id: tours.id });

  const tourId = tour.id;

  await db.insert(departureLocations).values({
    tourId,
    name: "Cairns",
    pickupTime: "07:30",
    pickupTimeLabel: "7:30 AM (Day 1 Departure)",
    priceAdjustmentType: "none",
    priceAdjustmentValue: "0",
    isDefault: true,
    isActive: true,
    displayOrder: 1,
  });

  await db.insert(pricingRules).values([
    {
      tourId,
      label: "2-Guest Package",
      pricingMode: "package",
      adultPrice: "0",
      childPrice: "0",
      childPricingType: "not_allowed",
      includedAdults: 2,
      packageBasePrice: "0",
      extraAdultPrice: "0",
      extraChildPrice: "0",
      infantPrice: "0",
      infantPricingType: "not_allowed",
      minGuests: 2,
      maxGuests: 2,
      maxGuestsScope: "entire_party",
      maxInfants: null,
      priority: 1,
      isActive: true,
      currencyCode: "AUD",
    },
    {
      tourId,
      label: "3-4 Guest Package",
      pricingMode: "package",
      adultPrice: "0",
      childPrice: "0",
      childPricingType: "not_allowed",
      includedAdults: 4,
      packageBasePrice: "0",
      extraAdultPrice: "0",
      extraChildPrice: "0",
      infantPrice: "0",
      infantPricingType: "not_allowed",
      minGuests: 3,
      maxGuests: 4,
      maxGuestsScope: "entire_party",
      maxInfants: null,
      priority: 2,
      isActive: true,
      currencyCode: "AUD",
    },
  ]);

  await db.insert(availabilityRules).values(
    [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
      tourId,
      weekday,
      defaultCapacity: 4,
      isActive: true,
    }))
  );

  await db.insert(tourImages).values([
    {
      tourId,
      imageUrl: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1600&q=80",
      storagePath: "seed/unsplash-1473116763249-2faaef81ccda.jpg",
      fileName: "unsplash-1473116763249-2faaef81ccda.jpg",
      fileSize: null,
      mimeType: "image/jpeg",
      altText: "Atherton Tablelands waterfalls journey",
      caption: "Explore remote waterfall landscapes across two unforgettable days",
      sortOrder: 1,
      isHero: true,
    },
    {
      tourId,
      imageUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=1600&q=80",
      storagePath: "seed/unsplash-1557050543-4d5f4e07ef46.jpg",
      fileName: "unsplash-1557050543-4d5f4e07ef46.jpg",
      fileSize: null,
      mimeType: "image/jpeg",
      altText: "Atherton Tablelands crater lakes",
      caption: "Discover scenic crater lakes across the southern highlands",
      sortOrder: 2,
      isHero: false,
    },
    {
      tourId,
      imageUrl: "https://images.unsplash.com/photo-1518655048521-f130df041f66?w=1600&q=80",
      storagePath: "seed/unsplash-1518655048521-f130df041f66.jpg",
      fileName: "unsplash-1518655048521-f130df041f66.jpg",
      fileSize: null,
      mimeType: "image/jpeg",
      altText: "Rainforest highlands driving route",
      caption: "Journey through elevated rainforest landscapes",
      sortOrder: 3,
      isHero: false,
    },
  ]);

  console.log(`Created Southern Odyssey draft tour: ${tourId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
