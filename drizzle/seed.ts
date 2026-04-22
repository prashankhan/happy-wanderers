import { hash } from "bcryptjs";
import { and, eq, like, sql } from "drizzle-orm";

import { loadLocalEnv } from "../load-env";

loadLocalEnv();

import { db } from "../lib/db";
import {
  adminUsers,
  availabilityOverrides,
  availabilityRules,
  bookingActivityLog,
  bookings,
  contactMessages,
  departureLocations,
  pricingRules,
  systemJobsLog,
  systemSettings,
  tourImages,
  tours,
} from "../lib/db/schema";

const TOUR_1_SLUG = "daintree-dawn";
const TOUR_2_SLUG = "coral-coast-sunset";

async function ensureSystemSettings() {
  const existing = await db.select().from(systemSettings).limit(1);
  if (existing[0]) return;
  await db.insert(systemSettings).values({
    bookingReferencePrefix: "HW",
    defaultCutoffHours: 12,
    holdExpiryMinutes: 10,
    currencyCode: "AUD",
    timezone: "Australia/Brisbane",
    businessName: "Happy Wanderers",
    supportEmail: "hello@example.com",
    supportPhone: "+61 7 0000 0000",
    adminAlertEmail: process.env.ADMIN_ALERT_EMAIL ?? "ops@example.com",
  });
  // eslint-disable-next-line no-console -- seed script
  console.log("Seeded system_settings");
}

async function ensureAdminUsers() {
  const password = process.env.ADMIN_SEED_PASSWORD ?? "ChangeMe!123";
  const passwordHash = await hash(password, 12);

  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@example.com";
  const admins = await db.select().from(adminUsers).where(eq(adminUsers.email, adminEmail)).limit(1);
  if (!admins[0]) {
    await db.insert(adminUsers).values({
      email: adminEmail,
      passwordHash,
      role: "admin",
    });
    // eslint-disable-next-line no-console -- seed script
    console.log(`Seeded admin ${adminEmail} / ${password}`);
  }

  const staffEmail = process.env.STAFF_SEED_EMAIL ?? "staff@example.com";
  const staff = await db.select().from(adminUsers).where(eq(adminUsers.email, staffEmail)).limit(1);
  if (!staff[0]) {
    await db.insert(adminUsers).values({
      email: staffEmail,
      passwordHash,
      role: "staff",
    });
    // eslint-disable-next-line no-console -- seed script
    console.log(`Seeded staff ${staffEmail} / ${password}`);
  }
}

async function seedTourDaintreeIfMissing(): Promise<string> {
  const found = await db.select().from(tours).where(eq(tours.slug, TOUR_1_SLUG)).limit(1);
  if (found[0]) return found[0].id;

  const [tour] = await db
    .insert(tours)
    .values({
      title: "Daintree Dawn — Small Group Rainforest Immersion",
      slug: TOUR_1_SLUG,
      shortDescription:
        "A calm, premium small-group journey into the world’s oldest rainforest — mist, birdsong, and expert guiding.",
      description:
        "Walk ancient canopy trails, pause at crystal streams, and learn the living ecology of the Daintree with a senior naturalist guide. We keep groups intentionally small so the forest stays serene — and your experience stays unhurried.",
      durationText: "Full day",
      durationMinutes: 600,
      groupSizeText: "Max 11 guests",
      defaultCapacity: 11,
      priceFromText: "From AUD 189",
      locationRegion: "Cairns & Daintree",
      inclusions: ["Guided rainforest walks", "National park fees", "Morning tea"],
      exclusions: ["Lunch", "Hotel transfers outside listed pickups"],
      whatToBring: ["Closed shoes", "Light rain jacket", "Reusable water bottle"],
      pickupNotes: "Please arrive 10 minutes before your listed pickup time.",
      cancellationPolicy: "See our cancellation policy page for operator terms.",
      heroBadge: "Signature tour",
      bookingCutoffHours: 12,
      bookingEnabled: true,
      isActive: true,
      status: "published",
      isFeatured: true,
      displayOrder: 0,
      seoTitle: "Daintree small-group tour from Cairns",
      seoDescription: "Premium small-group Daintree rainforest tour with curated pickups and calm pacing.",
    })
    .returning({ id: tours.id });

  const tourId = tour!.id;

  await db.insert(departureLocations).values([
    {
      tourId,
      name: "Cairns City (default)",
      pickupTime: "07:00",
      pickupTimeLabel: "7:00 AM",
      priceAdjustmentType: "none",
      priceAdjustmentValue: "0",
      isDefault: true,
      isActive: true,
      displayOrder: 0,
    },
    {
      tourId,
      name: "Palm Cove",
      pickupTime: "07:30",
      pickupTimeLabel: "7:30 AM",
      priceAdjustmentType: "fixed",
      priceAdjustmentValue: "15",
      isDefault: false,
      isActive: true,
      displayOrder: 1,
    },
  ]);

  await db.insert(pricingRules).values({
    tourId,
    label: "Standard",
    adultPrice: "189",
    childPrice: "149",
    infantPrice: "0",
    infantPricingType: "free",
    currencyCode: "AUD",
    validFrom: null,
    validUntil: null,
    priority: 1,
    isActive: true,
  });

  for (const weekday of [0, 1, 2, 3, 4, 5, 6]) {
    const isSunday = weekday === 0;
    await db.insert(availabilityRules).values({
      tourId,
      weekday,
      defaultCapacity: isSunday ? null : 11,
      isActive: !isSunday,
    });
  }

  // eslint-disable-next-line no-console -- seed script
  console.log(`Seeded tour "${TOUR_1_SLUG}" with departures, pricing, weekday rules`);
  return tourId;
}

