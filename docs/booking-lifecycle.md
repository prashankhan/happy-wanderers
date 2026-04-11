# Booking Lifecycle — State Machine Specification

## Overview

This document defines how bookings move through the system from creation to completion.

The booking lifecycle ensures:

- seats are never overbooked
- Stripe payments remain synchronized with booking status
- availability stays accurate
- pending checkout holds behave correctly
- admins can safely manage bookings
- reporting remains consistent
- driver manifests remain reliable

This lifecycle applies to both:

- public website bookings
- admin-created manual bookings


---

# Booking Status Types

Each booking must always have one of the following statuses:

pending
confirmed
failed
expired
cancelled
refunded


---

# Payment Status Types

Payment status is stored separately from booking status.

Values:

unpaid
paid
failed
refunded


---

# Lifecycle Overview Diagram

pending
→ confirmed

pending
→ expired

pending
→ failed

confirmed
→ cancelled

confirmed
→ refunded


---

# Status Definitions


## pending

Meaning:

Customer has started checkout but payment is not yet completed.

Created when:

Stripe checkout session is created.

Behavior:

Seats are reserved temporarily.

Seat consumption rule:

Counts toward capacity.

Condition:

expires_at > now()

If expires_at passes:

Status becomes expired automatically.


---

## confirmed

Meaning:

Payment successful.

Created when:

Stripe webhook confirms payment_intent.succeeded

Behavior:

Booking becomes permanent.

Seat consumption rule:

Counts toward capacity.

Included in:

driver manifests
reports
admin dashboard totals


---

## failed

Meaning:

Payment attempt failed.

Created when:

Stripe webhook returns payment failure event.

Behavior:

Booking becomes inactive.

Seat consumption rule:

Does NOT count toward capacity.

Included in:

admin visibility only


---

## expired

Meaning:

Customer abandoned checkout before completing payment.

Created when:

expires_at timestamp passes.

Behavior:

Booking automatically released.

Seat consumption rule:

Does NOT count toward capacity.

Handled by:

scheduled cleanup job


---

## cancelled

Meaning:

Booking cancelled manually by admin or operator.

Created when:

admin cancels booking

Behavior:

Seats released.

Seat consumption rule:

Does NOT count toward capacity.

Included in:

reports only if explicitly requested


---

## refunded

Meaning:

Payment returned to customer.

Created when:

Stripe refund issued

Behavior:

Seats released.

Seat consumption rule:

Does NOT count toward capacity.

Important:

Refunded bookings remain permanent financial records.


---

# Booking Creation Flow (Public Website)

Step 1

Customer selects:

tour
date
departure location
passenger counts


Step 2

System checks availability engine.


Step 3

If available:

Create booking:

status = pending
payment_status = unpaid


Step 4

Set hold expiration:

expires_at = now() + hold_expiry_minutes


Step 5

Create Stripe checkout session.


Step 6

Redirect customer to Stripe checkout page.


---

# Stripe Success Flow

Stripe sends webhook:

checkout.session.completed

Then:

update booking:

status = confirmed
payment_status = paid


Then:

send confirmation email

send admin notification

update reporting totals


---

# Stripe Failure Flow

Stripe sends webhook:

payment_intent.payment_failed

Then:

update booking:

status = failed
payment_status = failed


Then:

release seats automatically


---

# Checkout Abandonment Flow

If customer leaves checkout:

expires_at passes

Scheduled job runs:

expire_pending_bookings


System updates:

status = expired


Seats released automatically.


---

# Seat Reservation Timing Logic

Seats reserved when:

status = pending
AND
expires_at > now()


Seats confirmed permanently when:

status = confirmed


Seats released when:

status becomes:

expired
failed
cancelled
refunded


---

# Hold Expiry Duration

Configured in:

system_settings.hold_expiry_minutes

Recommended default:

10 minutes


Example:

expires_at = created_at + 10 minutes


---

# Admin Manual Booking Flow

Admin creates booking manually.

System:

skips Stripe

Creates booking:

status = confirmed
payment_status = unpaid OR paid


Used for:

phone bookings
offline bookings
agent bookings


Admin may optionally:

mark as paid later


---

# Admin Edit Booking Rules

Admins may edit:

passenger counts
departure location
customer details
notes


Admins may NOT edit:

booking_reference
tour_id
booking_date

without override confirmation logic


Reason:

these fields affect availability integrity


---

# Admin Cancellation Flow

When admin cancels booking:

update:

status = cancelled


Then:

release seats

record activity log entry


Optional:

send cancellation email


---

# Admin Refund Flow

Admin triggers Stripe refund.

Stripe webhook:

charge.refunded

Then system updates:

status = refunded
payment_status = refunded


Seats released automatically.


---

# Booking Activity Log Requirements

Every lifecycle change must create log entry:

booking_activity_log


Example entries:

status_changed
passenger_count_changed
pickup_location_changed
refund_processed
booking_cancelled


Fields recorded:

old_value
new_value
performed_by
timestamp


---

# Availability Safety Enforcement

Availability must be checked before:

creating pending booking

creating Stripe checkout session

confirming booking via webhook


Never rely on:

client-side validation only


---

# Duplicate Booking Prevention

System must prevent:

double Stripe session creation

duplicate webhook confirmation


Handled using:

stripe_session_id

stripe_payment_intent_id


Both stored in bookings table.


---

# Idempotent Webhook Processing Rule

Before processing Stripe webhook:

Check:

stripe_webhook_events table


If event already processed:

ignore webhook


Else:

process event safely


---

# Booking Reference Format

Stored in:

booking_reference


Format example:

HW-240315-4821


Structure:

PREFIX
DATE
RANDOM SUFFIX


Prefix stored in:

system_settings.booking_reference_prefix


---

# Email Trigger Logic

Send confirmation email when:

status becomes confirmed


Send admin alert email when:

status becomes confirmed


Optional email when:

status becomes cancelled


Optional email when:

status becomes refunded


---

# Manifest Inclusion Rules

Driver manifests include only:

status = confirmed


Exclude:

pending
failed
expired
cancelled
refunded


---

# Reporting Inclusion Rules

Reports include:

status = confirmed


Optional filters may include:

cancelled
refunded


Never include:

pending
failed
expired


---

# Cleanup Job Requirements

Scheduled job:

expire_pending_bookings


Runs every:

5 minutes


Logic:

find bookings:

status = pending
AND expires_at < now()


Update:

status = expired


---

# Lifecycle Guarantees

This lifecycle ensures:

no double booking

Stripe-safe confirmation behavior

automatic seat release after checkout abandonment

clean admin cancellation workflow

accurate reporting totals

accurate driver manifests

audit-safe activity tracking

consistent availability calculations


This lifecycle defines the booking state machine used across the entire platform.