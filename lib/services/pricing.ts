import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { departureLocations, pricingRules } from "@/lib/db/schema";

export interface PricingBreakdown {
  ruleId: string;
  currency: string;
  adultUnit: number;
  childUnit: number;
  infantUnit: number;
  total: number;
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

  const rules = await db
    .select()
    .from(pricingRules)
    .where(
      sql`${pricingRules.tourId} = ${input.tourId}
        AND ${pricingRules.isActive} = true
        AND (${pricingRules.validFrom} IS NULL OR ${pricingRules.validFrom} <= ${input.bookingDate}::date)
        AND (${pricingRules.validUntil} IS NULL OR ${pricingRules.validUntil} >= ${input.bookingDate}::date)`
    )
    .orderBy(desc(pricingRules.priority));

  const rule = rules[0];
  if (!rule) return { ok: false, message: "No pricing rule for this tour" };

  const infantType = rule.infantPricingType;
  if (infantType === "not_allowed" && input.infants > 0) {
    return { ok: false, message: "Infants are not permitted on this tour" };
  }
  if (input.adults < 1) {
    return { ok: false, message: "At least one adult is required" };
  }

  let infantUnit = 0;
  if (infantType === "fixed") infantUnit = num(rule.infantPrice);
  if (infantType === "free") infantUnit = 0;

  const adjType = loc.priceAdjustmentType;
  const adjVal = num(loc.priceAdjustmentValue);

  const adultUnit = applyAdjustment(num(rule.adultPrice), adjType, adjVal);
  const childUnit = applyAdjustment(num(rule.childPrice), adjType, adjVal);
  const infantUnitAdj = applyAdjustment(infantUnit, adjType, adjVal);

  const total =
    adultUnit * input.adults + childUnit * input.children + infantUnitAdj * input.infants;

  if (total <= 0) {
    return { ok: false, message: "Invalid total price" };
  }

  return {
    ok: true,
    breakdown: {
      ruleId: rule.id,
      currency: rule.currencyCode,
      adultUnit,
      childUnit,
      infantUnit: infantUnitAdj,
      total: Math.round(total * 100) / 100,
    },
  };
}