/** Additional demo tours (idempotent per slug). */
const EXTRA_DEMO_TOURS: {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  durationText: string;
  durationMinutes: number;
  groupSizeText: string;
  defaultCapacity: number;
  priceFromText: string;
  locationRegion: string;
  inclusions: string[];
  exclusions: string[];
  whatToBring: string[];
  pickupNotes: string;
  heroBadge: string | null;
  bookingCutoffHours: number;
  isFeatured: boolean;
  displayOrder: number;
  seoTitle: string;
  seoDescription: string;
  pickupName: string;
  pickupTime: string;
  pickupTimeLabel: string;
  adultPrice: string;
  childPrice: string;
}[] = [
  {
    slug: "atherton-tablelands-day",
    title: "Atherton Tablelands — Waterfalls & Local Produce",
    shortDescription: "Cool-climate villages, crater lakes, and artisan tastings above the coastal heat.",
    description:
      "Wind through the Tablelands with timed stops at curtain fig trees, millaa millaa falls, and a working coffee plantation. Lunch at a country pub and time for gallery browsing in Yungaburra.",
    durationText: "Full day",
    durationMinutes: 600,
    groupSizeText: "Max 14 guests",
    defaultCapacity: 14,
    priceFromText: "From AUD 165",
    locationRegion: "Atherton Tablelands",
    inclusions: ["Guided walks", "Morning tea", "National park entry"],
    exclusions: ["Lunch (optional add-on)", "Hotel pickup outside Cairns"],
    whatToBring: ["Sun hat", "Water bottle", "Light jacket"],
    pickupNotes: "Hotel pickups from 6:45 AM in Cairns northern beaches.",
    heroBadge: "High country",
    bookingCutoffHours: 18,
    isFeatured: true,
    displayOrder: 2,
    seoTitle: "Atherton Tablelands day tour from Cairns",
    seoDescription: "Waterfalls, villages, and produce in the Cairns hinterland.",
    pickupName: "Cairns City (default)",
    pickupTime: "06:45",
    pickupTimeLabel: "6:45 AM",
    adultPrice: "165",
    childPrice: "125",
  },
  {
    slug: "kuranda-scenic-rail-skyrail",
    title: "Kuranda Scenic Rail & Skyrail Classic",
    shortDescription: "World Heritage rainforest views by rail and cableway with village free time.",
    description:
      "Take the historic Kuranda Scenic Railway up through hand-built tunnels, then return over the canopy on Skyrail. Free time in Kuranda for markets and wildlife parks (own cost).",
    durationText: "7 hours",
    durationMinutes: 420,
    groupSizeText: "Max 20 guests",
    defaultCapacity: 20,
    priceFromText: "From AUD 142",
    locationRegion: "Cairns & Kuranda",
    inclusions: ["Rail + Skyrail tickets", "Coach transfers"],
    exclusions: ["Wildlife park entries", "Lunch"],
    whatToBring: ["Camera", "Comfortable shoes"],
    pickupNotes: "Pickup times vary by hotel — confirmation SMS the day prior.",
    heroBadge: "Classic combo",
    bookingCutoffHours: 24,
    isFeatured: true,
    displayOrder: 3,
    seoTitle: "Kuranda Scenic Rail and Skyrail",
    seoDescription: "Rainforest rail journey and cableway with Kuranda village time.",
    pickupName: "Cairns Central pickup zone",
    pickupTime: "07:15",
    pickupTimeLabel: "7:15 AM",
    adultPrice: "142",
    childPrice: "98",
  },
  {
    slug: "great-barrier-reef-snorkel",
    title: "Great Barrier Reef Snorkel Adventure",
    shortDescription: "Outer reef pontoon with guided snorkel sessions and lunch included.",
    description:
      "Fast catamaran to a stable outer-reef platform, equipment, snorkel briefings, and optional intro dive upgrades. Family-friendly with shallow lagoons and deeper drop-offs.",
    durationText: "8 hours",
    durationMinutes: 480,
    groupSizeText: "Max 120 guests",
    defaultCapacity: 120,
    priceFromText: "From AUD 265",
    locationRegion: "Cairns & Reef",
    inclusions: ["Snorkel gear", "Buffet lunch", "Morning tea"],
    exclusions: ["Scuba supplements", "Wetsuit hire"],
    whatToBring: ["Towel", "Swimwear", "Cash for bar"],
    pickupNotes: "Check-in at Reef Fleet Terminal 7:30 AM sharp.",
    heroBadge: "Reef",
    bookingCutoffHours: 12,
    isFeatured: true,
    displayOrder: 4,
    seoTitle: "Outer Great Barrier Reef snorkel from Cairns",
    seoDescription: "Full-day outer reef snorkelling with lunch from Cairns.",
    pickupName: "Reef Fleet Terminal",
    pickupTime: "07:30",
    pickupTimeLabel: "7:30 AM",
    adultPrice: "265",
    childPrice: "155",
  },
  {
    slug: "mossman-gorge-guided",
    title: "Mossman Gorge Dreamtime Walk",
    shortDescription: "Ngadiku-led storytelling walk with river swim stop (seasonal).",
    description:
      "Small-group cultural experience on Kuku Yalanji country with smoking ceremony, rainforest interpretation, and optional swim where conditions allow.",
    durationText: "Half day",
    durationMinutes: 240,
    groupSizeText: "Max 18 guests",
    defaultCapacity: 18,
    priceFromText: "From AUD 98",
    locationRegion: "Port Douglas & Mossman",
    inclusions: ["Indigenous guide", "Park transfers"],
    exclusions: ["Transfers from Cairns", "Lunch"],
    whatToBring: ["Swimwear", "Towel", "Insect repellent"],
    pickupNotes: "Meet at Mossman Gorge centre — self-drive or add coach from Port Douglas.",
    heroBadge: "Culture",
    bookingCutoffHours: 12,
    isFeatured: false,
    displayOrder: 5,
    seoTitle: "Mossman Gorge guided walk",
    seoDescription: "Indigenous-led Mossman Gorge experience near Port Douglas.",
    pickupName: "Mossman Gorge Visitor Centre",
    pickupTime: "09:00",
    pickupTimeLabel: "9:00 AM",
    adultPrice: "98",
    childPrice: "72",
  },
  {
    slug: "cape-tribulation-beach-day",
    title: "Cape Tribulation Beach & Boardwalk",
    shortDescription: "Where the rainforest meets the reef — beach time and elevated walks.",
    description:
      "Scenic drive with ferry crossing, guided boardwalk, and free time at Myall Beach. Optional ice-cream stop at the heritage orchard.",
    durationText: "Full day",
    durationMinutes: 660,
    groupSizeText: "Max 16 guests",
    defaultCapacity: 16,
    priceFromText: "From AUD 199",
    locationRegion: "Daintree & Cape Tribulation",
    inclusions: ["Guided commentary", "Ferry", "National park fees"],
    exclusions: ["Lunch"],
    whatToBring: ["Swimwear", "Reef-safe sunscreen"],
    pickupNotes: "Pickup from Port Douglas 7:00 AM or Cairns 6:00 AM (select hotels).",
    heroBadge: "Beach",
    bookingCutoffHours: 24,
    isFeatured: true,
    displayOrder: 6,
    seoTitle: "Cape Tribulation day tour",
    seoDescription: "Rainforest meets reef — Cape Tribulation from Cairns or Port Douglas.",
    pickupName: "Port Douglas Marina",
    pickupTime: "07:00",
    pickupTimeLabel: "7:00 AM",
    adultPrice: "199",
    childPrice: "149",
  },
  {
    slug: "daintree-river-cruise",
    title: "Daintree River Wildlife Cruise",
    shortDescription: "Dawn or dusk small-boat cruise for crocs, birds, and mangrove quiet.",
    description:
      "Low-noise electric-skiff option on select departures. Naturalist commentary and seasonal wildlife focus — not a theme-park ride.",
    durationText: "2 hours",
    durationMinutes: 120,
    groupSizeText: "Max 22 guests",
    defaultCapacity: 22,
    priceFromText: "From AUD 45",
    locationRegion: "Daintree",
    inclusions: ["Life jackets", "Binoculars on board"],
    exclusions: ["Transfers"],
    whatToBring: ["Camera", "Light jacket"],
    pickupNotes: "Self-drive to Daintree Village jetty; arrive 15 minutes early.",
    heroBadge: "Wildlife",
    bookingCutoffHours: 4,
    isFeatured: false,
    displayOrder: 7,
    seoTitle: "Daintree River crocodile cruise",
    seoDescription: "Wildlife-focused Daintree River cruise.",
    pickupName: "Daintree Village Jetty",
    pickupTime: "08:30",
    pickupTimeLabel: "8:30 AM",
    adultPrice: "45",
    childPrice: "30",
  },
  {
    slug: "green-island-half-day",
    title: "Green Island Half-Day Escape",
    shortDescription: "Coral cay with glass-bottom boat and island loop walk.",
    description:
      "Short crossing, free time for snorkel hire or pool, optional semi-sub tour. Ideal for families with younger children or tight schedules.",
    durationText: "5 hours",
    durationMinutes: 300,
    groupSizeText: "Max 80 guests",
    defaultCapacity: 80,
    priceFromText: "From AUD 118",
    locationRegion: "Cairns & Reef",
    inclusions: ["Return ferry", "Island access"],
    exclusions: ["Snorkel hire", "Semi-sub"],
    whatToBring: ["Hat", "Towel"],
    pickupNotes: "Check-in Reef Fleet Terminal per ticket time window.",
    heroBadge: "Island",
    bookingCutoffHours: 8,
    isFeatured: false,
    displayOrder: 8,
    seoTitle: "Green Island half day Cairns",
    seoDescription: "Half-day Green Island ferry from Cairns.",
    pickupName: "Reef Fleet Terminal",
    pickupTime: "08:00",
    pickupTimeLabel: "8:00 AM",
    adultPrice: "118",
    childPrice: "68",
  },
  {
    slug: "port-douglas-sunset-sail",
    title: "Port Douglas Sunset Sail",
    shortDescription: "Late sail with canapés and reef coastline silhouettes.",
    description:
      "Depart Crystalbrook Superyacht Marina on a stable catamaran. Cash bar; relaxed pacing for couples and small groups.",
    durationText: "2.5 hours",
    durationMinutes: 150,
    groupSizeText: "Max 32 guests",
    defaultCapacity: 32,
    priceFromText: "From AUD 89",
    locationRegion: "Port Douglas",
    inclusions: ["Canapés", "Sparkling on arrival"],
    exclusions: ["Bar tab"],
    whatToBring: ["Flat shoes", "Light layer"],
    pickupNotes: "Boarding 15 minutes prior at marina gate B.",
    heroBadge: "Sunset",
    bookingCutoffHours: 6,
    isFeatured: false,
    displayOrder: 9,
    seoTitle: "Port Douglas sunset sailing",
    seoDescription: "Evening catamaran sail from Port Douglas.",
    pickupName: "Crystalbrook Marina Gate B",
    pickupTime: "17:00",
    pickupTimeLabel: "5:00 PM",
    adultPrice: "89",
    childPrice: "55",
  },
  {
    slug: "wildlife-night-spotlight",
    title: "Night Wildlife Spotlight Tour",
    shortDescription: "After-dark forest edges for possums, pythons, and spotlight birds.",
    description:
      "Small vehicle, red-filter torches, and strict no-feeding ethics. Not guaranteed sightings — nature-led pacing.",
    durationText: "3 hours",
    durationMinutes: 180,
    groupSizeText: "Max 10 guests",
    defaultCapacity: 10,
    priceFromText: "From AUD 125",
    locationRegion: "Atherton Tablelands",
    inclusions: ["Hot drink", "Spotlights"],
    exclusions: ["Dinner"],
    whatToBring: ["Closed shoes", "Dark clothing"],
    pickupNotes: "Pickup from selected Yungaburra accommodations only.",
    heroBadge: "Night",
    bookingCutoffHours: 12,
    isFeatured: false,
    displayOrder: 10,
    seoTitle: "Tablelands night wildlife tour",
    seoDescription: "Spotlight wildlife tour in the Atherton Tablelands.",
    pickupName: "Yungaburra Hotel pickup",
    pickupTime: "19:30",
    pickupTimeLabel: "7:30 PM",
    adultPrice: "125",
    childPrice: "95",
  },
  {
    slug: "behind-scenes-rainforest",
    title: "Behind the Scenes — Rainforest Research Track",
    shortDescription: "Limited monthly departures with ecologist-led monitoring walk.",
    description:
      "Assist with citizen-science plot checks (non-invasive). Moderate fitness; closed shoes mandatory. Proceeds support local land-care.",
    durationText: "6 hours",
    durationMinutes: 360,
    groupSizeText: "Max 8 guests",
    defaultCapacity: 8,
    priceFromText: "From AUD 245",
    locationRegion: "Wet Tropics",
    inclusions: ["Field lunch", "Ecologist guide"],
    exclusions: ["Transfers", "Insurance"],
    whatToBring: ["Boots", "Rain jacket", "Notebook"],
    pickupNotes: "Meet-point supplied after booking — no public GPS for site protection.",
    heroBadge: "Limited",
    bookingCutoffHours: 72,
    isFeatured: false,
    displayOrder: 11,
    seoTitle: "Rainforest research experience Queensland",
    seoDescription: "Small-group behind the scenes rainforest monitoring walk.",
    pickupName: "Secret meet-point (email)",
    pickupTime: "06:00",
    pickupTimeLabel: "6:00 AM",
    adultPrice: "245",
    childPrice: "195",
  },
];

