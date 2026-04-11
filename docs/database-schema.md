# Database Schema — Tour Booking Platform

## Overview

This schema supports a custom tour booking platform for a single operator running multiple tours with:

- multiple pickup / departure locations per tour
- date-based availability
- capacity control
- cutoff enforcement
- Stripe checkout
- booking snapshots
- admin overrides
- media management
- reporting and manifests

The schema is designed to prioritize:

- booking integrity
- availability accuracy
- historical consistency
- admin safety
- future scalability without redesign


---

# Core Tables

## 1. tours

Stores the primary tour content and booking-level defaults.

### Fields

- `id` — UUID, primary key
- `title` — text, required
- `slug` — text, unique, required
- `short_description` — text, required
- `description` — text, required
- `duration_text` — text, required
- `duration_minutes` — integer, required
- `group_size_text` — text, required
- `default_capacity` — integer, required
- `price_from_text` — text, optional
- `location_region` — text, required
- `inclusions` — jsonb, optional
- `exclusions` — jsonb, optional
- `what_to_bring` — jsonb, optional
- `pickup_notes` — text, optional
- `cancellation_policy` — text, optional
- `hero_badge` — text, optional
- `booking_cutoff_hours` — integer, required
- `booking_enabled` — boolean, default true
- `is_active` — boolean, default true
- `status` — text, required (`draft`, `published`, `archived`)
- `is_featured` — boolean, default false
- `display_order` — integer, default 0
- `seo_title` — text, optional
- `seo_description` — text, optional
- `created_at` — timestamp, required
- `updated_at` — timestamp, required
- `deleted_at` — timestamp, nullable

### Notes

- `slug` must be unique
- `default_capacity` is the fallback capacity if no weekday rule or override exists
- `booking_enabled` controls whether bookings can be made
- `is_active` controls whether the tour is operationally active
- `status` controls content visibility state


---

## 2. departure_locations

Stores pickup / departure locations for each tour.

### Fields

- `id` — UUID, primary key
- `tour_id` — UUID, foreign key → `tours.id`
- `name` — text, required
- `pickup_time` — time, required
- `pickup_time_label` — text, optional
- `price_adjustment_type` — text, required (`none`, `fixed`, `percentage`)
- `price_adjustment_value` — numeric, default 0
- `google_maps_link` — text, optional
- `notes` — text, optional
- `is_default` — boolean, default false
- `is_active` — boolean, default true
- `display_order` — integer, default 0
- `created_at` — timestamp, required
- `updated_at` — timestamp, required

### Notes

- one tour can have many departure locations
- departure location affects pickup time and price adjustment
- capacity is still enforced at tour/date level, not per departure location
- at most one departure location per tour should have `is_default = true`


---

## 3. pricing_rules

Stores pricing rules for each tour.

### Fields

- `id` — UUID, primary key
- `tour_id` — UUID, foreign key → `tours.id`
- `label` — text, required
- `adult_price` — numeric, required
- `child_price` — numeric, required
- `infant_price` — numeric, default 0
- `infant_pricing_type` — text, required (`free`, `fixed`, `not_allowed`)
- `currency_code` — text, required, default `AUD`
- `valid_from` — date, nullable
- `valid_until` — date, nullable
- `priority` — integer, default 1
- `is_active` — boolean, default true
- `created_at` — timestamp, required
- `updated_at` — timestamp, required

### Notes

- one tour can have many pricing rules
- pricing rules support future seasonal pricing
- runtime selects the matching active rule by date and priority
- departure location price adjustments are applied after pricing rule selection


---

## 4. availability_rules

Stores recurring weekday availability for a tour.

### Fields

- `id` — UUID, primary key
- `tour_id` — UUID, foreign key → `tours.id`
- `weekday` — integer, required (`0 = Sunday ... 6 = Saturday`)
- `default_capacity` — integer, nullable
- `is_active` — boolean, default true
- `created_at` — timestamp, required
- `updated_at` — timestamp, required

### Notes

- one tour can have multiple weekday rules
- `default_capacity` here overrides `tours.default_capacity` for that weekday
- recommend unique constraint on `(tour_id, weekday)`


---

## 5. availability_overrides

Stores single-date overrides for availability, capacity, and cutoff.

### Fields

- `id` — UUID, primary key
- `tour_id` — UUID, foreign key → `tours.id`
- `date` — date, required
- `is_available` — boolean, required
- `capacity_override` — integer, nullable
- `cutoff_override_hours` — integer, nullable
- `note` — text, nullable
- `created_at` — timestamp, required
- `updated_at` — timestamp, required

### Notes

- this table has highest priority in availability resolution
- recommend unique constraint on `(tour_id, date)`
- overrides can close a date, change capacity, or change cutoff window


---

## 6. bookings

Stores the canonical booking transaction record.

### Fields

- `id` — UUID, primary key
- `booking_reference` — text, unique, required

