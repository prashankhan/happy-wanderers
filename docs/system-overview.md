# System Overview — Tour Booking Platform Architecture

## Platform Purpose

This platform is a custom-built tour operator booking system designed for small-group rainforest experiences departing from Cairns and surrounding pickup regions.

It supports:

- public tour discovery
- real-time availability validation
- pickup-aware booking flow
- seat-capacity enforcement
- Stripe-based checkout
- automated confirmation lifecycle
- admin availability overrides
- manifest generation for drivers
- reporting and operational visibility

The system is optimized for a single operator managing multiple tours with shared pickup logistics, not a marketplace.


---

# Platform Principles

The architecture follows these principles:

1. Availability must always be correct
2. Capacity must never be oversold
3. Pickup logistics must remain predictable
4. Admin overrides must remain safe
5. Stripe confirmation must be authoritative
6. Email automation must remain lightweight
7. UI must support mobile-first booking behavior


---

# User Roles

## Visitor (Public User)

Can:

- browse tours
- view availability calendar
- select pickup location
- choose guest counts
- submit booking
- complete Stripe checkout
- receive confirmation email


## Admin (Operator)

Can:

- create and edit tours
- manage gallery assets
- manage pricing rules
- manage pickup locations
- override availability
- override capacity
- close specific dates
- adjust booking status
- generate driver manifests
- view reporting dashboards


---

# Core Entities

The system revolves around these entities:

- Tours
- Tour Departures
- Pickup Locations
- Bookings
- Guests
- Availability Overrides
- Pricing Rules
- Media Assets

Relationships between these entities define the booking lifecycle.


---

# Customer Booking Journey

Visitor journey flow:

Homepage  
→ Tours Index Page  
→ Tour Detail Page  
→ Availability Calendar  
→ Pickup Selection  
→ Guest Selection  
→ Contact Details  
→ Stripe Checkout  
→ Booking Confirmation Page  
→ Confirmation Email Sent  

Each step performs validation before allowing progress.


---

# Booking Lifecycle

Booking creation pipeline:

Select Date  
→ Validate departure exists  
→ Validate pickup availability  
→ Validate cutoff window  
→ Validate seat availability  
→ Calculate pricing  
→ Create booking session  
→ Create Stripe Payment Intent  
→ Await payment confirmation  
→ Receive Stripe webhook confirmation  
→ Confirm booking record  
→ Send confirmation email  

Stripe confirmation is the only authority that finalizes bookings.


---

# Availability Engine Logic

Availability is calculated using layered logic:

Base Tour Schedule  
→ Seasonal Rules (optional)  
→ Date Overrides  
→ Capacity Overrides  
→ Existing Bookings  
→ Cutoff Enforcement  

Overrides always take precedence over base schedules.

Capacity cannot drop below already-booked seats.


---

# Pickup Logic Model

Each tour supports multiple pickup locations.

Pickup configuration includes:

- pickup location name
- pickup time
- pickup order priority
- tour eligibility

Pickup availability is validated during booking selection.


---

# Capacity Model

Capacity is defined per departure date.

Example:

Tour capacity: 11 guests  
Guests booked: 6  
Seats remaining: 5  

Capacity enforcement applies to:

- adults
- children
- infants

Infants count toward capacity.


---

# Pricing Engine Model

Pricing is calculated using:

- base price (adult)
- child price
- infant rule
- date override pricing
- seasonal pricing rules (optional)
- private tour overrides (optional)

Pricing is finalized before Stripe payment intent creation.


---

# Cutoff Enforcement Model

Bookings are blocked after cutoff window expires.

Example:

Departure time: 7:30 AM  
Cutoff rule: 8 hours before departure  
Booking closes: 11:30 PM previous day  

Cutoff enforcement occurs:

- calendar selection stage
- booking validation stage
- payment confirmation stage

Bookings cannot bypass cutoff logic.


---

# Stripe Payment Lifecycle

Stripe manages payment confirmation authority.

Flow:

Create Payment Intent  
→ Customer completes checkout  
→ Stripe processes payment  
→ Webhook confirms payment success  
→ Booking marked confirmed  
→ Confirmation email triggered  

Bookings remain pending until webhook confirmation.


---

# Email Automation Lifecycle

Emails triggered automatically:

- Booking confirmation email
- Admin notification email
- (Optional future: reminder email)
- (Optional future: cancellation email)

Emails are event-driven, not scheduled workflows.


---

# Admin Workflow Model

Operator workflow:

View dashboard summary  
→ Monitor today's departures  
→ Adjust availability calendar  
→ Override capacity if needed  
→ Adjust pricing if needed  
→ Review bookings list  
→ Generate driver manifest  
→ Export reports  

Admin actions never bypass availability safety rules.


---

# Manifest Generator Model

Manifest generation supports drivers and operators.

Manifest includes:

- tour name
- departure date
- pickup schedule
- guest names
- guest counts
- special notes
- contact phone numbers

Generated per departure date.


---

# Reporting Model

Reporting includes:

- bookings by date
- guests by date
- revenue totals
- tour performance
- upcoming departures

Reporting supports operational visibility rather than marketing analytics.


---

# Media Management Model

Media assets support:

- tour galleries
- hero images
- OpenGraph images
- admin uploads
- manual sorting order

Media ordering uses:

display_order

field inside media assets table.


---

# Calendar Override Model

Overrides support:

- close specific dates
- reduce capacity
- increase capacity
- override pricing
- range-based edits
- single-date edits

Overrides never invalidate existing bookings.


---

# Safety Rules

The platform enforces these protections:

- capacity cannot drop below confirmed seats
- cutoff windows cannot be bypassed
- Stripe confirmation required before booking finalization
- pickup selection required before checkout
- date availability validated before payment intent creation

These rules prevent booking integrity failures.


---

# Public Interface Pages

Customer-facing pages:

- Homepage
- Tours Index Page
- Tour Detail Page
- Booking Flow Pages
- Confirmation Page
- FAQ Page
- Contact Page
- Policy Pages

All pages support mobile-first behavior.


---

# Admin Interface Pages

Admin-facing pages:

- Dashboard
- Bookings Manager
- Tour Editor
- Availability Calendar
- Pricing Rules Manager
- Media Library
- Pickup Locations Manager
- Reports
- Settings

Admin UI prioritizes operational clarity over analytics complexity.


---

# Platform Scope (Version 1)

Included:

- multi-tour support
- multi-pickup support
- seat capacity enforcement
- availability overrides
- Stripe checkout
- confirmation emails
- manifest generator
- reporting dashboard
- media library
- admin editor interface


Excluded (future upgrades):

- multi-operator marketplace support
- agent commission system
- discount code engine
- gift card system
- subscription products
- advanced analytics forecasting
- automated SMS notifications

These may be added later without changing architecture foundations.


---

# Architecture Summary

This system is designed as:

single-operator  
multi-tour  
pickup-aware  
capacity-safe  
override-enabled  
Stripe-authoritative  
mobile-first  
admin-controlled  

It prioritizes:

availability accuracy  
booking integrity  
operator control  
customer clarity  
conversion confidence  

over marketplace complexity.