async function seedExtraDemoToursIfMissing(): Promise<void> {
  for (const t of EXTRA_DEMO_TOURS) {
    const found = await db.select().from(tours).where(eq(tours.slug, t.slug)).limit(1);
    if (found[0]) continue;

    const [row] = await db
      .insert(tours)
      .values({
        title: t.title,
        slug: t.slug,
        shortDescription: t.shortDescription,
        description: t.description,
        durationText: t.durationText,
        durationMinutes: t.durationMinutes,
        groupSizeText: t.groupSizeText,
        defaultCapacity: t.defaultCapacity,
        priceFromText: t.priceFromText,
        locationRegion: t.locationRegion,
        inclusions: t.inclusions,
        exclusions: t.exclusions,
        whatToBring: t.whatToBring,
        pickupNotes: t.pickupNotes,
        cancellationPolicy: "See our cancellation policy page for operator terms.",
        heroBadge: t.heroBadge,
        bookingCutoffHours: t.bookingCutoffHours,
        bookingEnabled: true,
        isActive: true,
        status: "published",
        isFeatured: t.isFeatured,
        displayOrder: t.displayOrder,
        seoTitle: t.seoTitle,
        seoDescription: t.seoDescription,
      })
      .returning({ id: tours.id });

    const tourId = row!.id;

    await db.insert(departureLocations).values({
      tourId,
      name: t.pickupName,
      pickupTime: t.pickupTime,
      pickupTimeLabel: t.pickupTimeLabel,
      priceAdjustmentType: "none",
      priceAdjustmentValue: "0",
      isDefault: true,
      isActive: true,
      displayOrder: 0,
    });

    await db.insert(pricingRules).values({
      tourId,
      label: "Standard",
      adultPrice: t.adultPrice,
      childPrice: t.childPrice,
      infantPrice: "0",
      infantPricingType: "free",
      currencyCode: "AUD",
      validFrom: null,
      validUntil: null,
      priority: 1,
      isActive: true,
    });

    for (const weekday of [0, 1, 2, 3, 4, 5, 6]) {
      await db.insert(availabilityRules).values({
        tourId,
        weekday,
        defaultCapacity: t.defaultCapacity,
        isActive: true,
      });
    }

    await ensureTourImages(tourId, t.title, t.slug);
    // eslint-disable-next-line no-console -- seed script
    console.log(`Seeded demo tour "${t.slug}"`);
  }
}

