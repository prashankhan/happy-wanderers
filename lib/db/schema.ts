import { relations, sql } from "drizzle-orm";

import type { TourItineraryDay } from "@/lib/types/tour-itinerary";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const tours = pgTable(
  "tours",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    shortDescription: text("short_description").notNull(),
    description: text("description").notNull(),
    durationText: text("duration_text").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    groupSizeText: text("group_size_text").notNull(),
    defaultCapacity: integer("default_capacity").notNull(),
    priceFromText: text("price_from_text"),
    locationRegion: text("location_region").notNull(),
    inclusions: jsonb("inclusions").$type<string[] | null>(),
    exclusions: jsonb("exclusions").$type<string[] | null>(),
    whatToBring: jsonb("what_to_bring").$type<string[] | null>(),
    pickupNotes: text("pickup_notes"),
    cancellationPolicy: text("cancellation_policy"),
    heroBadge: text("hero_badge"),
    bookingCutoffHours: integer("booking_cutoff_hours").notNull(),
    minimumAdvanceBookingDays: integer("minimum_advance_booking_days").notNull().default(0),
    durationDays: integer("duration_days").notNull().default(1),
    isMultiDay: boolean("is_multi_day").notNull().default(false),
    requiresAccommodation: boolean("requires_accommodation").notNull().default(false),
    /** Optional per-day narrative + pickup copy; not used by availability or booking engine. */
    itineraryDays: jsonb("itinerary_days").$type<TourItineraryDay[] | null>(),
    bookingEnabled: boolean("booking_enabled").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),
    status: text("status").notNull(),
    isFeatured: boolean("is_featured").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("tours_slug_idx").on(t.slug),
    index("tours_status_idx").on(t.status),
    check("tours_status_check", sql`${t.status} IN ('draft', 'published', 'archived')`),
    check(
      "tours_minimum_advance_booking_days_check",
      sql`${t.minimumAdvanceBookingDays} >= 0 AND ${t.minimumAdvanceBookingDays} <= 365`
    ),
    check("tours_duration_days_check", sql`${t.durationDays} >= 1 AND ${t.durationDays} <= 30`),
  ]
);

export const departureLocations = pgTable(
  "departure_locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tourId: uuid("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    pickupTime: varchar("pickup_time", { length: 16 }).notNull(),
    pickupTimeLabel: text("pickup_time_label"),
    priceAdjustmentType: text("price_adjustment_type").notNull(),
    priceAdjustmentValue: numeric("price_adjustment_value", { precision: 12, scale: 4 })
      .notNull()
      .default("0"),
    googleMapsLink: text("google_maps_link"),
    notes: text("notes"),
    isDefault: boolean("is_default").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("departure_locations_tour_id_idx").on(t.tourId),
    check(
      "departure_locations_price_adj_check",
      sql`${t.priceAdjustmentType} IN ('none', 'fixed', 'percentage')`
    ),
  ]
);

export const pricingRules = pgTable(
  "pricing_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tourId: uuid("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    adultPrice: numeric("adult_price", { precision: 12, scale: 2 }).notNull(),
    childPrice: numeric("child_price", { precision: 12, scale: 2 }).notNull(),
    childPricingType: text("child_pricing_type").notNull().default("fixed"),
    pricingMode: text("pricing_mode").notNull().default("per_person"),
    includedAdults: integer("included_adults").notNull().default(2),
    packageBasePrice: numeric("package_base_price", { precision: 12, scale: 2 }).notNull().default("0"),
    extraAdultPricingType: text("extra_adult_pricing_type").notNull().default("fixed"),
    extraAdultPrice: numeric("extra_adult_price", { precision: 12, scale: 2 }).notNull().default("0"),
    extraChildPrice: numeric("extra_child_price", { precision: 12, scale: 2 }).notNull().default("0"),
    infantPrice: numeric("infant_price", { precision: 12, scale: 2 }).notNull().default("0"),
    infantPricingType: text("infant_pricing_type").notNull(),
    minGuests: integer("min_guests").notNull().default(1),
    maxGuests: integer("max_guests").notNull().default(12),
    maxGuestsScope: text("max_guests_scope").notNull().default("entire_party"),
    maxInfants: integer("max_infants"),
    currencyCode: text("currency_code").notNull().default("AUD"),
    validFrom: date("valid_from"),
    validUntil: date("valid_until"),
    priority: integer("priority").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("pricing_rules_tour_id_idx").on(t.tourId),
    check(
      "pricing_rules_infant_type_check",
      sql`${t.infantPricingType} IN ('free', 'fixed', 'not_allowed')`
    ),
    check(
      "pricing_rules_child_type_check",
      sql`${t.childPricingType} IN ('fixed', 'not_allowed')`
    ),
    check(
      "pricing_rules_mode_check",
      sql`${t.pricingMode} IN ('per_person', 'package')`
    ),
    check(
      "pricing_rules_extra_adult_type_check",
      sql`${t.extraAdultPricingType} IN ('fixed', 'not_allowed')`
    ),
    check(
      "pricing_rules_max_guests_scope_check",
      sql`${t.maxGuestsScope} IN ('entire_party', 'adults_and_children_only', 'adults_only')`
    ),
    check("pricing_rules_included_adults_min_check", sql`${t.includedAdults} >= 1`),
    check("pricing_rules_min_guests_check", sql`${t.minGuests} >= 1`),
    check("pricing_rules_max_guests_check", sql`${t.maxGuests} >= ${t.minGuests}`),
    check("pricing_rules_max_infants_nonneg_check", sql`${t.maxInfants} IS NULL OR ${t.maxInfants} >= 0`),
  ]
);

