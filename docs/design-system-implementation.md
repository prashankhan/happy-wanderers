# Design System — Implementation Source of Truth

This document reflects the **current shipped implementation only**.
It intentionally replaces opinion/spec language with code-accurate rules.

Use this as the canonical reference when building or reviewing UI.

## Scope and Sources

Implementation was derived from:

- `tailwind.config.ts`
- `app/globals.css`
- `app/layout.tsx`
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/dialog.tsx`
- `components/layout/container.tsx`
- `components/layout/navbar.tsx`
- `components/layout/footer.tsx`
- `components/admin/form-field-styles.ts`
- `components/admin/admin-combobox.tsx`
- key public/admin form and booking surfaces

If this doc conflicts with older design docs, follow this document.

## Design Tokens

### Color Tokens (`tailwind.config.ts`)

#### Brand

- `brand.primary`: `#f97316`
- `brand.primary-hover`: `#ea580c`
- `brand.accent`: `#2563eb`
- `brand.accent-soft`: `#eff6ff`
- `brand.gold`: `#fbb40b`
- `brand.heading`: `#0f172a`
- `brand.body`: `#334155`
- `brand.muted`: `#64748b`
- `brand.surface`: `#ffffff`
- `brand.surface-soft`: `#f3f4f6`
- `brand.surface-warm`: `#fff7e6`
- `brand.border`: `#e2e8f0`

#### Availability

- `availability.open`: `#22c55e`
- `availability.low`: `#fbb40b`
- `availability.full`: `#ef4444`
- `availability.cutoff`: `#94a3b8`

### CSS Root Tokens (`app/globals.css`)

- `--background: 249 250 251`
- `--foreground: 17 24 39`

Body baseline:

- `@apply bg-brand-surface text-brand-body antialiased`
- `line-height: 1.6`

## Typography

### Font Stack

- Sans: `Plus Jakarta Sans` via `--font-sans`
- Serif display: `Playfair Display` **italic-only** via `--font-serif`

### Runtime Font Rules

- `body` uses `font-sans`
- `.font-serif` enforces italic display style
- Serif is primarily used for headings/display text

### Common Type Utility Patterns in Use

- Body: `text-base`
- Secondary/meta: `text-sm`, `text-xs`
- Heading ranges: `text-lg`, `text-2xl`, `text-3xl`, `text-4xl`
- Most common weights: `font-bold`, `font-medium`, `font-semibold`
- Frequent tracking: `tracking-tight`, `tracking-tighter`, `tracking-normal`, `tracking-widest`

## Spacing System (Observed)

Most-used spacing utilities in implementation:

- `px-4`, `py-3`
- `space-y-4`
- `gap-2`, `gap-3`, `gap-4`
- `p-6` for card interiors

Section/layout spacing frequently includes:

- `py-24` (public sections)
- `py-16`
- `gap-12`, `gap-16`, `gap-x-20` in larger layouts

This is a pragmatic mixed scale, not a single strict rhythm token set.

## Radius, Borders, and Rings

### Radius

Implementation default is **small radius**:

- dominant: `rounded-sm`
- contextual: `rounded-full` (chips/markers), occasional `rounded-md`/`rounded-lg`

### Borders

- baseline border usage: `border border-brand-border`
- common separators: `border-b`, `border-t`
- subtle variants: `border-brand-border/50`, `/60`, `/70`

### Focus and Ring

- common focus pattern: `focus:ring-2`
- form focus color: `focus:ring-brand-primary/10`
- button/nav/dialog focus often uses `ring-brand-accent` variants

## Buttons

Source: `components/ui/button.tsx`

### Base Button

- `inline-flex items-center justify-center`
- `gap-2`
- `rounded-sm`
- `text-sm font-medium`
- transition on color/background/border/transform/box-shadow
- tactile press: `active:scale-[0.98]`
- disabled handling: pointer events off + opacity

### Variants

- `primary`: orange background, white text, orange hover
- `secondary`: bordered neutral surface
- `ghost`: text-link style with underline on hover
- `danger`: light red outlined danger style

### Sizes

- `sm`: `h-9 px-4 text-sm`
- `md`: `h-12 px-8 text-xl`
- `lg`: `h-16 px-14 text-2xl font-bold tracking-tight`

### Shared Primary CTA Helper

Source: `lib/ui/primary-tour-cta.ts`

- `rounded-sm h-auto min-h-0 border-0 py-4 md:py-5 text-lg md:text-xl font-bold tracking-tighter`

## Cards

Source: `components/ui/card.tsx`

Base card:

- `rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-sm`
- transition on box-shadow/transform

Interactive card mode:

- hover/focus elevation and slight lift

Card subparts:

- Header: `mb-4 space-y-1`
- Title: serif heading, `text-xl` to `md:text-2xl`
- Description: `text-sm text-brand-body`
- Content stack: `space-y-4`

Note: many feature surfaces override card radius to `rounded-sm` for local consistency.