async function seedTourCoralIfMissing(): Promise<string | null> {
  const found = await db.select().from(tours).where(eq(tours.slug, TOUR_2_SLUG)).limit(1);
  if (found[0]) return found[0].id;

  const [tour] = await db
    .insert(tours)
    .values({
      title: "Coral Coast Sunset Sail",
      slug: TOUR_2_SLUG,
      shortDescription: "Late afternoon sail along the reef coastline with drinks and light snacks.",
      description:
        "Board a comfortable catamaran for golden-hour views, marine commentary, and a relaxed return to port. Perfect after a day inland or as a standalone coastal escape.",
      durationText: "3 hours",
      durationMinutes: 180,
      groupSizeText: "Max 24 guests",
      defaultCapacity: 24,
      priceFromText: "From AUD 95",
      locationRegion: "Cairns & Reef",
      inclusions: ["Skipper & crew", "Welcome drink", "Light snacks"],
      exclusions: ["Hotel transfers"],
      whatToBring: ["Sunscreen", "Hat", "Camera"],
      pickupNotes: "Meet at Reef Fleet Terminal 20 minutes before departure.",
      cancellationPolicy: "See our cancellation policy page.",
      heroBadge: "Evening",
      bookingCutoffHours: 6,
      bookingEnabled: true,
      isActive: true,
      status: "published",
      isFeatured: false,
      displayOrder: 1,
      seoTitle: "Sunset sailing Cairns",
      seoDescription: "Sunset catamaran sail from Cairns with drinks and reef views.",
    })
    .returning({ id: tours.id });

  const tourId = tour!.id;

  await db.insert(departureLocations).values({
    tourId,
    name: "Reef Fleet Terminal",
    pickupTime: "16:30",
    pickupTimeLabel: "4:30 PM",
    priceAdjustmentType: "none",
    priceAdjustmentValue: "0",
    isDefault: true,
    isActive: true,
    displayOrder: 0,
  });

  await db.insert(pricingRules).values({
    tourId,
    label: "Standard",
    adultPrice: "95",
    childPrice: "65",
    infantPrice: "0",
    infantPricingType: "free",
    currencyCode: "AUD",
    validFrom: null,
    validUntil: null,
    priority: 1,
    isActive: true,
  });

  for (const weekday of [0, 1, 2, 3, 4, 5, 6]) {
    await db.insert(availabilityRules).values({
      tourId,
      weekday,
      defaultCapacity: 24,
      isActive: true,
    });
  }

  // eslint-disable-next-line no-console -- seed script
  console.log(`Seeded tour "${TOUR_2_SLUG}"`);
  return tourId;
}

