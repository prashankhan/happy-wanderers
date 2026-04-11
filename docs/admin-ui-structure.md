# Admin UI Structure — Operator Dashboard Architecture

## Overview

This document defines the internal structure of the admin interface.

The admin panel is designed as an operational control system for:

tour configuration

availability overrides

booking lifecycle management

manifest generation

reporting visibility

media management

system configuration


The interface must prioritize:

clarity

speed

predictability

data safety

availability integrity protection


This is not a marketing interface.

This is an operator console.


---

# Admin Layout Structure

Global layout:

sidebar (left)

content surface (right)

top action bar (optional per page)


Layout container:

flex min-h-screen


Structure:

Sidebar

Main Content Area


---

# Sidebar Navigation Model

Width:

w-64


Sticky behavior:

sticky left full-height


Sections:

Dashboard

Tours

Calendar

Bookings

Manifests

Reports

Media

Settings


Example structure:

Dashboard

Tours

Bookings

Calendar

Manifests

Reports

Media

Settings


Sidebar must remain visible across all admin pages.


---

# Admin Header Bar

Optional top header area includes:

page title

breadcrumbs

context actions

primary CTA


Example:

Bookings

Filter controls

Export button


---

# Dashboard Page Layout

Route:

/admin


Purpose:

operational overview surface


Widgets:

today departures

upcoming bookings

seat utilization snapshot

revenue today

alerts


Layout:

grid lg:grid-cols-4 gap-6


Example widgets:

Today’s departures

Upcoming week departures

Pending bookings

Revenue summary


Each widget:

clickable

navigates to filtered dataset


---

# Tours Manager Layout

Route:

/admin/tours


Displays:

tour list table


Columns:

title

status

featured

capacity

last updated

edit button


Actions:

create new tour

edit tour

toggle publish

toggle featured


Top actions:

Create Tour


Row actions:

Edit


---

# Tour Editor Layout

Route:

/admin/tours/[id]


Editor uses tab structure.


Tabs:

Content

Pricing

Availability

Media

Settings


---

## Content Tab

Editable fields:

title

slug

short description

long description

duration text

group size text

price summary text

inclusions

exclusions

what to bring

FAQ


Layout:

two-column grid on desktop

single-column mobile


---

## Pricing Tab

Displays:

pricing rules table


Columns:

passenger type

price

rule condition

priority

status


Actions:

add rule

edit rule

delete rule


Validation:

rule overlap prevention


---

## Availability Tab

Displays:

monthly availability calendar


Supports:

capacity overrides

cutoff overrides

manual availability toggles


Click behavior:

click date

open override modal


Modal inputs:

capacity override

cutoff override

available toggle

operator note


Range selection support required.


---

## Media Tab

Displays:

tour gallery manager


Supports:

upload

delete

reorder

hero image selection


Layout:

image grid


Each card:

thumbnail

drag handle

delete icon


---

## Settings Tab

Fields:

default capacity

default cutoff hours

booking window limits

default availability mode


Used as fallback logic when overrides absent.


---

# Availability Calendar Page Layout

Route:

/admin/calendar


Purpose:

global override surface


Displays:

month grid


Color logic:

available

limited

sold out

cutoff passed

override active


Click behavior:

single click opens override modal


Range select behavior:

shift-click range selection


Bulk override modal supports:

capacity override

cutoff override

availability toggle


---

# Bookings Manager Layout

Route:

/admin/bookings


Displays:

bookings table


Columns:

booking reference

tour

date

passenger counts

customer name

status

payment status

actions


Filters:

date

tour

status

customer search


Top actions:

Export CSV


Row actions:

View booking


---

# Booking Detail Page Layout

Route:

/admin/bookings/[id]


Sections:

booking summary

customer information

passenger breakdown

pricing snapshot

departure info

activity timeline


Actions:

edit passengers

change departure

cancel booking

issue refund


All actions:

availability revalidated before commit


---

# Booking Activity Timeline

Displays:

booking created

payment received

passenger edit

departure change

refund issued

override applied


Each entry includes:

timestamp

admin user

action label


Stored in:

booking_activity_log table


---

# Driver Manifest Page Layout

Route:

/admin/manifests


Filters:

date selector

tour selector


Displays:

confirmed bookings only


Columns:

customer name

phone

passenger counts

pickup location

notes


Actions:

export PDF

print manifest


Layout:

table-first design


Optimized for:

tablet

print

clipboard export


---

# Reports Page Layout

Route:

/admin/reports


Sections:

revenue summary

passenger totals

tour performance


Filters:

date range

tour


Charts:

daily revenue

monthly revenue

passenger distribution


Layout:

stacked analytics cards


---

# Media Library Layout

Route:

/admin/media


Displays:

image grid


Filters:

tour

image type


Actions:

upload

delete

reorder

replace


Supports:

drag-and-drop ordering


---

# Settings Panel Layout

Route:

/admin/settings


Tabs:

Business Info

Email Settings

Payment Settings

Branding

Availability Defaults


Editable fields:

operator email

support phone

timezone

currency

default cutoff hours


Stripe keys stored securely.


---

# Table UX Pattern Rules

Tables must support:

sorting

filtering

pagination

row click navigation


Row hover state:

enabled


Selected row highlight:

enabled


Sticky header:

enabled


---

# Modal Interaction Rules

Used for:

availability override

delete confirmation

booking edits

media upload


Modal style:

rounded-2xl

shadow-xl

max-w-lg


Escape closes modal


---

# Notification Pattern

Success message:

top-right toast


Error message:

top-right toast


Example:

Booking updated successfully


Example:

Capacity exceeded for selected date


---

# Form Interaction Rules

Inline validation required


Example:

invalid email format


Example:

capacity exceeded warning


Prevent submission when invalid


---

# Admin Color Surface Strategy

Background:

gray-50


Cards:

white


Borders:

gray-200


Primary action color:

brand primary


Danger action color:

red-600


Avoid marketing accent colors in admin UI.


---

# Keyboard Interaction Support

Supported:

escape closes modal

enter submits form

tab navigates fields


Improves operator speed.


---

# Performance Targets

Admin pages must:

load under 1 second

paginate large tables

avoid blocking queries

lazy-load heavy datasets


Manifest generation must:

render instantly


---

# Admin UI Guarantees

This admin interface structure ensures:

safe availability override workflow

fast booking lifecycle edits

predictable navigation hierarchy

operator-friendly manifests

clear reporting visibility

media control efficiency

scalable tour configuration workflow


This document defines the operational interface architecture of the booking platform.