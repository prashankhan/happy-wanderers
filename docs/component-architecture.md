# Component Architecture — React UI System Blueprint

## Overview

This document defines the reusable component structure of the booking platform.

It ensures:

consistent UI behavior

modular scalability

faster development velocity

clean separation between layout and logic

Tailwind-aligned styling consistency

shared component reuse across public and admin interfaces


This architecture prevents page-level duplication.


---

# Architecture Philosophy

All UI must be built from reusable components.

Avoid:

page-specific UI duplication

inline styling variations

logic embedded directly inside pages


Instead:

compose pages from shared primitives


Structure layers:

primitives

shared UI components

feature components

layout shells

page assemblies


---

# Directory Structure Strategy

Recommended structure:

/components

/components/ui

/components/layout

/components/tours

/components/booking

/components/calendar

/components/admin

/components/forms

/components/media


Each folder groups feature-specific components.


---

# UI Primitive Components

Location:

/components/ui


These are atomic reusable UI elements.


Includes:

Button

Input

Textarea

Select

Checkbox

RadioGroup

Modal

Badge

Card

Tabs

Toast

DropdownMenu

Table

SkeletonLoader


Used everywhere across system.


---

# Button Component

Location:

/components/ui/button.tsx


Variants:

primary

secondary

ghost

danger


Sizes:

sm

md

lg


Example usage:

<Button variant="primary" size="lg" />


Tailwind mapping:

primary

bg-blue-900 text-white hover:bg-blue-800

secondary

border border-gray-300

ghost

underline hover:underline

danger

bg-red-600 text-white


---

# Card Component

Location:

/components/ui/card.tsx


Variants:

default

interactive

compact


Base style:

bg-white rounded-2xl shadow-sm p-6


Interactive:

hover:shadow-md transition


---

# Modal Component

Location:

/components/ui/modal.tsx


Used for:

availability overrides

booking edits

confirm dialogs

media uploads


Supports:

keyboard close

escape close

backdrop click close


Max width:

max-w-lg


---

# Table Component

Location:

/components/ui/table.tsx


Supports:

sorting

pagination

sticky header

row click navigation


Used across:

bookings table

pricing rules

media library

admin reports


---

# Badge Component

Location:

/components/ui/badge.tsx


Variants:

success

warning

error

info

neutral


Used for:

booking status

availability status

featured labels


---

# Layout Shell Components

Location:

/components/layout


Includes:

Navbar

Footer

Container

Section

Breadcrumbs


Used across public pages.


---

# Container Component

Standard width wrapper:

max-w-7xl mx-auto px-6


Used for:

homepage

tour pages

contact page

policy pages


---

# Section Component

Handles vertical rhythm.


Variants:

default

compact

hero


Mappings:

default

py-20

compact

py-12

hero

pt-28 pb-24


---

# Navbar Component

Location:

/components/layout/navbar.tsx


Includes:

logo

navigation links

primary CTA

mobile menu


Sticky behavior:

enabled


Mobile:

hamburger menu drawer


---

# Footer Component

Location:

/components/layout/footer.tsx


Sections:

brand summary

quick links

contact info

legal links


---

# Tour Feature Components

Location:

/components/tours


Includes:

TourCard

TourGallery

TourHighlights

TourMetaRow

TourInclusions

TourFAQ

TourAvailabilityPreview


Reusable across:

homepage

tour index

tour detail page


---

# TourCard Component

Displays:

image

title

duration

group size

price summary

CTA


Aspect ratio:

4:3


Rounded style:

rounded-xl


---

# TourGallery Component

Supports:

hero display

grid preview

modal expansion


Image style:

rounded-xl


---

# TourAvailabilityPreview Component

Mini calendar preview.


Displays:

available days

limited days

sold-out days


Used on:

tour detail page


---

# Booking Flow Components

Location:

/components/booking


Includes:

PassengerSelector

DepartureSelector

BookingForm

BookingSummaryCard

CheckoutRedirectPanel


Used across:

availability page

booking page

confirmation page


---

# PassengerSelector Component

Supports:

adult count

child count

infant count


Validation:

capacity-aware


Updates:

live pricing preview


---

# DepartureSelector Component

Displays:

pickup locations


Behavior:

radio select layout


Used on:

booking form


---

# BookingSummaryCard Component

Displays:

tour title

date

passenger counts

price summary


Used on:

booking page

confirmation page


---

# Calendar Components

Location:

/components/calendar


Includes:

AvailabilityCalendar

CalendarDayCell

OverrideModal

RangeSelector


Used across:

tour detail page

availability page

admin calendar


---

# AvailabilityCalendar Component

Supports:

monthly grid layout

capacity indicators

cutoff enforcement

override indicators


Modes:

public

admin


Admin mode enables:

override editing


---

# CalendarDayCell Component

Displays:

date

remaining seats

availability color


Color logic:

green available

amber limited

red sold out

gray unavailable


---

# RangeSelector Component

Supports:

shift-click selection

drag selection (future-ready)


Used inside:

admin calendar overrides


---

# Admin Dashboard Components

Location:

/components/admin


Includes:

Sidebar

DashboardWidget

BookingsTable

ManifestTable

ReportsCards

TourEditorTabs


Shared across admin routes.


---

# Sidebar Component

Width:

w-64


Includes:

navigation groups

active state highlight


Persistent across admin layout.


---

# DashboardWidget Component

Displays:

metric label

metric value

optional trend indicator


Clickable navigation supported.


---

# BookingsTable Component

Supports:

filters

sorting

pagination

row click navigation


Used on:

admin bookings page


---

# ManifestTable Component

Displays:

departure passenger list


Columns:

customer name

phone

passenger counts

pickup location


Supports:

print layout


---

# TourEditorTabs Component

Tabs:

content

pricing

availability

media

settings


Controls:

tab switching state


---

# Form Components

Location:

/components/forms


Includes:

FormField

FieldLabel

ErrorMessage

InlineHint


Used across:

booking form

admin editors

contact form


---

# FormField Component

Wraps:

label

input

error message


Ensures:

consistent spacing


---

# ErrorMessage Component

Displays:

validation errors


Color:

red-600


Size:

text-sm


---

# Media Components

Location:

/components/media


Includes:

ImageUploader

GalleryGrid

SortableGallery


Used inside:

tour editor

media library


---

# ImageUploader Component

Supports:

drag-and-drop

file select

preview


Stores:

alt text

caption


---

# SortableGallery Component

Supports:

drag reorder


Updates:

sort_order column


---

# Toast Notification Component

Location:

/components/ui/toast.tsx


Used for:

success messages

error alerts


Position:

top-right


Example:

Booking updated successfully


---

# Skeleton Loader Components

Location:

/components/ui/skeleton.tsx


Used during:

calendar load

booking fetch

tour fetch


Improves perceived performance.


---

# Component Naming Rules

Use:

PascalCase


Examples:

TourCard

BookingSummaryCard

AvailabilityCalendar


Avoid:

snake_case

kebab-case


---

# Component Placement Rules

Reusable UI:

components/ui


Feature UI:

components/{feature}


Layouts:

components/layout


Admin-only UI:

components/admin


Never mix layers.


---

# Component Architecture Guarantees

This component structure ensures:

consistent UI reuse

predictable layout composition

fast feature development

admin and public UI separation

calendar reuse across surfaces

form validation consistency

maintainable React architecture


This document defines the reusable component structure of the booking platform frontend.