async function ensureSundayRuleTour1(tourId: string) {
  await db
    .insert(availabilityRules)
    .values({
      tourId,
      weekday: 0,
      defaultCapacity: null,
      isActive: false,
    })
    .onConflictDoNothing({ target: [availabilityRules.tourId, availabilityRules.weekday] });
}

async function ensureExtraPricingTour1(tourId: string) {
  const rows = await db.select().from(pricingRules).where(eq(pricingRules.tourId, tourId));
  if (rows.length >= 2) return;

  const in90 = new Date();
  in90.setDate(in90.getDate() + 90);
  const until = in90.toISOString().slice(0, 10);

  await db.insert(pricingRules).values({
    tourId,
    label: "Peak season",
    adultPrice: "209",
    childPrice: "165",
    infantPrice: "0",
    infantPricingType: "free",
    currencyCode: "AUD",
    validFrom: until,
    validUntil: null,
    priority: 10,
    isActive: true,
  });
  // eslint-disable-next-line no-console -- seed script
  console.log("Added sample peak-season pricing rule for Daintree tour");
}

async function ensureSampleOverride(tourId: string) {
  const existing = await db.select().from(availabilityOverrides).where(eq(availabilityOverrides.tourId, tourId)).limit(1);
  if (existing[0]) return;

  const closed = new Date();
  closed.setMonth(closed.getMonth() + 2);
  closed.setDate(25);
  const dateStr = closed.toISOString().slice(0, 10);

  await db.insert(availabilityOverrides).values({
    tourId,
    date: dateStr,
    isAvailable: false,
    capacityOverride: null,
    cutoffOverrideHours: null,
    note: "Sample: operator closure (Christmas period)",
  });
  // eslint-disable-next-line no-console -- seed script
  console.log(`Added sample availability override (closed) on ${dateStr}`);
}

