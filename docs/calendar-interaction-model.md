# Calendar Interaction Model — Admin Availability Control System

## Overview

The Admin Availability Calendar allows operators to control tour availability using a visual interface.

The calendar supports:

- single-date override editing
- multi-date range editing
- closing dates
- reopening dates
- capacity overrides
- cutoff overrides
- override notes
- visual availability indicators
- safe persistence into availability_overrides table

The calendar never edits default availability rules directly.

It only creates override records.


---

# Calendar Interaction Philosophy

Default availability comes from:

availability_rules
or
tours.default_capacity

The calendar exists only to apply exceptions.

These exceptions are stored in:

availability_overrides


---

# Calendar Click Behavior

Single-date click opens:

Override Editor Panel

Panel displays:

date
current availability state
resolved capacity
remaining seats
cutoff hours
override status
override note (if exists)


---

# Override Editor Panel Actions

Admin can:

toggle availability open / closed

set capacity override

set cutoff override

add override note

remove override


Each action updates:

availability_overrides table


---

# Default Calendar Click Logic

When clicking a date:

system checks:

override exists?


If YES:

load override values


If NO:

load resolved availability engine values


Panel displays resolved state either way.


---

# Range Selection Behavior

Admin may drag across multiple dates.

Example:

March 10 → March 18


Range selection opens:

Bulk Override Editor


Admin can apply:

close all dates

open all dates

set shared capacity override

set shared cutoff override

apply shared note


Creates override row per date.


---

# Range Override Persistence Logic

For each selected date:

insert or update:

availability_overrides record


Using:

upsert strategy


Unique constraint:

unique(tour_id, date)


Ensures:

one override per date only


---

# Availability Toggle Logic

Availability toggle controls:

availability_overrides.is_available


Example:

OFF:

is_available = false


Result:

date becomes unavailable


Example:

ON:

is_available = true


Result:

date becomes available


Even if weekday rule disables it.


---

# Capacity Override Logic

Capacity override stored in:

availability_overrides.capacity_override


Example:

default capacity = 20

override:

capacity_override = 28


Resolved capacity becomes:

28


Override priority:

highest


---

# Capacity Override Removal Logic

Removing override sets:

capacity_override = null


System falls back to:

availability_rules.default_capacity

or

tours.default_capacity


---

# Cutoff Override Logic

Stored in:

availability_overrides.cutoff_override_hours


Example:

default cutoff:

12 hours


override:

4 hours


Result:

booking allowed closer to departure


Override applies only to that date.


---

# Override Note Behavior

Notes stored in:

availability_overrides.note


Used for:

holiday explanation

weather closure

maintenance day

special event capacity increase


Displayed inside:

override panel

admin audit UI


Not visible to customers.


---

# Override Delete Behavior

Admin may delete override.

System performs:

DELETE availability_overrides


Calendar immediately recalculates:

resolved availability


Falls back to:

availability_rules
or
tour defaults


---

# Calendar Visual Status Colors

Calendar displays per-day status using:

resolved availability engine result


Recommended colors:

green = available

orange = low seats remaining

red = sold out

gray = unavailable

dark gray = cutoff passed


Low seats threshold:

<= 25% remaining


Example:

capacity = 20

remaining = 5

status:

orange


---

# Override Indicator UI Marker

Dates with overrides display:

corner indicator badge


Example markers:

blue dot = override exists

lock icon = manually closed date

bolt icon = capacity override applied

clock icon = cutoff override applied


Improves operator clarity.


---

# Tooltip Behavior

Hovering a date shows:

resolved capacity

remaining seats

cutoff status

override summary


Example:

Capacity: 28 (override)

Remaining: 6

Cutoff: 4h (override)


---

# Calendar Navigation Behavior

Calendar supports:

month navigation

year jump selector

today quick jump button


Calendar loads:

one month at a time


Using:

availability API


---

# Calendar Data Load API Contract

Endpoint example:

GET /admin/availability?tour_id=XXX&month=2026-03


Returns:

date

is_available

remaining_capacity

total_capacity

cutoff_passed

override_exists


Optimized for:

fast rendering

low payload size


---

# Calendar Batch Override Safety Rule

Before applying bulk override:

system validates:

no confirmed bookings conflict


Example:

admin tries closing date with confirmed bookings


System response:

show warning modal


Options:

cancel operation

continue anyway


If continue:

date closes

existing bookings remain valid


New bookings blocked


---

# Capacity Reduction Safety Rule

If reducing capacity below confirmed bookings:

system blocks change


Example:

confirmed bookings = 18

admin sets:

capacity_override = 10


System response:

reject change


Show error:

capacity cannot be lower than confirmed bookings


---

# Cutoff Override Safety Rule

Cutoff override allowed anytime.


Even after bookings exist.


Because:

cutoff affects future bookings only.


---

# Calendar Refresh Behavior

Calendar refresh triggered when:

override created

override updated

override deleted

booking confirmed

booking cancelled

booking expired


Ensures:

UI always accurate


---

# Calendar Cache Strategy

Availability cached per:

tour_id

month


Example cache key:

availability:tour123:2026-03


Cache invalidation triggered when:

booking confirmed

booking cancelled

override updated

tour capacity updated


---

# Multi-Operator Safety Rule

Version 1 assumption:

single operator environment


Future support:

operator_id column on overrides


Not required in Version 1.


---

# Calendar Interaction Guarantees

This model ensures:

operators never modify default availability accidentally

overrides remain isolated per date

range edits remain safe

capacity conflicts prevented

cutoff logic preserved

existing bookings protected

calendar UI stays fast

availability engine remains authoritative


This calendar interaction model defines how operators safely control availability across the entire platform.