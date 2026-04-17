/**
 * Matches the public Navbar row height (`components/layout/navbar.tsx` — Container flex row).
 * Bar: `h-24` (6rem ≈ 96px) at all breakpoints (plus `border-b` on the header).
 * Main uses top padding so content clears the fixed bar; full-bleed heroes negate it and pad their own top.
 */
export const publicMainNavTopPaddingClass = "pt-[calc(96px+1px)]";

export const publicHeroUnderFixedNavClass = "-mt-[calc(96px+1px)] pt-[calc(96px+1px)]";