async function ensureTourImages(tourId: string, tourTitle: string, slug: string) {
  const count = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(tourImages)
    .where(and(eq(tourImages.tourId, tourId), sql`${tourImages.deletedAt} IS NULL`));
  if ((count[0]?.n ?? 0) > 0) return;

  const base = `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80`;
  const heroPath = `tours/${slug}/gallery/seed-hero.jpg`;
  const galleryPath = `tours/${slug}/gallery/seed-02.jpg`;

  await db.insert(tourImages).values([
    {
      tourId,
      imageUrl: base,
      storagePath: heroPath,
      fileName: "seed-hero.jpg",
      fileSize: 240000,
      mimeType: "image/jpeg",
      altText: `${tourTitle} — rainforest canopy`,
      caption: "Sample gallery image (replace via admin)",
      sortOrder: 0,
      isHero: true,
    },
    {
      tourId,
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
      storagePath: galleryPath,
      fileName: "seed-02.jpg",
      fileSize: 198000,
      mimeType: "image/jpeg",
      altText: "Mountain trail",
      caption: "Sample image",
      sortOrder: 1,
      isHero: false,
    },
  ]);
  // eslint-disable-next-line no-console -- seed script
  console.log("Seeded placeholder tour_images (Unsplash URLs for demo)");
}