#### relational references
- `tour_id` — UUID, foreign key → `tours.id`
- `departure_location_id` — UUID, foreign key → `departure_locations.id`

#### snapshots
- `tour_title_snapshot` — text, required
- `pickup_location_name_snapshot` — text, required
- `pickup_time_snapshot` — time, required

#### booking timing
- `booking_date` — date, required
- `booking_datetime` — timestamp, required

#### passenger counts
- `adults` — integer, required, default 0
- `children` — integer, required, default 0
- `infants` — integer, required, default 0
- `guest_total` — integer, required

#### pricing snapshots
- `price_per_adult_snapshot` — numeric, required
- `price_per_child_snapshot` — numeric, required
- `price_per_infant_snapshot` — numeric, required
- `total_price_snapshot` — numeric, required
- `currency` — text, required

#### customer details
- `customer_first_name` — text, required
- `customer_last_name` — text, required
- `customer_email` — text, required
- `customer_phone` — text, required
- `customer_phone_country_code` — text, nullable
- `customer_country` — text, nullable
- `customer_notes` — text, nullable
- `internal_notes` — text, nullable

#### lifecycle
- `status` — text, required (`pending`, `confirmed`, `failed`, `expired`, `cancelled`, `refunded`)
- `payment_status` — text, required (`unpaid`, `paid`, `failed`, `refunded`)
- `booking_source` — text, required (`website`, `admin_manual`, `phone_booking`, `offline`, `partner_agent`)

#### Stripe references
- `stripe_session_id` — text, nullable
- `stripe_payment_intent_id` — text, nullable

#### hold / expiry
- `expires_at` — timestamp, nullable

#### email tracking
- `confirmation_email_sent_at` — timestamp, nullable
- `admin_alert_sent_at` — timestamp, nullable

#### timestamps
- `created_at` — timestamp, required
- `updated_at` — timestamp, required

### Notes

- bookings are immutable financial / historical records
- snapshot fields must not be recalculated later
- `guest_total` must include infants
- confirmed bookings and pending unexpired bookings consume seats
- do not hard delete bookings

### Constraints

- `booking_reference` unique
- `adults >= 0`
- `children >= 0`
- `infants >= 0`
- `guest_total >= 1`
- `total_price_snapshot >= 0`

### Recommended indexes

- `tour_id`
- `booking_date`
- `status`
- `payment_status`
- `customer_email`
- `departure_location_id`
- `stripe_session_id`
- `stripe_payment_intent_id`
- composite: `(tour_id, booking_date)`


---

## 7. booking_activity_log

Stores audit trail for admin and system actions on bookings.

### Fields

- `id` — UUID, primary key
- `booking_id` — UUID, foreign key → `bookings.id`
- `action_type` — text, required
- `old_value` — jsonb, nullable
- `new_value` — jsonb, nullable
- `performed_by` — text, required
- `created_at` — timestamp, required

### Notes

- used for audit safety and admin traceability
- examples: passenger count changed, booking cancelled, pickup location changed, refund issued


---

## 8. admin_users

Stores admin/operator accounts.

### Fields

- `id` — UUID, primary key
- `email` — text, unique, required
- `password_hash` — text, required
- `role` — text, required (`admin`, `staff`)
- `last_login_at` — timestamp, nullable
- `last_login_ip` — text, nullable
- `created_at` — timestamp, required
- `updated_at` — timestamp, required

### Notes

- used with credentials-based authentication
- role structure is minimal but future-ready


---

## 9. tour_images

Stores media assets for tours.

### Fields

- `id` — UUID, primary key
- `tour_id` — UUID, foreign key → `tours.id`
- `image_url` — text, required
- `storage_path` — text, required
- `file_name` — text, required
- `file_size` — integer, nullable
- `mime_type` — text, required
- `alt_text` — text, nullable
- `caption` — text, nullable
- `sort_order` — integer, default 0
- `is_hero` — boolean, default false
- `deleted_at` — timestamp, nullable
- `created_at` — timestamp, required

### Notes

- one tour can have many images
- one image can be flagged as hero
- recommend partial unique constraint so only one image per tour can have `is_hero = true`

### Recommended constraints

- partial unique index: one hero image per tour where `is_hero = true` and `deleted_at is null`


---

## 10. contact_messages

Stores submitted contact form messages.

### Fields

- `id` — UUID, primary key
- `name` — text, required
- `email` — text, required
- `phone` — text, nullable
- `topic` — text, nullable
- `message` — text, required
- `created_at` — timestamp, required

### Notes

- supports contact page inquiries
- can later feed a lightweight CRM workflow


---

## 11. stripe_webhook_events

Stores processed Stripe webhook events for idempotency and debugging.

### Fields

- `id` — UUID, primary key
- `stripe_event_id` — text, unique, required
- `event_type` — text, required
- `status` — text, required (`received`, `processed`, `failed`)
- `payload_json` — jsonb, required
- `processed_at` — timestamp, nullable
- `created_at` — timestamp, required

