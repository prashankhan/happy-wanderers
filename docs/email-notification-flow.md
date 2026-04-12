# Email Notification Flow — Booking Communication System Specification

## Overview

This document defines when and how emails are sent across the booking platform.

The email system ensures:

- customers receive booking confirmations
- admins receive booking alerts
- lifecycle transitions trigger appropriate communication
- duplicate emails are prevented
- refunds and cancellations notify correctly
- delivery timestamps are recorded
- communication remains audit-safe

Version 1 supports transactional email only.

Marketing emails are excluded.

**Resend `from` address:** resolved from `system_settings.resend_from_email` first, then `EMAIL_FROM` / `RESEND_FROM` environment variables (see `lib/email/send.ts`). `RESEND_API_KEY` remains env-only.


---

# Email Delivery Events

Emails are triggered by lifecycle transitions.

Supported triggers:

booking confirmed

booking cancelled

booking refunded

admin manual booking created

contact form submitted


Optional future triggers:

reminder emails

pre-tour preparation emails

post-tour feedback emails


---

# Booking Confirmation Email

Triggered when:

booking status becomes confirmed


Triggered by:

Stripe webhook success

OR

admin manual booking creation


Email sent to:

customer_email


Timestamp stored in:

confirmation_email_sent_at


Email includes:

booking reference

tour title

booking date

departure location

pickup time

passenger counts

total price

currency

customer support contact details


Example subject:

Your booking is confirmed — Reference HW-240315-4821


---

# Admin Booking Alert Email

Triggered when:

booking status becomes confirmed


Sent to:

system_settings.admin_alert_email


Purpose:

notify operator immediately


Email includes:

booking reference

tour title

booking date

departure location

pickup time

passenger counts

customer name

customer phone

customer notes


Timestamp stored in:

admin_alert_sent_at


---

# Manual Booking Confirmation Email

Triggered when:

admin creates booking manually

AND

booking status = confirmed


Sent to:

customer_email


Includes:

same content as Stripe confirmation email


---

# Booking Cancellation Email

Triggered when:

booking status becomes cancelled


Triggered by:

admin cancellation


Sent to:

customer_email


Email includes:

booking reference

tour title

booking date

cancellation confirmation message

support contact details


Optional:

refund explanation (if applicable)


---

# Booking Refund Email

Triggered when:

booking status becomes refunded


Triggered by:

Stripe refund webhook


Sent to:

customer_email


Email includes:

booking reference

refund confirmation message

refund amount

currency

expected refund processing timeline


---

# Contact Form Notification Email

Triggered when:

contact_messages record created


Sent to:

system_settings.admin_alert_email


Includes:

name

email

phone

topic

message


Optional:

auto-reply confirmation email to sender


---

# Duplicate Email Prevention Rule

System must check:

confirmation_email_sent_at


Before sending confirmation email.


If already set:

skip sending email


Prevents:

duplicate webhook-triggered sends


Same logic applies to:

admin_alert_sent_at


---

# Email Trigger Source Rules

Emails triggered only after:

database update success


Example:

Stripe webhook received

booking updated

status confirmed

email sent


Never send email:

before database update completes


Reason:

prevents mismatch errors


---

# Email Failure Handling Strategy

If email fails:

system logs error

retry allowed manually


Booking status must NOT change


Email failure must NOT block:

confirmation

availability release

reporting updates


---

# Email Template Variables

Templates must support:

booking_reference

tour_title

booking_date

pickup_location_name

pickup_time

passenger_counts

total_price

currency

support_email

support_phone


Variables injected dynamically.


---

# Email Template Storage Strategy

Version 1:

templates stored inside codebase


Future upgrade option:

templates stored in database


Allows:

non-developer editing


Not required in Version 1.


---

# Email Delivery Provider Strategy

Recommended provider:

Resend


Alternative supported providers:

SendGrid

Postmark

Amazon SES


Provider selected via:

environment configuration


---

# Email Timestamp Tracking Fields

Stored inside bookings table:

confirmation_email_sent_at

admin_alert_sent_at


Used for:

duplicate prevention

audit tracking

support debugging


---

# Email Retry Strategy

Version 1:

manual retry only


Future upgrade option:

automatic retry queue


Possible implementation later:

email_jobs table


Not required in Version 1.


---

# Email Logging Strategy

Failures recorded in:

system_jobs_log


Example entry:

job_name = send_confirmation_email

status = failed

error_message = provider timeout


Helps debugging delivery issues.


---

# Email Security Requirements

Emails must never expose:

Stripe payment intent IDs

internal admin notes

database identifiers

override notes


Emails may include:

booking reference

customer-visible booking details


---

# Admin Email Safety Rules

Admin alerts must include:

customer phone number


Reason:

operator must contact customer quickly if needed


Admin alerts must NOT include:

payment provider secrets


---

# Email Formatting Requirements

Emails must be:

mobile-friendly

plain-text fallback compatible

timezone-aware


Pickup time must display using:

Australia/Brisbane timezone


---

# Reminder Email Strategy (Future Extension)

Future reminders may include:

24-hour reminder

same-day reminder

pickup-time reminder


Triggers stored later in:

scheduled email job system


Not required in Version 1.


---

# Feedback Email Strategy (Future Extension)

Future feature:

post-tour feedback email


Triggered after:

tour completion date


Not required in Version 1.


---

# Communication Audit Guarantees

This email system ensures:

customers always receive confirmations

admins always receive alerts

duplicate emails prevented

refund notifications remain consistent

manual bookings behave correctly

contact form messages reach operator

communication timestamps tracked safely


This notification flow defines all transactional communication behavior for Version 1 of the platform.