async function ensureSampleBookings(tourId: string) {
  const deps = await db
    .select()
    .from(departureLocations)
    .where(and(eq(departureLocations.tourId, tourId), eq(departureLocations.isDefault, true)))
    .limit(1);
  const dep = deps[0] ?? (await db.select().from(departureLocations).where(eq(departureLocations.tourId, tourId)).limit(1))[0];
  if (!dep) return;

  const tourRow = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
  const title = tourRow[0]?.title ?? "Tour";

  const existingDemo = await db
    .select()
    .from(bookings)
    .where(like(bookings.bookingReference, "HW-DEMO-%"))
    .limit(1);
  if (existingDemo[0]) return;

  const d1 = new Date();
  d1.setDate(d1.getDate() + 21);
  const date1 = d1.toISOString().slice(0, 10);
  const d2 = new Date();
  d2.setDate(d2.getDate() + 28);
  const date2 = d2.toISOString().slice(0, 10);

  const holdExpiry = new Date(Date.now() + 8 * 60 * 1000);

  const [b1] = await db
    .insert(bookings)
    .values({
      bookingReference: "HW-DEMO-CONFIRMED-01",
      tourId,
      departureLocationId: dep.id,
      tourTitleSnapshot: title,
      pickupLocationNameSnapshot: dep.name,
      pickupTimeSnapshot: dep.pickupTime,
      bookingDate: date1,
      bookingDatetime: new Date(),
      adults: 2,
      children: 1,
      infants: 0,
      guestTotal: 3,
      pricePerAdultSnapshot: "189.00",
      pricePerChildSnapshot: "149.00",
      pricePerInfantSnapshot: "0.00",
      totalPriceSnapshot: "527.00",
      currency: "AUD",
      customerFirstName: "Alex",
      customerLastName: "Sample",
      customerEmail: "alex.sample@example.com",
      customerPhone: "+61 400 000 001",
      customerNotes: "Sample confirmed booking for manifests / reports.",
      status: "confirmed",
      paymentStatus: "paid",
      bookingSource: "website",
      stripeSessionId: "cs_seed_demo_01",
      stripePaymentIntentId: "pi_seed_demo_01",
      expiresAt: null,
      confirmationEmailSentAt: new Date(),
      adminAlertSentAt: new Date(),
    })
    .returning({ id: bookings.id });

  await db.insert(bookingActivityLog).values({
    bookingId: b1!.id,
    actionType: "booking_created",
    performedBy: "seed",
    newValue: { source: "seed", status: "confirmed" },
  });

  const [b2] = await db
    .insert(bookings)
    .values({
      bookingReference: "HW-DEMO-MANUAL-01",
      tourId,
      departureLocationId: dep.id,
      tourTitleSnapshot: title,
      pickupLocationNameSnapshot: dep.name,
      pickupTimeSnapshot: dep.pickupTime,
      bookingDate: date2,
      bookingDatetime: new Date(),
      adults: 4,
      children: 0,
      infants: 0,
      guestTotal: 4,
      pricePerAdultSnapshot: "189.00",
      pricePerChildSnapshot: "149.00",
      pricePerInfantSnapshot: "0.00",
      totalPriceSnapshot: "756.00",
      currency: "AUD",
      customerFirstName: "Jamie",
      customerLastName: "Operator",
      customerEmail: "jamie@example.com",
      customerPhone: "+61 400 000 002",
      status: "confirmed",
      paymentStatus: "unpaid",
      bookingSource: "admin_manual",
      expiresAt: null,
    })
    .returning({ id: bookings.id });

  await db.insert(bookingActivityLog).values({
    bookingId: b2!.id,
    actionType: "manual_booking_created",
    performedBy: "seed",
    newValue: { source: "admin_manual" },
  });

  const [b3] = await db
    .insert(bookings)
    .values({
      bookingReference: "HW-DEMO-PENDING-01",
      tourId,
      departureLocationId: dep.id,
      tourTitleSnapshot: title,
      pickupLocationNameSnapshot: dep.name,
      pickupTimeSnapshot: dep.pickupTime,
      bookingDate: date1,
      bookingDatetime: new Date(),
      adults: 1,
      children: 0,
      infants: 0,
      guestTotal: 1,
      pricePerAdultSnapshot: "189.00",
      pricePerChildSnapshot: "149.00",
      pricePerInfantSnapshot: "0.00",
      totalPriceSnapshot: "189.00",
      currency: "AUD",
      customerFirstName: "Taylor",
      customerLastName: "Checkout",
      customerEmail: "taylor@example.com",
      customerPhone: "+61 400 000 003",
      status: "pending",
      paymentStatus: "unpaid",
      bookingSource: "website",
      stripeSessionId: "cs_seed_demo_pending",
      expiresAt: holdExpiry,
    })
    .returning({ id: bookings.id });

  await db.insert(bookingActivityLog).values({
    bookingId: b3!.id,
    actionType: "booking_created",
    performedBy: "seed",
    newValue: { source: "website", status: "pending" },
  });

  // eslint-disable-next-line no-console -- seed script
  console.log("Seeded sample bookings (confirmed, manual, pending) + activity log");
}

async function ensureCoralDemoBooking(tourId: string) {
  const dup = await db
    .select()
    .from(bookings)
    .where(eq(bookings.bookingReference, "HW-DEMO-CORAL-01"))
    .limit(1);
  if (dup[0]) return;

  const deps = await db
    .select()
    .from(departureLocations)
    .where(eq(departureLocations.tourId, tourId))
    .limit(1);
  const dep = deps[0];
  if (!dep) return;

  const tourRow = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
  const title = tourRow[0]?.title ?? "Tour";

  const d = new Date();
  d.setDate(d.getDate() + 14);
  const dateStr = d.toISOString().slice(0, 10);

  const [b] = await db
    .insert(bookings)
    .values({
      bookingReference: "HW-DEMO-CORAL-01",
      tourId,
      departureLocationId: dep.id,
      tourTitleSnapshot: title,
      pickupLocationNameSnapshot: dep.name,
      pickupTimeSnapshot: dep.pickupTime,
      bookingDate: dateStr,
      bookingDatetime: new Date(),
      adults: 2,
      children: 0,
      infants: 0,
      guestTotal: 2,
      pricePerAdultSnapshot: "95.00",
      pricePerChildSnapshot: "65.00",
      pricePerInfantSnapshot: "0.00",
      totalPriceSnapshot: "190.00",
      currency: "AUD",
      customerFirstName: "Riley",
      customerLastName: "Reef",
      customerEmail: "riley@example.com",
      customerPhone: "+61 400 000 004",
      status: "confirmed",
      paymentStatus: "paid",
      bookingSource: "website",
      expiresAt: null,
    })
    .returning({ id: bookings.id });

  await db.insert(bookingActivityLog).values({
    bookingId: b!.id,
    actionType: "booking_created",
    performedBy: "seed",
    newValue: { source: "seed", tour: TOUR_2_SLUG },
  });
  // eslint-disable-next-line no-console -- seed script
  console.log("Seeded sample Coral Coast booking");
}

