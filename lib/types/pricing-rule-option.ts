import type { PricingConstraints } from "@/lib/types/pricing-constraints";

export interface PricingRuleOption {
  id: string;
  label: string;
  pricingMode: "per_person" | "package";
  minGuests: number;
  maxGuests: number;
  maxGuestsScope: PricingConstraints["maxGuestsScope"];
  childPricingType: PricingConstraints["childPricingType"];
  infantPricingType: PricingConstraints["infantPricingType"];
  maxInfants: number | null;
  includedGuests: number;
  packageBase: number;
  extraAdultPricingType: "fixed" | "not_allowed";
  extraAdultPrice: number;
  extraChildPrice: number;
  priority: number;
}
