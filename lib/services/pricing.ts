import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { departureLocations, pricingRules } from "@/lib/db/schema";
import {
  headcountForMaxGuests,
  normalizeMaxGuestsScope,
  type PricingConstraints,
} from "@/lib/types/pricing-constraints";
import type { PricingRuleOption } from "@/lib/types/pricing-rule-option";

export type { PricingConstraints };

type PricingRuleRow = typeof pricingRules.$inferSelect;

async function listActivePricingRulesForDate(
  tourId: string,
  bookingDate: string
): Promise<PricingRuleRow[]> {
  const rules = await db
    .select()
    .from(pricingRules)
    .where(
      sql`${pricingRules.tourId} = ${tourId}
        AND ${pricingRules.isActive} = true
        AND (${pricingRules.validFrom} IS NULL OR ${pricingRules.validFrom} <= ${bookingDate}::date)
        AND (${pricingRules.validUntil} IS NULL OR ${pricingRules.validUntil} >= ${bookingDate}::date)`
    )
    .orderBy(desc(pricingRules.priority), desc(pricingRules.createdAt));

  return rules;
}

function filterRulesForGuestRange(
  rules: PricingRuleRow[],
  guestCount: number
): PricingRuleRow[] {
  return rules.filter((rule) => guestCount >= rule.minGuests && guestCount <= rule.maxGuests);
}

async function selectActivePricingRuleForDate(
  tourId: string,
  bookingDate: string,
  guestCount: number,
  preferredRuleId?: string | null
): Promise<{ ok: true; rule: PricingRuleRow } | { ok: false; message: string }> {
  const rules = await listActivePricingRulesForDate(tourId, bookingDate);
  if (!rules.length) return { ok: false, message: "No pricing rule for this tour" };

  const compatible = filterRulesForGuestRange(rules, guestCount);
  if (!compatible.length) {
    return { ok: false, message: "No pricing rule available for selected guest count" };
  }
  if (preferredRuleId) {
    const chosen = compatible.find((r) => r.id === preferredRuleId);
    if (!chosen) {
      return { ok: false, message: "Selected package is not available for this party size" };
    }
    return { ok: true, rule: chosen };
  }
  const rule = compatible[0];
  return { ok: true, rule };
}

export async function getPricingRuleOptions(
  tourId: string,
  bookingDate: string
): Promise<{ ok: true; rules: PricingRuleOption[] } | { ok: false; message: string }> {
  const rules = await listActivePricingRulesForDate(tourId, bookingDate);
  if (!rules.length) return { ok: false, message: "No pricing rule for this tour" };

  return {
    ok: true,
    rules: rules.map((rule) => ({
      id: rule.id,
      label: rule.label,
      pricingMode: rule.pricingMode === "package" ? "package" : "per_person",
      minGuests: rule.minGuests,
      maxGuests: rule.maxGuests,
      maxGuestsScope: normalizeMaxGuestsScope(rule.maxGuestsScope),
      childPricingType: rule.childPricingType === "not_allowed" ? "not_allowed" : "fixed",
      infantPricingType:
        rule.infantPricingType === "fixed"
          ? "fixed"
          : rule.infantPricingType === "free"
            ? "free"
            : "not_allowed",
      maxInfants: rule.maxInfants,
      includedGuests: Math.max(1, rule.includedAdults),
      packageBase: num(rule.packageBasePrice),
      extraAdultPricingType:
        rule.extraAdultPricingType === "not_allowed" ? "not_allowed" : "fixed",
      extraAdultPrice: num(rule.extraAdultPrice),
      extraChildPrice: num(rule.extraChildPrice),
      priority: rule.priority,
    })),
  };
}