async function ensureRecentDashboardDemoBookings(tourId: string) {
  const deps = await db
    .select()
    .from(departureLocations)
    .where(and(eq(departureLocations.tourId, tourId), eq(departureLocations.isDefault, true)))
    .limit(1);
  const dep =
    deps[0] ?? (await db.select().from(departureLocations).where(eq(departureLocations.tourId, tourId)).limit(1))[0];
  if (!dep) return;

  const tourRow = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);
  const title = tourRow[0]?.title ?? "Tour";

  const recentDemoRows = [
    { daysAgo: 6, suffix: "01", adults: 2, children: 0, total: "378.00" },
    { daysAgo: 5, suffix: "02", adults: 1, children: 1, total: "338.00" },
    { daysAgo: 3, suffix: "03", adults: 3, children: 0, total: "567.00" },
    { daysAgo: 2, suffix: "04", adults: 2, children: 2, total: "676.00" },
    { daysAgo: 0, suffix: "05", adults: 1, children: 0, total: "189.00" },
  ] as const;

  for (const row of recentDemoRows) {
    const ref = `HW-DEMO-CHART-${row.suffix}`;
    const exists = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.bookingReference, ref))
      .limit(1);
    if (exists[0]) continue;

    const bookingDateObj = new Date();
    bookingDateObj.setDate(bookingDateObj.getDate() - row.daysAgo);
    const bookingDate = bookingDateObj.toISOString().slice(0, 10);

    await db.insert(bookings).values({
      bookingReference: ref,
      tourId,
      departureLocationId: dep.id,
      tourTitleSnapshot: title,
      pickupLocationNameSnapshot: dep.name,
      pickupTimeSnapshot: dep.pickupTime,
      bookingDate,
      bookingDatetime: new Date(),
      adults: row.adults,
      children: row.children,
      infants: 0,
      guestTotal: row.adults + row.children,
      pricePerAdultSnapshot: "189.00",
      pricePerChildSnapshot: "149.00",
      pricePerInfantSnapshot: "0.00",
      totalPriceSnapshot: row.total,
      currency: "AUD",
      customerFirstName: "Dashboard",
      customerLastName: `Demo ${row.suffix}`,
      customerEmail: `dashboard.demo.${row.suffix}@example.com`,
      customerPhone: `+61 400 000 1${row.suffix}`,
      status: "confirmed",
      paymentStatus: "paid",
      bookingSource: "website",
      stripeSessionId: `cs_seed_chart_${row.suffix}`,
      stripePaymentIntentId: `pi_seed_chart_${row.suffix}`,
      expiresAt: null,
      confirmationEmailSentAt: new Date(),
      adminAlertSentAt: new Date(),
    });
  }

  // eslint-disable-next-line no-console -- seed script
  console.log("Ensured recent dashboard demo bookings (last 7 days)");
}

async function ensureContactMessage() {
  const existing = await db.select().from(contactMessages).limit(1);
  if (existing[0]) return;

  await db.insert(contactMessages).values({
    name: "Sam Visitor",
    email: "sam.visitor@example.com",
    phone: "+61 400 999 888",
    topic: "Private charter",
    message: "Hi, we are a group of 8 and wondering if you offer a private Daintree day. Thanks!",
  });
  // eslint-disable-next-line no-console -- seed script
  console.log("Seeded sample contact_messages");
}

async function ensureJobsLogSample() {
  const existing = await db.select().from(systemJobsLog).limit(1);
  if (existing[0]) return;

  await db.insert(systemJobsLog).values({
    jobName: "seed_placeholder",
    runAt: new Date(),
    recordsProcessed: 0,
    status: "success",
  });
  // eslint-disable-next-line no-console -- seed script
  console.log("Seeded sample system_jobs_log row");
}

async function main() {
  await ensureSystemSettings();
  await ensureAdminUsers();

  const tour1Id = await seedTourDaintreeIfMissing();
  await ensureSundayRuleTour1(tour1Id);

  const t1 = await db.select().from(tours).where(eq(tours.id, tour1Id)).limit(1);
  const t1Title = t1[0]?.title ?? "Tour";

  await ensureExtraPricingTour1(tour1Id);
  await ensureSampleOverride(tour1Id);
  await ensureTourImages(tour1Id, t1Title, TOUR_1_SLUG);
  await ensureSampleBookings(tour1Id);
  await ensureRecentDashboardDemoBookings(tour1Id);

  const tour2Id = await seedTourCoralIfMissing();
  if (tour2Id) {
    await ensureCoralDemoBooking(tour2Id);
    const t2 = await db.select().from(tours).where(eq(tours.id, tour2Id)).limit(1);
    await ensureTourImages(tour2Id, t2[0]?.title ?? TOUR_2_SLUG, TOUR_2_SLUG);
  }

  await seedExtraDemoToursIfMissing();

  await ensureContactMessage();
  await ensureJobsLogSample();

  // eslint-disable-next-line no-console -- seed script
  console.log("Seed complete — sample content ensured across tables.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
