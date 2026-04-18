import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { departureLocations, pricingRules } from "@/lib/db/schema";
import {
  headcountForMaxGuests,
  normalizeMaxGuestsScope,
  type PricingConstraints,
} from "@/lib/types/pricing-constraints";

export type { PricingConstraints };

type PricingRuleRow = typeof pricingRules.$inferSelect;

async function selectActivePricingRuleForDate(
  tourId: string,
  bookingDate: string
): Promise<{ ok: true; rule: PricingRuleRow } | { ok: false; message: string }> {
  const rules = await db
    .select()
    .from(pricingRules)
    .where(
      sql`${pricingRules.tourId} = ${tourId}
        AND ${pricingRules.isActive} = true
        AND (${pricingRules.validFrom} IS NULL OR ${pricingRules.validFrom} <= ${bookingDate}::date)
        AND (${pricingRules.validUntil} IS NULL OR ${pricingRules.validUntil} >= ${bookingDate}::date)`
    )
    .orderBy(desc(pricingRules.priority));

  const rule = rules[0];
  if (!rule) return { ok: false, message: "No pricing rule for this tour" };
  return { ok: true, rule };
}

/** Guest-count limits for the active rule on `bookingDate` (same selection as checkout pricing). */
export async function getPricingConstraints(
  tourId: string,
  bookingDate: string
): Promise<{ ok: true; constraints: PricingConstraints } | { ok: false; message: string }> {
  const picked = await selectActivePricingRuleForDate(tourId, bookingDate);
  if (!picked.ok) return picked;

  const { rule } = picked;
  const infantPricingType = rule.infantPricingType as PricingConstraints["infantPricingType"];
  const pricingMode = (rule.pricingMode === "package" ? "package" : "per_person") as PricingConstraints["pricingMode"];
  const maxGuestsScope = normalizeMaxGuestsScope(rule.maxGuestsScope);

  return {
    ok: true,
    constraints: {
      minGuests: rule.minGuests,
      maxGuests: rule.maxGuests,
      maxGuestsScope,
      maxInfants: rule.maxInfants,
      infantPricingType,
      pricingMode,
    },
  };
}

export interface PricingBreakdown {
  ruleId: string;
  pricingMode: "per_person" | "package";
  currency: string;
  adultUnit: number;
  childUnit: number;
  infantUnit: number;
  total: number;
  includedAdults?: number;
  packageBase?: number;
  extraAdultUnit?: number;
  extraChildUnit?: number;
  adultSubtotal?: number;
  childSubtotal?: number;
  infantSubtotal?: number;
}

function num(v: string | number | null | undefined): number {
  if (v == null) return 0;
  return typeof v === "number" ? v : Number.parseFloat(v);
}

function applyAdjustment(
  base: number,
  type: string,
  value: number
): number {
  if (type === "none") return base;
  if (type === "fixed") return base + value;
  if (type === "percentage") return base * (1 + value / 100);
  return base;
}

export async function resolvePricing(input: {
  tourId: string;
  departureLocationId: string;
  bookingDate: string;
  adults: number;
  children: number;
  infants: number;
}): Promise<
  | { ok: true; breakdown: PricingBreakdown }
  | { ok: false; message: string }
> {
  const locRows = await db
    .select()
    .from(departureLocations)
    .where(
      and(
        eq(departureLocations.id, input.departureLocationId),
        eq(departureLocations.tourId, input.tourId),
        eq(departureLocations.isActive, true)
      )
    )
    .limit(1);
  const loc = locRows[0];
  if (!loc) return { ok: false, message: "Invalid departure location" };

  const rulePick = await selectActivePricingRuleForDate(input.tourId, input.bookingDate);
  if (!rulePick.ok) return rulePick;
  const rule = rulePick.rule;

  const guestTotal = input.adults + input.children + input.infants;
  if (guestTotal < rule.minGuests) {
    return { ok: false, message: `Minimum ${rule.minGuests} guests required` };
  }

  const maxGuestsScope = normalizeMaxGuestsScope(rule.maxGuestsScope);
  const maxHeadcount = headcountForMaxGuests(
    maxGuestsScope,
    input.adults,
    input.children,
    input.infants
  );
  if (maxHeadcount > rule.maxGuests) {
    const scopeHint =
      maxGuestsScope === "entire_party"
        ? ""
        : maxGuestsScope === "adults_and_children_only"
          ? " (adults and children only; infants are extra)"
          : " (adults only)";
    return { ok: false, message: `Maximum ${rule.maxGuests} guests allowed${scopeHint}` };
  }

  const infantType = rule.infantPricingType;
  if (infantType === "not_allowed" && input.infants > 0) {
    return { ok: false, message: "Infants are not permitted on this tour" };
  }
  if (rule.maxInfants !== null && input.infants > rule.maxInfants) {
    return { ok: false, message: `Maximum ${rule.maxInfants} infants allowed` };
  }
  if (input.adults < 1) {
    return { ok: false, message: "At least one adult is required" };
  }

  let infantUnit = 0;
  if (infantType === "fixed") infantUnit = num(rule.infantPrice);
  if (infantType === "free") infantUnit = 0;

  const adjType = loc.priceAdjustmentType;
  const adjVal = num(loc.priceAdjustmentValue);

  let adultUnit = applyAdjustment(num(rule.adultPrice), adjType, adjVal);
  let childUnit = applyAdjustment(num(rule.childPrice), adjType, adjVal);
  const infantUnitAdj = infantType === "free" ? 0 : applyAdjustment(infantUnit, adjType, adjVal);

  const pricingMode = (rule.pricingMode === "package" ? "package" : "per_person") as
    | "per_person"
    | "package";

  let total = 0;
  let packageFields: Pick<
    PricingBreakdown,
    | "includedAdults"
    | "packageBase"
    | "extraAdultUnit"
    | "extraChildUnit"
    | "adultSubtotal"
    | "childSubtotal"
    | "infantSubtotal"
  > = {};

  if (pricingMode === "package") {
    const includedAdults = Math.max(1, rule.includedAdults);
    const packageBase = applyAdjustment(num(rule.packageBasePrice), adjType, adjVal);
    const extraAdultUnit = applyAdjustment(num(rule.extraAdultPrice), adjType, adjVal);
    const extraChildUnit = applyAdjustment(num(rule.extraChildPrice), adjType, adjVal);
    const chargeableExtraAdults = Math.max(0, input.adults - includedAdults);

    const adultSubtotal = packageBase + extraAdultUnit * chargeableExtraAdults;
    const childSubtotal = extraChildUnit * input.children;
    const infantSubtotal = infantUnitAdj * input.infants;
    total = adultSubtotal + childSubtotal + infantSubtotal;

    adultUnit = input.adults > 0 ? adultSubtotal / input.adults : 0;
    childUnit = extraChildUnit;
    packageFields = {
      includedAdults,
      packageBase,
      extraAdultUnit,
      extraChildUnit,
      adultSubtotal,
      childSubtotal,
      infantSubtotal,
    };
  } else {
    total = adultUnit * input.adults + childUnit * input.children + infantUnitAdj * input.infants;
  }

  if (total <= 0) {
    return { ok: false, message: "Invalid total price" };
  }

  return {
    ok: true,
    breakdown: {
      ruleId: rule.id,
      pricingMode,
      currency: rule.currencyCode,
      adultUnit,
      childUnit,
      infantUnit: infantUnitAdj,
      total: Math.round(total * 100) / 100,
      ...packageFields,
    },
  };
}
