/**
 * Matches the public Navbar row height (`components/layout/navbar.tsx` — Container flex row).
 * Bar: `h-24` (6rem ≈ 96px) below `lg` · `lg:h-36` (9rem ≈ 144px) at 16px/rem.
 * Main uses top padding so content clears the fixed bar; full-bleed heroes negate it and pad their own top.
 */
export const publicMainNavTopPaddingClass = "pt-24 lg:pt-36";

export const publicHeroUnderFixedNavClass = "-mt-24 pt-24 lg:-mt-36 lg:pt-36";
