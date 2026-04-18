/** How `maxGuests` is applied when validating party size (infants may be excluded from the cap). */
export type MaxGuestsScope = "entire_party" | "adults_and_children_only" | "adults_only";

export function normalizeMaxGuestsScope(value: string | null | undefined): MaxGuestsScope {
  if (value === "adults_and_children_only" || value === "adults_only") return value;
  return "entire_party";
}

export function headcountForMaxGuests(
  scope: MaxGuestsScope,
  adults: number,
  children: number,
  infants: number
): number {
  if (scope === "adults_only") return adults;
  if (scope === "adults_and_children_only") return adults + children;
  return adults + children + infants;
}

/** Serializable guest / infant limits from the active pricing rule (safe for client props). */
export interface PricingConstraints {
  minGuests: number;
  maxGuests: number;
  maxGuestsScope: MaxGuestsScope;
  maxInfants: number | null;
  infantPricingType: "free" | "fixed" | "not_allowed";
  pricingMode: "per_person" | "package";
}
