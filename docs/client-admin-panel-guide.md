# Happy Wanderers Admin Panel Operations Guide

Version: Current Release  
Audience: Client operations team (`admin` and `staff`)  
Prepared for: Client handover (PDF)

## Scope

This guide covers only features currently available in the admin panel.  
It excludes future enhancements and unimplemented functionality.

## How To Use This Guide

1. Use Section 2 to confirm access by role.
2. Use Section 3 for step-by-step procedures.
3. Use Section 4 as the daily opening checklist.
4. Use Section 5 as the client walkthrough agenda.

## Role Matrix (Quick Reference)

| Area | Admin | Staff |
| --- | --- | --- |
| Dashboard | Yes | Yes |
| Tours list | Yes | Yes |
| Tour content/pricing changes | Yes | Restricted |
| Calendar override save/clear | Yes | No |
| Bookings list/detail updates | Yes | Yes (operational fields) |
| Cancel booking | Yes | No |
| Refund via Stripe | Yes | No |
| Manual booking creation | Yes | Yes |
| Messages | Yes | No |
| Manifests | Yes | No |
| Reports | Yes | No |
| Media upload | Yes | Yes |
| Media privileged actions (cover/reorder/remove) | Yes | No |
| Team management | Yes | No |
| Settings | Yes | No |

---

## 1) Admin panel at a glance

Current navigation:

- Dashboard
- Tours
- Calendar
- Bookings
- Messages (admin only)
- Manifests (admin only)
- Reports (admin only)
- Media
- Team (admin only)
- Settings (admin only)

---

## 2) Access levels

### Admin

Full access across all pages and actions, including sensitive operations.

### Staff

Operational access for day-to-day work, with restrictions on sensitive actions.

Staff can use:

- Dashboard
- Tours (view-only for admin-controlled fields/actions)
- Calendar (view-only; cannot save/clear overrides)
- Bookings (list/filter/view, create manual booking, edit allowed fields)
- Media (upload support)

Staff cannot use:

- Messages
- Team
- Settings
- Booking cancel/refund actions
- Tour pricing and other admin-only controls

---

## 3) Core workflows (SOP format)

## 3.1 Add and manage tours

Where: `/admin/tours` and `/admin/tours/[id]`

Steps:

1. Open `Tours`.
2. Click `New tour` (admin).
3. Enter basic setup (title and journey type).
4. Open the created tour editor.
5. Complete tabs as needed:
   - `Content`
   - `Pickups`
   - `Pricing`
   - `Availability`
   - `Media`
   - `Settings`
6. Save changes in each section (admin).

Staff note:

- Staff can access tours but admin-controlled editing actions are restricted.

Expected result:

- Tour appears in list with correct status, featured flag, and capacity.

## 3.2 Manage calendar availability

Where: `/admin/calendar`

Steps:

1. Select a tour (or `All tours` for overview).
2. Navigate to required month.
3. Click a date to open day detail (available when a specific tour is selected).
4. Admin only: apply one-off override if needed:
   - block/allow bookings
   - set capacity override
   - set cutoff override (hours)
   - add internal note
5. Save override (or clear existing override).

Expected result:

- Day state updates in calendar after save/clear.

Important:

- Calendar overrides are one-off date controls.
- Base schedule still comes from each tour's weekday/default rules.

## 3.3 Booking management

Where: `/admin/bookings` and `/admin/bookings/[id]`

Steps (list page):

1. Open `Bookings`.
2. Apply filters (date, status, customer email, tour).
3. Open a booking record from the table.

Steps (detail page):

1. Review customer and snapshot information.
2. Edit allowed fields (guest counts/contact details/notes).
3. Save changes.
4. Admin only: use `Cancel booking` or `Refund via Stripe` when needed.

Role note:

- Staff can edit operational fields but cannot run cancel/refund actions.
- Admin has additional sensitive actions.

Expected result:

- Booking updates are reflected in booking detail and activity timeline.

## 3.4 Create a manual booking

Where: `/admin/bookings` -> `New manual booking`

Steps:

1. Click `New manual booking`.
2. Enter:
   - tour
   - date
   - departure location
   - adults/children/infants
   - customer details
   - payment status (paid offline / unpaid)
3. Submit.

Expected result:

- Booking is created and opens in booking detail.

## 3.5 Generate manifests

Where: `/admin/manifests` (admin)

Steps:

1. Select date.
2. Optionally select a tour.
3. Click `Load`.
4. Click `Print` when ready.

Expected result:

- Manifest table shows confirmed bookings for the selected date/tour filters.

## 3.6 Run reports

Where: `/admin/reports` (admin)

Steps:

1. Set date range.
2. Optionally set tour and booking status.
3. Click `Run report`.
4. Review:
   - booking totals
   - revenue by day (confirmed)
   - revenue by tour (confirmed)

Expected result:

- Report totals and tables load for selected filters.

## 3.7 Manage media

Where: `/admin/media`

Steps:

1. Select a tour.
2. Upload tour images.
3. Admin only: manage privileged media actions (cover image/reorder/remove).

Permissions:

- Staff: upload support.
- Admin: privileged actions including cover image/reorder/remove.

## 3.8 Team management

Where: `/admin/team` (admin)

Steps:

1. Review existing dashboard users.
2. Create user with role (`admin` or `staff`).

Expected result:

- New dashboard user is added and can log in at `/admin/login`.

## 3.9 Global settings management

Where: `/admin/settings` (admin)

Steps:

1. Update required global settings:
   - booking reference prefix
   - default cutoff hours
   - pending hold expiry minutes
   - currency code
   - timezone
   - business/support contact fields
   - sender/alert email fields
2. Save changes.

Expected result:

- New global settings are saved and applied across admin operations.

---

## 4) Daily operations checklist

Use this as a practical opening checklist for operations staff.

- Check dashboard metrics (confirmed today, pending holds, month revenue)
- Review today's bookings and any pending items
- Verify upcoming dates in calendar (capacity/cutoff issues)
- Process new contact messages (admin)
- Prepare/print manifests for active departures (admin)

## Escalate To Admin When

- A booking needs cancellation or refund
- A calendar override must be saved/cleared
- Pricing rules need editing
- Team users or global settings need updates
- Messages/reports/manifests access is required

---

## 5) Client walkthrough plan (no video)

Recommended live session: 35-45 minutes

1. **Context (2 min)**  
   Confirm: "This walkthrough is limited to current implemented features."

2. **Navigation and roles (5 min)**  
   Show sidebar and clarify admin vs staff access.

3. **Core workflows (20-25 min)**  
   - create/edit tour  
   - calendar check + override  
   - create manual booking  
   - booking detail edit + lifecycle actions

4. **Operations tools (5 min)**  
   - manifests  
   - reports  
   - media

5. **Q&A and handover (3-5 min)**  
   Confirm owner on client side and next support path.

---

## 6) PDF delivery recommendation

Deliver one clean PDF with this title:

**Happy Wanderers Admin Panel - Operations Guide (Current Version)**

Include this statement on page 1 (recommended):

"This guide covers only features available in the current admin panel release. It does not include future enhancements or features not yet implemented."