export const availabilityRules = pgTable(
  "availability_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tourId: uuid("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    weekday: integer("weekday").notNull(),
    defaultCapacity: integer("default_capacity"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("availability_rules_tour_weekday_unique").on(t.tourId, t.weekday),
    index("availability_rules_tour_id_idx").on(t.tourId),
    check("availability_rules_weekday_check", sql`${t.weekday} >= 0 AND ${t.weekday} <= 6`),
  ]
);

export const availabilityOverrides = pgTable(
  "availability_overrides",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tourId: uuid("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    isAvailable: boolean("is_available").notNull(),
    capacityOverride: integer("capacity_override"),
    cutoffOverrideHours: integer("cutoff_override_hours"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("availability_overrides_tour_date_unique").on(t.tourId, t.date),
    index("availability_overrides_tour_date_idx").on(t.tourId, t.date),
  ]
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingReference: text("booking_reference").notNull().unique(),
    tourId: uuid("tour_id")
      .notNull()
      .references(() => tours.id),
    departureLocationId: uuid("departure_location_id")
      .notNull()
      .references(() => departureLocations.id),
    tourTitleSnapshot: text("tour_title_snapshot").notNull(),
    pickupLocationNameSnapshot: text("pickup_location_name_snapshot").notNull(),
    pickupTimeSnapshot: varchar("pickup_time_snapshot", { length: 16 }).notNull(),
    bookingDate: date("booking_date").notNull(),
    tourStartDate: date("tour_start_date").notNull(),
    tourEndDate: date("tour_end_date").notNull(),
    bookingDatetime: timestamp("booking_datetime", { withTimezone: true }).notNull(),
    adults: integer("adults").notNull().default(0),
    children: integer("children").notNull().default(0),
    infants: integer("infants").notNull().default(0),
    guestTotal: integer("guest_total").notNull(),
    pricePerAdultSnapshot: numeric("price_per_adult_snapshot", { precision: 12, scale: 2 }).notNull(),
    pricePerChildSnapshot: numeric("price_per_child_snapshot", { precision: 12, scale: 2 }).notNull(),
    pricePerInfantSnapshot: numeric("price_per_infant_snapshot", { precision: 12, scale: 2 }).notNull(),
    totalPriceSnapshot: numeric("total_price_snapshot", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull(),
    customerFirstName: text("customer_first_name").notNull(),
    customerLastName: text("customer_last_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    customerPhoneCountryCode: text("customer_phone_country_code"),
    customerCountry: text("customer_country"),
    customerNotes: text("customer_notes"),
    internalNotes: text("internal_notes"),
    status: text("status").notNull(),
    paymentStatus: text("payment_status").notNull(),
    bookingSource: text("booking_source").notNull(),
    stripeSessionId: text("stripe_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    confirmationEmailSentAt: timestamp("confirmation_email_sent_at", { withTimezone: true }),
    adminAlertSentAt: timestamp("admin_alert_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("bookings_tour_id_idx").on(t.tourId),
    index("bookings_booking_date_idx").on(t.bookingDate),
    index("bookings_status_idx").on(t.status),
    index("bookings_payment_status_idx").on(t.paymentStatus),
    index("bookings_customer_email_idx").on(t.customerEmail),
    index("bookings_departure_location_id_idx").on(t.departureLocationId),
    index("bookings_stripe_session_id_idx").on(t.stripeSessionId),
    index("bookings_stripe_payment_intent_id_idx").on(t.stripePaymentIntentId),
    index("bookings_tour_date_idx").on(t.tourId, t.bookingDate),
    check(
      "bookings_status_check",
      sql`${t.status} IN ('pending', 'confirmed', 'failed', 'expired', 'cancelled', 'refunded')`
    ),
    check(
      "bookings_payment_status_check",
      sql`${t.paymentStatus} IN ('unpaid', 'paid', 'failed', 'refunded')`
    ),
    check("bookings_adults_nonneg", sql`${t.adults} >= 0`),
    check("bookings_children_nonneg", sql`${t.children} >= 0`),
    check("bookings_infants_nonneg", sql`${t.infants} >= 0`),
    check("bookings_guest_total_min", sql`${t.guestTotal} >= 1`),
    check("bookings_total_price_nonneg", sql`${t.totalPriceSnapshot} >= 0`),
    check("bookings_tour_date_span_check", sql`${t.tourEndDate} >= ${t.tourStartDate}`),
    check(
      "bookings_source_check",
      sql`${t.bookingSource} IN ('website', 'admin_manual', 'phone_booking', 'offline', 'partner_agent')`
    ),
  ]
);

export const bookingActivityLog = pgTable(
  "booking_activity_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    actionType: text("action_type").notNull(),
    oldValue: jsonb("old_value"),
    newValue: jsonb("new_value"),
    performedBy: text("performed_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("booking_activity_log_booking_id_idx").on(t.bookingId)]
);

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    lastLoginIp: text("last_login_ip"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("admin_users_role_check", sql`${t.role} IN ('admin', 'staff')`)]
);

export const tourImages = pgTable(
  "tour_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tourId: uuid("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    storagePath: text("storage_path").notNull(),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size"),
    mimeType: text("mime_type").notNull(),
    altText: text("alt_text"),
    caption: text("caption"),
    sortOrder: integer("sort_order").notNull().default(0),
    isHero: boolean("is_hero").notNull().default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("tour_images_tour_id_idx").on(t.tourId),
    uniqueIndex("tour_images_one_hero_per_tour")
      .on(t.tourId)
      .where(sql`${t.isHero} = true AND ${t.deletedAt} IS NULL`),
  ]
);

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  topic: text("topic"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Distributed rate-limit counters (public APIs; survives multi-instance deploys). */
export const rateLimitBuckets = pgTable("rate_limit_buckets", {
  bucketKey: text("bucket_key").primaryKey(),
  hitCount: integer("hit_count").notNull(),
  windowEnd: timestamp("window_end", { withTimezone: true }).notNull(),
});

export const stripeWebhookEvents = pgTable(
  "stripe_webhook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stripeEventId: text("stripe_event_id").notNull().unique(),
    eventType: text("event_type").notNull(),
    status: text("status").notNull(),
    payloadJson: jsonb("payload_json").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check(
      "stripe_webhook_events_status_check",
      sql`${t.status} IN ('received', 'processed', 'failed')`
    ),
  ]
);

export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingReferencePrefix: text("booking_reference_prefix").notNull().default("HW"),
  defaultCutoffHours: integer("default_cutoff_hours").notNull(),
  holdExpiryMinutes: integer("hold_expiry_minutes").notNull().default(10),
  currencyCode: text("currency_code").notNull().default("AUD"),
  timezone: text("timezone").notNull().default("Australia/Brisbane"),
  businessName: text("business_name"),
  supportEmail: text("support_email"),
  supportPhone: text("support_phone"),
  /** Resend `from` (e.g. hello@verified.domain or Name <hello@...>). Overrides EMAIL_FROM when set. */
  resendFromEmail: text("resend_from_email"),
  adminAlertEmail: text("admin_alert_email"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const systemJobsLog = pgTable(
  "system_jobs_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobName: text("job_name").notNull(),
    runAt: timestamp("run_at", { withTimezone: true }).notNull(),
    recordsProcessed: integer("records_processed").notNull().default(0),
    status: text("status").notNull(),
    errorMessage: text("error_message"),
  },
  (t) => [
    check("system_jobs_log_status_check", sql`${t.status} IN ('success', 'failed')`),
  ]
);

export const toursRelations = relations(tours, ({ many }) => ({
  departureLocations: many(departureLocations),
  pricingRules: many(pricingRules),
  availabilityRules: many(availabilityRules),
  availabilityOverrides: many(availabilityOverrides),
  tourImages: many(tourImages),
  bookings: many(bookings),
}));

export const departureLocationsRelations = relations(departureLocations, ({ one, many }) => ({
  tour: one(tours, { fields: [departureLocations.tourId], references: [tours.id] }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  tour: one(tours, { fields: [bookings.tourId], references: [tours.id] }),
  departureLocation: one(departureLocations, {
    fields: [bookings.departureLocationId],
    references: [departureLocations.id],
  }),
  activity: many(bookingActivityLog),
}));
