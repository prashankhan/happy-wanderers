# Availability Engine — Architecture Specification

## Overview

The Availability Engine determines whether a tour date can be booked and how many seats remain available.

It is responsible for:

- resolving whether a date is open
- calculating capacity correctly
- subtracting reserved seats safely
- respecting booking cutoff time
- honoring overrides
- supporting pending booking holds
- ensuring Stripe-safe allocation behavior
- remaining timezone-correct

This engine powers:

- public booking calendar
- booking API validation
- Stripe checkout hold logic
- admin calendar UI
- manifest generation
- reporting logic


---

# Availability Resolution Priority

Availability is resolved using strict override precedence.

Priority order:

availability_overrides  
↓  
availability_rules (weekday rules)  
↓  
tours.default_capacity

Interpretation:

1. If override exists → use override
2. Else if weekday rule exists → use weekday rule
3. Else fallback to tour default capacity


---

# Capacity Resolution Algorithm

Resolved capacity is calculated using:

capacity =
override.capacity_override
OR
weekday_rule.default_capacity
OR
tour.default_capacity

Then subtract allocated seats:

available_seats =
capacity − allocated_seats

Allocated seats include:

confirmed bookings
+
pending bookings where expires_at > now()

Do NOT count:

failed
expired
cancelled
refunded


---

# Seat Consumption Rule

Seats consumed per booking:

guest_total = adults + children + infants

Infants count toward capacity.

Reason:

Transport safety + operational logistics.


---

# Date Availability Resolution Logic

Availability boolean is resolved using:

if override exists:

    if override.is_available == false:
        unavailable

    else:
        available

else if weekday_rule exists:

    if weekday_rule.is_active == true:
        available

    else:
        unavailable

else:

    available


---

# Cutoff Resolution Logic

Cutoff hours determine the last time a booking can be created before departure.

Resolved using:

override.cutoff_override_hours
OR
tour.booking_cutoff_hours
OR
system_settings.default_cutoff_hours

Cutoff is calculated against:

booking_date
+
departure_locations.pickup_time

Timezone:

Australia/Brisbane

Example:

Tour pickup time:

07:00

Cutoff hours:

12

Cutoff timestamp:

previous day 19:00


---

# Cutoff Enforcement Rule

Booking allowed only if:

current_time < cutoff_timestamp

Otherwise:

booking blocked


---

# Override Logic Behavior

Overrides are stored in:

availability_overrides

Overrides may control:

availability status
capacity override
cutoff override

Examples:

Example 1 — Close a date completely

is_available = false

Result:

Date disabled


Example 2 — Increase capacity for holiday demand

capacity_override = 30

Result:

Capacity replaces default


Example 3 — Extend booking window temporarily

cutoff_override_hours = 4

Result:

Late bookings allowed


---

# Pending Booking Hold Logic

Pending bookings temporarily reserve seats.

Seats reserved if:

status = pending
AND
expires_at > now()

Seats released automatically when:

expires_at < now()

Release handled by:

scheduled cleanup job

Example:

Hold duration:

10 minutes

Workflow:

customer opens Stripe checkout
→ booking created (pending)
→ seats reserved
→ expires_at set
→ if payment succeeds:
    confirmed
→ else:
    expired
    seats released


---

# Seat Allocation Timeline

Example flow:

User selects tour date
↓
availability calculated
↓
booking hold created
↓
pending booking consumes seats
↓
Stripe checkout begins
↓
payment success webhook
↓
status = confirmed

If checkout abandoned:

status = expired
seats released


---

# Availability API Contract

Availability API returns:

is_available
available_seats
capacity_total
seats_reserved
cutoff_passed
effective_cutoff_time
source_of_capacity
source_of_cutoff

Example response:

{
  "is_available": true,
  "available_seats": 12,
  "capacity_total": 20,
  "seats_reserved": 8,
  "cutoff_passed": false,
  "effective_cutoff_time": "2026-03-14T19:00:00+10:00",
  "source_of_capacity": "override",
  "source_of_cutoff": "tour"
}


---

# Calendar Rendering Logic

Calendar UI colors depend on:

availability
remaining seats
cutoff state

Suggested color mapping:

green = available
orange = low seats remaining
red = sold out
gray = unavailable
dark gray = cutoff passed


---

# Low Capacity Threshold Logic

Low capacity indicator shown when:

available_seats <= 25% of capacity

Example:

Capacity:

20

Low threshold:

5 seats remaining


---

# Sold Out Logic

Sold out if:

available_seats == 0

Display:

Sold Out


---

# Calendar Month Preload Strategy

Calendar loads availability per month.

Example:

GET /availability?tour_id=xxx&month=2026-03

Returns:

array of dates
availability status
remaining seats

Optimized for:

fast UI rendering
low query load
minimal payload


---

# Availability Query Strategy (Server Side)

Availability calculation requires:

availability_overrides
availability_rules
tour.default_capacity
bookings
departure_locations.pickup_time
system_settings

Recommended query flow:

resolve override
resolve weekday rule
resolve default capacity
count allocated bookings
apply cutoff logic
return availability result


---

# Booking Validation Safety Layer

Availability must be checked:

before hold creation
before Stripe session creation
before confirmation finalization

Never rely on:

client-side availability only

Server validation always required.


---

# Timezone Safety Rule

All availability calculations must use:

Australia/Brisbane

Never:

browser timezone
server timezone default
UTC direct comparison without conversion

Recommended implementation:

store timestamps in UTC
convert during logic evaluation


---

# Performance Optimization Strategy

Recommended caching layer:

per tour
per month

Cache key example:

availability:tour_id:month

Invalidate cache when:

booking created
booking cancelled
override updated
capacity changed
tour disabled


---

# Override Conflict Prevention Rule

Enforce unique constraint:

unique(tour_id, date)

Ensures:

one override per tour per date


---

# Admin Calendar Integration Rules

Admin calendar actions:

click date
drag select range
set override
close date
change capacity
change cutoff

All actions update:

availability_overrides table

Never modify:

availability_rules
tours.default_capacity

from calendar UI.


---

# Manifest Integration Logic

Driver manifests depend on:

confirmed bookings only

Exclude:

pending
expired
failed
cancelled
refunded


---

# Reporting Integration Logic

Reports calculate totals using:

confirmed bookings

Optional toggle:

include cancelled
include refunded


---

# Availability Engine Guarantees

This engine ensures:

no overbooking
cutoff-safe booking behavior
override priority respected
pending holds respected
Stripe-safe checkout flow
timezone-safe calculations
admin-safe override control
manifest accuracy
reporting consistency

This is the availability backbone of the entire booking platform.