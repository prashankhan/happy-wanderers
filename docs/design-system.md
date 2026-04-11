# Design System — UI Foundation Specification

## Overview

This document defines the visual language of the booking platform.

It ensures:

consistent typography

luxury visual hierarchy

accessible contrast ratios

predictable spacing rhythm

component consistency

Tailwind-native implementation

brand alignment with operator identity


Version 1 design goals:

clean

premium

calm

conversion-focused

mobile-first

fast-loading

accessible


---

# Design Philosophy

The interface should feel:

premium but minimal

trustworthy but modern

elegant but readable

structured but breathable


Avoid:

heavy gradients

visual clutter

excessive shadows

marketing-style noise UI


This is a booking platform, not a landing page builder.


---

# Typography System

Primary fonts:

Headings:

Canela-style serif


Body text:

Inter


Implementation strategy:

Use Tailwind defaults where possible

Avoid custom pixel typography scales


---

# Tailwind Typography Mapping

Heading sizes:

Hero Title

text-5xl md:text-6xl


Section Title

text-3xl md:text-4xl


Card Title

text-xl md:text-2xl


Small Heading

text-lg font-semibold


Body Text

text-base


Muted Text

text-sm text-gray-500


Micro Labels

text-xs uppercase tracking-wide


---

# Font Weight Mapping

Hero Titles

font-medium


Section Titles

font-semibold


Card Titles

font-semibold


Body Text

font-normal


Labels

font-medium


Avoid:

font-bold overuse


---

# Color Strategy

Brand palette derived from logo:

deep ocean blue

warm sunset orange

clean white surfaces

neutral grays


Design intent:

travel luxury

ocean clarity

sunrise warmth

trust


---

# Primary Color Tokens

Primary

blue-900 equivalent tone


Accent

orange-500 equivalent tone


Surface

white


Background

gray-50


Text Primary

gray-900


Text Secondary

gray-600


Border

gray-200


Success

green-600


Warning

amber-500


Error

red-600


---

# Color Usage Rules

Primary color used for:

primary buttons

links

focus states

navigation highlights


Accent color used for:

price highlights

availability indicators

featured badges

CTA emphasis


Avoid:

multiple accent colors


---

# Layout Container Width

Main container:

max-w-7xl mx-auto px-6


Used across:

homepage

tour pages

contact page

policy pages


Admin panel:

max-w-full px-6


---

# Vertical Spacing Rhythm

Section spacing:

py-20


Compact section spacing:

py-12


Hero spacing:

pt-28 pb-24


Card spacing:

p-6


Micro spacing:

gap-2

gap-4

gap-6


Consistency matters more than creativity here.


---

# Grid System

Primary layout grid:

grid md:grid-cols-2 gap-12


Card grid:

grid md:grid-cols-3 gap-8


Gallery grid:

grid md:grid-cols-4 gap-4


Admin dashboard grid:

grid lg:grid-cols-4 gap-6


---

# Button System

Primary button:

bg-blue-900 text-white px-6 py-3 rounded-xl


Hover:

hover:bg-blue-800


Secondary button:

border border-gray-300 px-6 py-3 rounded-xl


Ghost button:

text-blue-900 underline-offset-4 hover:underline


Danger button:

bg-red-600 text-white


Buttons always:

rounded-xl

never sharp corners


---

# Border Radius Scale

Cards

rounded-2xl


Buttons

rounded-xl


Inputs

rounded-lg


Modals

rounded-2xl


Avoid mixed radius styles.


---

# Shadow System

Cards

shadow-sm


Hover cards

hover:shadow-md


Modals

shadow-xl


Avoid:

heavy shadows everywhere


Luxury UI uses restraint.


---

# Card Design Pattern

Standard card:

bg-white rounded-2xl shadow-sm p-6


Interactive card:

transition hover:shadow-md


Tour card includes:

image

title

duration

group size

price

CTA button


---

# Form Design Pattern

Input:

border border-gray-300 rounded-lg px-4 py-3 w-full


Focus state:

focus:ring-2 focus:ring-blue-900


Label:

text-sm font-medium mb-1


Spacing:

space-y-4


---

# Navbar Structure

Height:

h-20


Layout:

logo left

navigation center

CTA right


Mobile:

hamburger right


Sticky behavior:

sticky top-0 backdrop-blur bg-white/80


---

# Footer Structure

Sections:

brand summary

quick links

contact info

legal links


Spacing:

py-16


Background:

gray-100


---

# Hero Section Pattern

Structure:

left content

right image


Layout:

grid md:grid-cols-2 gap-12 items-center


Includes:

headline

subheadline

primary CTA

secondary CTA


---

# Tour Card Layout Pattern

Structure:

image

title

meta row

price

CTA


Meta row includes:

duration

group size


Spacing:

space-y-3


---

# Availability Calendar Color Logic

Available

green-500


Low capacity

amber-400


Sold out

red-500


Unavailable

gray-300


Cutoff passed

gray-500


---

# Admin Panel Design Rules

Admin UI must feel:

fast

structured

clear

operational


Avoid:

marketing styling inside admin


Use:

gray surfaces

clear typography

dense spacing


Admin layout:

sidebar left

content right


---

# Sidebar Structure

Width:

w-64


Items:

Dashboard

Tours

Bookings

Calendar

Manifests

Reports

Media

Settings


---

# Icon Strategy

Recommended library:

lucide-react


Reasons:

clean

lightweight

consistent


Avoid mixing icon libraries.


---

# Image Style Rules

Hero images:

edge-to-edge feel


Gallery images:

rounded-xl


Card images:

rounded-xl aspect-[4/3]


Avoid inconsistent aspect ratios.


---

# Motion Strategy

Allowed animations:

hover elevation

button hover transitions

modal fade-in

calendar hover highlight


Avoid:

parallax

scroll gimmicks

heavy animation


Luxury UI feels calm.


---

# Accessibility Targets

Minimum contrast ratio:

WCAG AA


Tap targets:

minimum 44px height


Font size minimum:

text-sm


Focus ring required:

yes


Keyboard navigation supported:

yes


---

# Design System Guarantees

This system ensures:

consistent typography hierarchy

predictable spacing rhythm

accessible interface

premium travel brand appearance

Tailwind-aligned implementation

component reuse efficiency

fast development inside Cursor


This design system defines the visual foundation of the booking platform.