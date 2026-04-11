# Pricing Engine — Architecture Specification

## Overview

The Pricing Engine determines how booking prices are calculated and stored.

It is responsible for:

- selecting the correct pricing rule
- calculating passenger totals correctly
- applying departure-location adjustments
- supporting infants pricing logic
- generating Stripe checkout totals
- storing immutable booking snapshots
- ensuring reporting accuracy
- supporting future seasonal pricing expansion

Pricing must always be resolved **before Stripe checkout session creation**.


---

# Pricing Resolution Priority

Pricing is resolved using the following order:

1. active pricing_rules record
2. departure_locations price adjustment
3. passenger counts
4. stored snapshot values inside bookings table

After booking confirmation:

pricing must never change.


---

# Pricing Rule Source Table

Pricing rules are stored in:

pricing_rules

Each rule contains:

adult_price
child_price
infant_price
infant_pricing_type
valid_from
valid_until
priority


---

# Pricing Rule Selection Logic

Pricing rule selected using:

tour_id match
AND is_active = true
AND current_date within valid range

If multiple matches:

select highest priority value


Example:

priority = 1 (default)
priority = 10 (seasonal override)

Result:

priority 10 selected


---

# Passenger Pricing Categories

System supports three passenger types:

adults
children
infants


---

# Infant Pricing Behavior

Infant pricing controlled using:

infant_pricing_type

Supported values:

free
fixed
not_allowed


---

## Infant Pricing Type: free

Behavior:

infants allowed
price = 0

Still counts toward:

capacity


---

## Infant Pricing Type: fixed

Behavior:

infants allowed
price = infant_price


---

## Infant Pricing Type: not_allowed

Behavior:

booking blocked if infants > 0


---

# Departure Location Adjustment Logic

Stored in:

departure_locations.price_adjustment_type
departure_locations.price_adjustment_value


Supported adjustment types:

none
fixed
percentage


---

## Adjustment Type: none

No pricing change applied.


---

## Adjustment Type: fixed

Example:

adjustment_value = 10

Final price:

base_price + 10


Applied per passenger.


---

## Adjustment Type: percentage

Example:

adjustment_value = 5

Final price:

base_price + 5%


Applied per passenger.


---

# Example Pricing Calculation

Example:

adult_price = 120
child_price = 90
infant_price = 0

Passengers:

2 adults
1 child
1 infant

Calculation:

(2 × 120)
+
(1 × 90)
+
(1 × 0)

Total:

330


Now apply departure adjustment:

+5 fixed adjustment

Result:

(2 × 125)
+
(1 × 95)

Total:

345


Final booking price:

345


---

# Currency Source

Currency defined in:

system_settings.currency_code

Example:

AUD


Stored inside bookings table as:

currency snapshot


---

# Booking Snapshot Pricing Fields

Stored inside bookings table:

price_per_adult_snapshot
price_per_child_snapshot
price_per_infant_snapshot
total_price_snapshot
currency


These values must never change after booking confirmation.


---

# Why Pricing Snapshots Are Required

Example scenario:

Tour price today:

120 AUD

Tour price later updated:

150 AUD

Old bookings must remain:

120 AUD

Not:

150 AUD


Snapshots protect:

financial accuracy
customer trust
reporting integrity
refund correctness


---

# Pricing Calculation Timing

Pricing calculated:

before Stripe session creation


Stored:

during pending booking creation


Confirmed:

after Stripe webhook success


Never recalculated later.


---

# Stripe Checkout Amount Source

Stripe amount must always use:

total_price_snapshot


Never:

live pricing_rules lookup


Reason:

prevents mismatch between:

customer payment
stored booking record


---

# Manual Admin Pricing Override

Admins may optionally override total booking price.

Example scenarios:

phone booking discount
agent agreement pricing
special customer accommodation


Override stored as:

total_price_snapshot


System records:

override_reason

inside booking_activity_log


---

# Admin Pricing Edit Rules

Admins may edit pricing:

only before confirmation email sent

or

only before manifest generation cutoff


Recommended rule:

allow admin price override only while:

status = pending


Safer alternative:

allow override anytime but log audit entry


---

# Discount Support Strategy (Future Extension)

Version 1 excludes:

coupon engine
promo codes
dynamic discounts


Future support can add:

discount_rules table


Planned structure example:

discount_code
discount_type
discount_value
valid_from
valid_until
usage_limit


Pricing engine designed to support extension without redesign.


---

# Group Pricing Strategy (Future Extension)

Future support may include:

group_size_threshold
group_discount_percent


Example:

5+ passengers → 10% discount


Not included in Version 1.


---

# Seasonal Pricing Strategy (Already Supported)

Handled using:

valid_from
valid_until
priority


Example:

Summer season pricing rule

priority = 10


Overrides:

default rule priority = 1


---

# Multi-Currency Strategy (Future Extension)

Version 1 supports:

single currency only


Future extension possible using:

currency_rates table

and

pricing_rules per currency


Not required in Version 1.


---

# Pricing Validation Rules

Before booking creation:

validate:

adult_price >= 0
child_price >= 0
infant_price >= 0


Validate passenger counts:

adults >= 1


Block booking if:

total_price <= 0


Exception:

admin manual booking allowed


---

# Reporting Pricing Source

Reports must use:

total_price_snapshot


Never:

pricing_rules


Reason:

historical accuracy


---

# Manifest Pricing Visibility

Driver manifests should NOT include:

pricing


Reason:

drivers need logistics only


Optional future toggle:

include totals summary


---

# Pricing Engine Guarantees

This engine ensures:

correct pricing selection

departure-location adjustments applied correctly

infant pricing handled safely

Stripe totals always match booking totals

historical booking prices never change

admin overrides tracked safely

future seasonal pricing supported

future discount engine compatible


This pricing engine defines how all booking totals are calculated across the platform.