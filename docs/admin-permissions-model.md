# Admin Permissions Model — Operator Access Control Specification

## Overview

This document defines how administrative access is structured across the booking platform.

The permissions system ensures:

- booking integrity protection
- availability override safety
- pricing control security
- reporting consistency
- Stripe synchronization safety
- audit transparency
- scalable staff-role expansion later

Version 1 supports a lean operator environment but is designed to expand safely.


---

# Admin Role Types

Version 1 supports two roles:

admin
staff


---

# Admin Role Purpose

Full system access.

Admins can:

manage tours
manage availability
edit pricing
edit bookings
cancel bookings
issue refunds
manage overrides
access reports
manage images
edit system settings
manage staff accounts


---

# Staff Role Purpose

Operational support access only.

Staff can:

view bookings
create manual bookings
edit passenger counts
edit customer contact details
view availability calendar
view manifests
view reports


Staff cannot:

cancel bookings
issue refunds
edit pricing
edit system settings
delete overrides
manage users
modify tour structure


---

# Permission Matrix

## Tours

admin:

create tours
edit tours
delete tours
publish tours
archive tours

staff:

view only


---

## Availability Calendar

admin:

create overrides
edit overrides
delete overrides
change capacity overrides
change cutoff overrides
close dates
reopen dates

staff:

view only


---

## Pricing Rules

admin:

create pricing rules
edit pricing rules
delete pricing rules

staff:

no access


---

## Bookings

admin:

create booking
edit booking
cancel booking
refund booking
override booking totals
change departure location
change passenger counts

staff:

create booking
edit passenger counts
edit customer details
add notes


staff cannot:

cancel booking
refund booking
change booking date
change tour assignment


---

# Booking Status Modification Permissions

Allowed status changes:

admin:

pending → confirmed
pending → cancelled
confirmed → cancelled
confirmed → refunded

staff:

pending → confirmed (manual booking only)


staff cannot:

cancel confirmed bookings
refund bookings


---

# Customer Data Permissions

admin:

full access

staff:

view and edit customer contact info


Fields allowed:

customer_name
customer_email
customer_phone
customer_notes


Fields restricted:

pricing snapshot
booking_reference
stripe identifiers


---

# Stripe Permissions

admin:

issue refunds
view Stripe references

staff:

view payment status only


Staff cannot:

trigger refunds


---

# Reporting Permissions

admin:

full reporting access

staff:

view-only reporting access


Staff cannot:

export financial reports


---

# Manifest Permissions

admin:

generate manifests
export manifests

staff:

generate manifests
view manifests


Staff cannot:

modify manifests


---

# Media Permissions

admin:

upload images
delete images
replace images
set hero images

staff:

upload images only


Staff cannot:

delete images
set hero image


---

# System Settings Permissions

admin:

edit system settings


staff:

no access


Example restricted fields:

booking_reference_prefix
default_cutoff_hours
timezone
currency_code


---

# Admin User Management Permissions

admin:

create users
edit users
disable users
delete users
change roles

staff:

no access


---

# Activity Logging Requirements

All privileged actions must create entries in:

booking_activity_log


Examples:

booking cancelled
booking refunded
pricing overridden
capacity changed
override deleted
tour unpublished


Fields recorded:

action_type
performed_by
timestamp
previous_value
new_value


---

# Override Safety Layer

Override deletion allowed only for:

admin


Staff attempting override deletion:

operation blocked


Reason:

override removal affects availability engine behavior


---

# Pricing Override Safety Layer

Only admins may override:

total_price_snapshot


Staff cannot modify:

pricing snapshots


Reason:

financial integrity protection


---

# Booking Date Change Safety Rule

Changing booking date affects:

availability engine
capacity calculations
manifests


Allowed only for:

admin


Staff blocked from editing:

booking_date


---

# Booking Tour Change Safety Rule

Changing tour assignment affects:

pricing
capacity
manifests
pickup logistics


Allowed only for:

admin


Staff blocked


---

# Refund Authorization Rule

Refunds allowed only for:

admin


Refund flow:

admin triggers Stripe refund

Stripe webhook confirms refund

system updates booking status


Staff blocked from initiating refunds


---

# Role Storage Structure

Roles stored in:

admin_users.role


Supported values:

admin
staff


Future-ready structure allows expansion:

finance
operations
marketing
support


Not required in Version 1.


---

# Permission Enforcement Layer

Permissions enforced at:

API layer

server action layer

admin UI visibility layer


Never rely on:

client-only permission enforcement


---

# Future Role Expansion Strategy

Future roles may include:

finance manager

operations manager

customer support

marketing manager


Possible permissions:

refund-only access

reporting-only access

manifest-only access


System already structured to support expansion.


---

# Audit Integrity Guarantees

Permission model ensures:

only authorized users change availability

only authorized users change pricing

only authorized users cancel bookings

only authorized users issue refunds

financial data remains protected

booking integrity preserved

override system remains safe


This permissions model protects the operational backbone of the booking platform.