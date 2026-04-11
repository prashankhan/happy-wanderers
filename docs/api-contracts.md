# API Contracts — Booking Platform Endpoint Specification

## Overview

This document defines the backend API surface for the booking platform.

These endpoints support:

public tour browsing

availability lookup

checkout session creation

booking lifecycle transitions

admin override control

media uploads

reporting access

manifest generation

All availability-sensitive endpoints must use the Availability Engine before committing changes.


---

# API Architecture Strategy

Version 1 uses:

Next.js App Router server actions
or
Route Handlers

Example structure:

/app/api/availability/route.ts

/app/api/bookings/create/route.ts

/app/api/admin/overrides/update/route.ts


All endpoints:

server-validated only

never trust client input


---

# Authentication Strategy

Public endpoints:

no authentication required


Admin endpoints:

require admin session


Session stored using:

NextAuth credentials provider


Permission enforcement:

server-side only


---

# Public API Endpoints


---

## GET /api/tours

Returns list of published tours


Response:

[
  {
    id
    title
    slug
    short_description
    duration_text
    group_size_text
    price_from_text
    hero_image
    is_featured
  }
]


Filters supported:

featured

region


Example:

/api/tours?featured=true


---

## GET /api/tours/{slug}

Returns full tour detail


Response:

tour metadata

pricing summary

departure locations

gallery images

availability summary


Example:

/api/tours/whitsundays-sailing


---

## GET /api/availability

Returns availability for selected month


Query:

tour_id

month


Example:

/api/availability?tour_id=abc123&month=2026-03


Response:

[
  {
    date
    available
    remaining_capacity
    total_capacity
    cutoff_passed
    override_exists
  }
]


Uses:

Availability Engine


---

## POST /api/bookings/create

Creates pending booking


Input:

tour_id

booking_date

departure_location_id

adults

children

infants

customer_first_name

customer_last_name

customer_email

customer_phone

customer_notes


Validation:

availability check required

cutoff validation required

capacity validation required


Output:

booking_reference

stripe_checkout_url


Behavior:

creates pending booking

sets expires_at

creates Stripe checkout session


---

## POST /api/stripe/webhook

Processes Stripe lifecycle events


Supported events:

checkout.session.completed

payment_intent.payment_failed

charge.refunded


Behavior:

updates booking status

updates payment_status

sends confirmation emails

updates reporting totals


Idempotency enforced using:

stripe_webhook_events table


---

# Admin API Endpoints


All admin endpoints require:

authenticated admin session


Staff permissions restricted using:

admin-permissions-model.md


---

## GET /api/admin/bookings

Returns booking list


Filters supported:

date

tour_id

status

customer_email


Example:

/api/admin/bookings?date=2026-03-14


Response:

booking list


---

## GET /api/admin/bookings/{id}

Returns booking detail


Includes:

customer info

pricing snapshot

passenger counts

pickup location

status history

activity log


---

## PATCH /api/admin/bookings/update

Updates editable booking fields


Editable fields:

passenger counts

customer info

notes

departure location


Validation:

availability recheck required


---

## PATCH /api/admin/bookings/cancel

Cancels booking


Input:

booking_id


Behavior:

updates status

releases seats

logs activity


Permission:

admin only


---

## PATCH /api/admin/bookings/refund

Triggers refund


Input:

booking_id


Behavior:

calls Stripe refund API

updates booking status

logs activity


Permission:

admin only


---

# Availability Override Endpoints


---

## GET /api/admin/availability

Returns calendar availability data


Query:

tour_id

month


Response:

calendar availability structure


Uses:

Availability Engine


---

## POST /api/admin/availability/override

Creates override


Input:

tour_id

date

is_available

capacity_override

cutoff_override_hours

note


Behavior:

upsert availability_overrides record


Permission:

admin only


---

## DELETE /api/admin/availability/override

Deletes override


Input:

tour_id

date


Behavior:

removes override record


Permission:

admin only


---

# Pricing Rule Endpoints


---

## GET /api/admin/pricing

Returns pricing rules


Input:

tour_id


Response:

pricing_rules list


---

## POST /api/admin/pricing/create

Creates pricing rule


Permission:

admin only


---

## PATCH /api/admin/pricing/update

Updates pricing rule


Permission:

admin only


---

## DELETE /api/admin/pricing/delete

Deletes pricing rule


Permission:

admin only


---

# Media Upload Endpoints


---

## POST /api/admin/media/upload

Uploads image


Input:

file

tour_id

alt_text

caption

is_hero


Behavior:

stores file

creates tour_images record


Permission:

admin or staff


---

## PATCH /api/admin/media/reorder

Updates gallery order


Input:

image_ids array


Behavior:

updates sort_order


Permission:

admin only


---

## DELETE /api/admin/media/delete

Soft deletes image


Input:

image_id


Behavior:

sets deleted_at timestamp


Permission:

admin only


---

# Manifest Endpoints


---

## GET /api/admin/manifests

Returns manifest data


Query:

tour_id

date


Response:

confirmed bookings only


Includes:

passenger counts

pickup location

customer phone

notes


Used for:

driver sheet generation


---

# Reporting Endpoints


---

## GET /api/admin/reports/bookings

Returns booking totals


Filters:

date range

tour

status


Response:

booking totals

passenger totals

revenue totals


Uses:

booking snapshot pricing fields


---

## GET /api/admin/reports/revenue

Returns revenue summary


Filters:

date range


Response:

daily totals

weekly totals

monthly totals


Uses:

confirmed bookings only


---

# Contact Form Endpoint


---

## POST /api/contact

Stores contact form submission


Input:

name

email

phone

topic

message


Behavior:

creates contact_messages record

sends admin alert email


---

# Validation Rules (Global)


All endpoints must validate:

required fields present

UUID formats correct

email format valid

passenger counts valid

capacity availability confirmed

cutoff window respected


Never trust:

client validation only


---

# Availability Safety Enforcement Layer


Before booking creation:

run availability engine


Before booking update:

recalculate capacity


Before override change:

validate confirmed booking conflicts


Prevents:

overbooking

cutoff violations


---

# Error Response Format


Standard response:

{
  success: false,
  message: "Capacity exceeded"
}


Example cases:

cutoff passed

tour unavailable

invalid passenger counts

booking expired


---

# API Design Guarantees


This API contract ensures:

availability-safe booking creation

Stripe-safe lifecycle updates

override-safe calendar editing

permission-safe admin access

manifest-safe passenger export

reporting-safe revenue totals

media-safe upload handling


This contract defines the backend interaction surface of the booking platform.