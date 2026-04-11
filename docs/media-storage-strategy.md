# Media Storage Strategy — Tour Image Management Architecture

## Overview

This document defines how images and media assets are stored, processed, and delivered across the booking platform.

The media system ensures:

- fast page load speeds
- SEO-friendly image delivery
- safe admin uploads
- structured storage paths
- hero image control
- CDN optimization readiness
- deletion safety
- future extensibility for galleries and videos

Version 1 supports:

tour images only


---

# Media Storage Objectives

The media system must support:

tour hero images

tour gallery images

admin image uploads

image ordering

SEO alt text support

CDN delivery

safe deletion logic


---

# Media Table Source

Media metadata stored inside:

tour_images


Fields:

id

tour_id

image_url

storage_path

file_name

file_size

mime_type

alt_text

caption

sort_order

is_hero

deleted_at

created_at


---

# Storage Strategy

Images stored using:

object storage


Recommended providers:

Cloudflare R2

AWS S3

Supabase Storage


Recommended Version 1 provider:

Cloudflare R2


Reason:

low cost

global CDN compatibility

Next.js friendly

simple signed URL support


---

# Storage Path Structure

Images stored using structured directory format:

/tours/{tour-slug}/hero/

/tours/{tour-slug}/gallery/


Example:

/tours/whitsundays-sailing/hero/hero-01.jpg

/tours/whitsundays-sailing/gallery/gallery-01.jpg


Benefits:

organized storage

safe cleanup

easy migration later

predictable URLs


---

# Image Upload Flow

Admin uploads image

↓

image stored in object storage

↓

metadata stored in:

tour_images table

↓

image available immediately inside admin UI

↓

image served via CDN URL


---

# Hero Image Rules

Each tour supports:

one hero image only


Stored as:

is_hero = true


Constraint:

one hero image per tour


Recommended database enforcement:

partial unique index

where:

is_hero = true

AND deleted_at IS NULL


---

# Gallery Image Rules

Tours support:

multiple gallery images


Sorted using:

sort_order


Example:

1

2

3

4


Rendered in ascending order


---

# Image Ordering Behavior

Admin can reorder images using:

drag-and-drop interface


System updates:

sort_order column


No image rename required


---

# Image Replacement Strategy

Replacing image:

upload new image

update storage_path

update image_url


Old file remains:

until cleanup job removes unused assets


Safer than immediate deletion


---

# Image Soft Delete Strategy

Images never deleted immediately


Instead:

deleted_at timestamp set


Example:

deleted_at = NOW()


Benefits:

undo support possible

safe rollback

prevents broken frontend URLs


---

# Permanent Delete Strategy

Cleanup job removes:

files where:

deleted_at older than retention window


Recommended retention window:

7 days


Handled by:

scheduled cleanup worker


---

# CDN Delivery Strategy

Images delivered via:

CDN-backed storage URL


Example:

https://cdn.domain.com/tours/whitsundays-sailing/hero/hero-01.jpg


Benefits:

fast load speed

global delivery

SEO optimization

reduced server load


---

# Next.js Image Optimization Strategy

Images rendered using:

next/image


Example:

<Image
  src={image_url}
  alt={alt_text}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
/>


Benefits:

automatic responsive sizing

lazy loading

modern formats

performance optimization


---

# Supported File Types

Allowed formats:

jpg

jpeg

png

webp


Recommended format:

webp


Reason:

smaller file size

faster load time

modern browser support


---

# File Size Limits

Recommended upload limits:

hero image:

max 2MB


gallery image:

max 1MB


Reason:

performance protection


---

# Image Naming Convention

Generated automatically during upload:

{tour-slug}-{type}-{random-id}.jpg


Example:

whitsundays-sailing-hero-a82hf.jpg


Benefits:

collision prevention

predictable structure

easy cleanup


---

# Alt Text Strategy

Alt text stored in:

tour_images.alt_text


Used for:

accessibility

SEO ranking

image search indexing


Admin required to provide:

alt_text during upload


Example:

Guests sailing through the Whitsundays at sunset


---

# Caption Strategy

Captions optional


Stored in:

tour_images.caption


Displayed inside:

gallery modal view

optional frontend layouts


---

# Image Rendering Locations

Hero image used in:

tour hero section

tour card preview

SEO OpenGraph preview

social sharing preview


Gallery images used in:

tour gallery section

lightbox modal

mobile swipe gallery


---

# Social Sharing Image Strategy

Hero image doubles as:

OpenGraph image


Used in:

Facebook preview

LinkedIn preview

WhatsApp preview


Future enhancement possible:

custom og_image field


Not required Version 1


---

# Upload Security Strategy

Uploads validated before storage


Validate:

file type

file size

mime type


Reject:

executables

scripts

svg (optional restriction)


Reason:

security protection


---

# Storage URL Structure

Store:

public CDN URL

inside:

image_url


Store:

internal object storage path

inside:

storage_path


Example:

image_url:

https://cdn.domain.com/tours/reef-tour/hero/reef-tour-hero.jpg


storage_path:

tours/reef-tour/hero/reef-tour-hero.jpg


Allows:

safe file deletion later


---

# Image Deletion Safety Rule

Before deleting image:

check:

is_hero = true


If yes:

require replacement confirmation


Prevents:

tour without hero image


---

# Admin Upload Permissions

Permissions:

admin:

upload

delete

replace

reorder

set hero image


staff:

upload only


Staff cannot:

delete

replace hero image


---

# Future Media Expansion Strategy

Future support may include:

tour videos

customer-uploaded media

360-degree tour previews

guide documents

PDF itineraries


Possible future table:

tour_media_assets


Not required Version 1


---

# Performance Guarantees

This media strategy ensures:

fast page load speed

SEO-friendly image structure

safe admin upload workflow

organized storage hierarchy

hero image protection

gallery ordering flexibility

CDN-ready delivery pipeline

future extensibility without redesign


This media storage system defines how all visual assets are handled across the platform.