# Site Structure — Routing & Page Architecture Blueprint

## Overview

This document defines the full page architecture of the booking platform.

It includes:

public marketing site structure

tour browsing flow

availability selection flow

checkout flow

customer interaction surfaces

admin application routing

system utility pages

legal pages

This structure ensures predictable navigation, strong SEO indexing,
and conversion-focused booking flow continuity.


---

# Architecture Philosophy

The site is structured around three layers:

Layer 1

Discovery

homepage

tour index

tour detail pages


Layer 2

Decision

availability calendar

pricing clarity

tour inclusions

gallery

FAQs


Layer 3

Conversion

booking form

checkout

confirmation


Admin interface exists as a separate operational surface.


---

# Routing Strategy

Framework:

Next.js App Router


Route grouping structure:

/(app)

/admin

/api


Public routes live under:

/app


Admin routes live under:

/admin


API routes live under:

/api


---

# Public Website Structure


---

## Homepage

Route:

/


Purpose:

primary conversion entry point

brand positioning

featured tour exposure

quick booking entry


Sections:

hero section

featured tours

why choose us

experience highlights

gallery preview

testimonials

FAQ preview

contact CTA


Primary CTA:

View Tours

Secondary CTA:

Check Availability


---

## Tours Index Page

Route:

/tours


Purpose:

tour discovery surface


Features:

tour cards grid

filter support (future-ready)

featured badge support

pricing summary preview

duration summary preview


SEO target:

high-intent browsing users


---

## Tour Detail Page

Route:

/tours/[slug]


Purpose:

conversion decision page


Sections:

hero gallery

tour overview

duration info

group size info

pricing summary

departure locations

availability calendar

inclusions

exclusions

what to bring

FAQ

reviews (future-ready)

booking CTA


Primary CTA:

Check Availability


Secondary CTA:

Book Now


---

## Availability Calendar Page

Route:

/availability


Alternative entry support:

/tours/[slug]?date=selected


Purpose:

date selection interface


Features:

monthly calendar

capacity indicators

cutoff enforcement

override visibility

remaining seats indicator


CTA:

Continue Booking


---

## Booking Page

Route:

/booking


Purpose:

customer detail capture


Inputs:

passenger counts

departure location

customer info

notes


Validation:

availability engine check

cutoff enforcement check


CTA:

Continue to Payment


---

## Checkout Redirect Surface

Route:

Stripe hosted checkout


Purpose:

secure payment processing


Handled externally by:

Stripe Checkout


---

## Booking Success Page

Route:

/booking/success


Purpose:

confirmation surface


Displays:

booking reference

tour summary

passenger counts

booking date

contact instructions


Triggers:

confirmation email already sent


---

## Booking Cancel Page

Route:

/booking/cancelled


Purpose:

failed payment handling


Displays:

retry booking suggestion

support contact link


---

## Contact Page

Route:

/contact


Purpose:

customer support surface


Includes:

contact form

phone

email

operating hours


Stores:

contact_messages table


---

# Legal Pages


---

## Privacy Policy

Route:

/privacy


---

## Terms & Conditions

Route:

/terms


---

## Cancellation Policy

Route:

/cancellation-policy


Required for:

payment compliance

tour operator protection


---

# Optional SEO Expansion Pages (Future Phase)


---

## Region Landing Pages

Example:

/destinations/whitsundays


Purpose:

organic discovery traffic


---

## Blog / Guides Section

Route:

/guides


Supports:

SEO authority building


---

# Admin Application Structure


Admin routes live under:

/admin


Authentication required for all routes


---

## Admin Dashboard

Route:

/admin


Displays:

today bookings

upcoming departures

seat utilization summary

revenue summary

alerts


---

## Tours Manager

Route:

/admin/tours


Displays:

tour list

publish toggle

featured toggle

edit access


---

## Tour Editor

Route:

/admin/tours/[id]


Tabs:

content

pricing

availability

media

settings


Purpose:

central tour configuration surface


---

## Availability Calendar

Route:

/admin/calendar


Displays:

monthly grid

override indicators

capacity override access

cutoff override access


Supports:

single-day override

range override


---

## Bookings Manager

Route:

/admin/bookings


Displays:

booking table

filters

search

status indicators


Filters:

date

tour

status

customer


---

## Booking Detail Page

Route:

/admin/bookings/[id]


Displays:

customer info

passenger counts

pickup location

pricing snapshot

activity log

status controls


Supports:

cancel

refund

edit passenger counts

change departure


---

## Driver Manifests

Route:

/admin/manifests


Displays:

departure-day passenger lists


Supports:

export PDF

print view


---

## Reporting Dashboard

Route:

/admin/reports


Displays:

revenue summaries

passenger totals

tour performance

date filters


---

## Media Library

Route:

/admin/media


Displays:

gallery assets

tour hero images

upload interface


Supports:

reorder

replace

delete


---

## Settings Panel

Route:

/admin/settings


Tabs:

business info

email settings

payment config

branding

availability defaults


---

# URL Design Principles


URLs must be:

human-readable

SEO-friendly

stable over time


Example:

/tours/whitsundays-sailing


Avoid:

numeric IDs in public URLs


Use:

slug-based routing


---

# Navigation Hierarchy


Primary navigation:

Home

Tours

Contact


Secondary navigation:

Policies

Support


Admin navigation separated entirely.


---

# Booking Flow Navigation Model


Flow:

Homepage

↓

Tours Index

↓

Tour Detail

↓

Availability Selection

↓

Booking Form

↓

Stripe Checkout

↓

Confirmation Page


Linear flow improves conversion clarity.


---

# Breadcrumb Model


Example:

Home

>

Tours

>

Tour Detail


Displayed on:

tour pages

policy pages

guides pages


Not required on:

homepage


---

# Sitemap Structure (SEO)


/

 /tours

 /tours/[slug]

 /contact

 /privacy

 /terms

 /cancellation-policy


Future additions:

/destinations/[region]

/guides/[article]


---

# Structure Guarantees


This routing architecture ensures:

clean SEO indexing

predictable booking flow

clear admin separation

future expansion compatibility

Next.js App Router alignment

conversion-focused navigation clarity


This document defines the structural map of the booking platform.