/** Guest-count limits for the active rule on `bookingDate` (same selection as checkout pricing). */
export async function getPricingConstraints(
  tourId: string,
  bookingDate: string
): Promise<{ ok: true; constraints: PricingConstraints } | { ok: false; message: string }> {
  const rules = await listActivePricingRulesForDate(tourId, bookingDate);
  if (!rules.length) return { ok: false, message: "No pricing rule for this tour" };

  // For the booking UI, expose party-size bounds across all active tiers for the date.
  const minGuests = Math.min(...rules.map((r) => r.minGuests));
  const maxGuests = Math.max(...rules.map((r) => r.maxGuests));

  // Keep other constraint fields permissive so valid tiers are not blocked in the form.
  const childrenAllowed = rules.some((r) => r.childPricingType !== "not_allowed");
  const infantAllowsFixed = rules.some((r) => r.infantPricingType === "fixed");
  const infantAllowsFreeOnly =
    !infantAllowsFixed && rules.some((r) => r.infantPricingType === "free");
  const anyUnlimitedInfants = rules.some((r) => r.maxInfants === null);
  const finiteMaxInfants = rules
    .map((r) => r.maxInfants)
    .filter((v): v is number => v !== null);
  const maxInfants = anyUnlimitedInfants
    ? null
    : finiteMaxInfants.length > 0
      ? Math.max(...finiteMaxInfants)
      : 0;

  const pricingMode = rules.some((r) => r.pricingMode === "package")
    ? "package"
    : "per_person";
  const scopeValues = rules.map((r) => normalizeMaxGuestsScope(r.maxGuestsScope));
  const uiScopeRaw = scopeValues.includes("adults_only")
    ? "adults_only"
    : scopeValues.includes("adults_and_children_only")
      ? "adults_and_children_only"
      : "entire_party";
  const maxGuestsScope = normalizeMaxGuestsScope(uiScopeRaw);
  const childPricingType: PricingConstraints["childPricingType"] = childrenAllowed
    ? "fixed"
    : "not_allowed";
  const infantPricingType: PricingConstraints["infantPricingType"] = infantAllowsFixed
    ? "fixed"
    : infantAllowsFreeOnly
      ? "free"
      : "not_allowed";

  return {
    ok: true,
    constraints: {
      minGuests,
      maxGuests,
      maxGuestsScope,
      childPricingType,
      maxInfants,
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
  includedGuests?: number;
  includedAdults?: number;
  packageBase?: number;
  extraAdultUnit?: number;
  extraChildUnit?: number;
  extraAdultsCount?: number;
  extraChildrenCount?: number;
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
  pricingRuleId?: string | null;
}): Promise<
  | { ok: true; breakdown: PricingBreakdown }
  | { ok: false; message: string }
> {
  const guestTotal = input.adults + input.children + input.infants;
  if (guestTotal < 1) return { ok: false, message: "Guest count required" };

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

  const rulePick = await selectActivePricingRuleForDate(
    input.tourId,
    input.bookingDate,
    guestTotal,
    input.pricingRuleId
  );
  if (!rulePick.ok) return rulePick;
  const rule = rulePick.rule;

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

  if (rule.childPricingType === "not_allowed" && input.children > 0) {
    return { ok: false, message: "Children are not permitted on this tour" };
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
  let childUnit = rule.childPricingType === "not_allowed" ? 0 : applyAdjustment(num(rule.childPrice), adjType, adjVal);
  const infantUnitAdj = infantType === "free" ? 0 : applyAdjustment(infantUnit, adjType, adjVal);

  const pricingMode = (rule.pricingMode === "package" ? "package" : "per_person") as
    | "per_person"
    | "package";

  let total = 0;
  let packageFields: Pick<
    PricingBreakdown,
    | "includedGuests"
    | "includedAdults"
    | "packageBase"
    | "extraAdultUnit"
    | "extraChildUnit"
    | "extraAdultsCount"
    | "extraChildrenCount"
    | "adultSubtotal"
    | "childSubtotal"
    | "infantSubtotal"
  > = {};

  if (pricingMode === "package") {
    // Legacy column name is `includedAdults`, but business meaning is included guest slots (adults + children).
    const includedGuests = Math.max(1, rule.includedAdults);
    const packageBase = applyAdjustment(num(rule.packageBasePrice), adjType, adjVal);
    const extraAdultUnit = applyAdjustment(num(rule.extraAdultPrice), adjType, adjVal);
    const extraChildUnit = applyAdjustment(num(rule.extraChildPrice), adjType, adjVal);
    const coveredAdults = Math.min(input.adults, includedGuests);
    const remainingCoveredSlots = Math.max(0, includedGuests - coveredAdults);
    const coveredChildren = Math.min(input.children, remainingCoveredSlots);
    const chargeableExtraAdults = Math.max(0, input.adults - coveredAdults);
    const chargeableExtraChildren = Math.max(0, input.children - coveredChildren);
    if (rule.extraAdultPricingType === "not_allowed" && chargeableExtraAdults > 0) {
      return {
        ok: false,
        message: "This package does not allow extra adults",
      };
    }

    const adultSubtotal = packageBase + extraAdultUnit * chargeableExtraAdults;
    const childSubtotal =
      rule.childPricingType === "not_allowed" ? 0 : extraChildUnit * chargeableExtraChildren;
    const infantSubtotal = infantUnitAdj * input.infants;
    total = adultSubtotal + childSubtotal + infantSubtotal;

    adultUnit = input.adults > 0 ? adultSubtotal / input.adults : 0;
    childUnit = extraChildUnit;
    packageFields = {
      includedGuests,
      includedAdults: includedGuests,
      packageBase,
      extraAdultUnit,
      extraChildUnit,
      extraAdultsCount: chargeableExtraAdults,
      extraChildrenCount: chargeableExtraChildren,
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