## Dialogs and Overlays

Source: `components/ui/dialog.tsx` and admin modal patterns

Primary drawer dialog pattern:

- overlay: `bg-black/40` + backdrop blur + fade animation
- content: right-side panel, full-height, `max-w-sm`, `border-l`, `p-6`
- close button: rounded, icon button with accent ring focus

Admin modal pattern (manual booking):

- centered modal with `max-w-lg`
- `rounded-sm border border-brand-border bg-white p-6 shadow-xl`

## Form Fields

### Shared Admin Field Styles

Source: `components/admin/form-field-styles.ts`

Input base:

- `rounded-sm border border-brand-border bg-white`
- `px-4 py-3`
- `text-base font-bold text-brand-heading`
- `shadow-sm`
- focus: primary border tint + `focus:ring-2 focus:ring-brand-primary/10`

Textarea:

- same visual system + minimum height (`min-h-[96px]`)

Toolbar button alignment helper:

- `h-12 px-4 text-base font-bold`

### Public/Booking/Auth Fields

Public and auth fields follow the same shape/tone:

- `rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold`
- focus behavior aligned to primary ring pattern
- error blocks: `bg-red-50 border-red-200 text-red-600`

### Combobox Pattern (Admin)

Source: `components/admin/admin-combobox.tsx`

- input inherits admin field class
- dropdown: `absolute mt-2 max-h-56 w-full overflow-y-auto rounded-sm border border-brand-border bg-white shadow-lg`
- option rows: `px-3 py-2 text-sm`; selected/active gets soft surface + semibold

## Layout and Containers

### Global Container

Source: `components/layout/container.tsx`

- `mx-auto w-full max-w-7xl px-4 md:px-6`

### Navbar

Source: `components/layout/navbar.tsx`

- main row height: `h-24`
- home: fixed transparent-over-hero until scroll threshold
- non-home/scrolled: bordered surface with shadow
- desktop nav typography: `text-lg md:text-xl`, bold, tight tracking
- mobile nav uses right-side drawer dialog

### Footer

Source: `components/layout/footer.tsx`

- dark section background (`bg-brand-heading`, white text)
- major top section spacing: `py-24 md:py-32`
- 3-column content grid on large screens
- final bottom stripe with top border and compact uppercase metadata

### Admin Sidebar

Source: `components/admin/admin-sidebar.tsx`

- desktop width: `w-64`, collapsible to `w-16`
- mobile top bar: `h-14`
- desktop header row: `h-[72px]`
- nav items: `rounded-sm px-3 py-2.5 text-sm`
- active item: `bg-brand-primary text-white`

## Calendar Design Mapping

Source: `components/calendar/public-availability-calendar.tsx`

Day cell color logic:

- cutoff passed: `bg-availability-cutoff`
- sold out: `bg-availability-full text-white`
- unavailable: `bg-brand-border text-brand-muted`
- low capacity: `bg-availability-low`
- open: `bg-availability-open text-white`

Selected date:

- `ring-2 ring-brand-primary ring-offset-2` + slight scale

## Motion and Interaction

### Global Hero Motion

Source: `app/globals.css`

- keyframe `heroReveal` from `opacity: 0, translateY(8px)` to visible
- animation: `700ms cubic-bezier(0.22, 0.61, 0.36, 1)`
- stagger utilities: delay classes from 75ms to 320ms
- reduced motion: animation disabled

### UI Interaction Motion Patterns

- buttons/cards/links use short transitions (`duration-200` and nearby values)
- active press scaling used frequently on clickable controls
- nav drawer and dialog transitions use animate/fade/slide utility patterns

## Component-Level Implementation Conventions

- `class-variance-authority` (`cva`) is used for button variant system
- `cn()` utility is used for class composition
- Radix primitives are used for dialogs
- UI is utility-first Tailwind with shared class constants for repeatability
- no separate centralized token file for spacing/radius; conventions are enforced through reusable primitives and repeated utility patterns

## Practical Rules for New UI (Implementation-Aligned)

When adding new components, match these defaults unless there is a strong reason:

1. Use `brand.primary` orange for primary CTAs.
2. Use `rounded-sm` by default for controls and dense surfaces.
3. Use `border border-brand-border` as the baseline outline.
4. Use `px-4 py-3` for text inputs and `h-12` for medium actions.
5. Use `focus:ring-2` with primary/accent ring tones.
6. Use `max-w-7xl px-4 md:px-6` for public page containers.
7. Reuse shared primitives (`Button`, `Card`, shared field classes) before inventing local styles.

## Known Divergence Resolved by This Document

This implementation doc intentionally resolves prior mismatch areas by codifying:

- orange-primary, blue-accent token reality
- small-radius default reality (`rounded-sm` heavy usage)
- strong-weight typography reality (`font-bold` common in operational surfaces)
- actual component and class patterns currently in code

---

Status: implementation-accurate as of current repository state.