### Notes

- prevents duplicate processing
- useful for replay, debugging, and audit


---

## 12. system_settings

Stores global platform settings.

### Fields

- `id` — UUID, primary key
- `booking_reference_prefix` — text, required, default `HW`
- `default_cutoff_hours` — integer, required
- `hold_expiry_minutes` — integer, required, default 10
- `currency_code` — text, required, default `AUD`
- `timezone` — text, required, default `Australia/Brisbane`
- `business_name` — text, nullable
- `support_email` — text, nullable
- `support_phone` — text, nullable
- `admin_alert_email` — text, nullable
- `created_at` — timestamp, required
- `updated_at` — timestamp, required

### Notes

- expected to be a single-row table in version 1
- used by booking engine, email service, and UI defaults


---

## 13. system_jobs_log

Stores scheduled job run logs.

### Fields

- `id` — UUID, primary key
- `job_name` — text, required
- `run_at` — timestamp, required
- `records_processed` — integer, default 0
- `status` — text, required (`success`, `failed`)
- `error_message` — text, nullable

### Notes

- useful for tracking expired-hold cleanup and future scheduled jobs


---

# Entity Relationship Summary

## tours

Has many:

- departure_locations
- pricing_rules
- availability_rules
- availability_overrides
- tour_images
- bookings

## departure_locations

Belongs to:

- tours

Has many:

- bookings

## pricing_rules

Belongs to:

- tours

## availability_rules

Belongs to:

- tours

## availability_overrides

Belongs to:

- tours

## bookings

Belongs to:

- tours
- departure_locations

Has many:

- booking_activity_log entries

## admin_users

Standalone auth table.

## tour_images

Belong to:

- tours

## contact_messages

Standalone support table.

## stripe_webhook_events

Standalone Stripe audit table.

## system_settings

Global configuration table.

## system_jobs_log

Global system job log table.


---

# Availability Resolution Logic

Availability is resolved using this priority:

1. `availability_overrides`
2. `availability_rules`
3. `tours.default_capacity`

Interpretation:

- if a date override exists, use it
- otherwise use the weekday rule
- otherwise fallback to tour default configuration


---

# Capacity Resolution Logic

Resolved capacity for a selected tour/date uses:

1. `availability_overrides.capacity_override`
2. `availability_rules.default_capacity`
3. `tours.default_capacity`

Then subtract allocated seats from bookings.

Allocated seats count from:

- `confirmed`
- `pending` where `expires_at > now()`

Do not count:

- `failed`
- `expired`
- `cancelled`
- `refunded`


---

# Seat Allocation Rule

Seat consumption uses:

`guest_total = adults + children + infants`

Infants count toward capacity.


---

# Cutoff Resolution Logic

Cutoff hours are resolved using:

1. `availability_overrides.cutoff_override_hours`
2. `tours.booking_cutoff_hours`
3. `system_settings.default_cutoff_hours`

Cutoff is calculated against:

- `booking_date`
- `departure_locations.pickup_time`
- timezone `Australia/Brisbane`


---

# Pricing Resolution Logic

Final price is calculated using:

1. selected active pricing rule for the tour
2. departure location price adjustment
3. passenger counts

Booking then stores full pricing snapshots in `bookings`.

Historical bookings must not change when live pricing changes later.


---

# Booking Lifecycle Summary

## pending

Created when booking hold is created before Stripe confirmation.

Consumes seats if not expired.

## confirmed

Created after Stripe webhook confirms payment.

Consumes seats.

## failed

Payment failed. Does not consume seats.

## expired

Hold expired before confirmation. Does not consume seats.

## cancelled

Cancelled manually or operationally. Does not consume seats.

## refunded

Refunded booking. Does not consume seats.


---

# Deletion Strategy

## Hard delete allowed

- contact_messages (optional)
- unused stripe_webhook_events retention later
- system_jobs_log retention later

## Soft delete recommended

- tours via `deleted_at`
- tour_images via `deleted_at`

## Never hard delete

- bookings
- booking_activity_log


---

# Schema Notes for Implementation

- use UUIDs for all primary keys
- use DB-level constraints where possible
- use indexes on all booking-critical lookup fields
- use snapshot fields for anything customer-facing or financial
- keep Stripe webhook processing idempotent
- enforce unique constraints on override uniqueness and hero image uniqueness
- do not calculate booking totals from mutable live tables after payment


---

# Version 1 Scope Reminder

This schema includes support for:

- public tour booking
- pickup-aware logistics
- location-based pricing adjustment
- capacity enforcement
- date overrides
- cutoff enforcement
- Stripe checkout
- admin management
- reporting
- manifests
- media assets

This schema intentionally excludes:

- multi-operator marketplace logic
- discount coupon engine
- gift card engine
- full CRM system
- subscriptions
- SMS automation
- multi-currency checkout