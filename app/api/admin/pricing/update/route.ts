import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { pricingRules } from "@/lib/db/schema";
import { setAdminOperationContext } from "@/lib/sentry/context";
import { PRICING_GUESTS_ORDER_TOAST } from "@/lib/ui/pricing-guest-limit-copy";
import { zodErrorToApiMessage } from "@/lib/utils/zod-api-message";

const money = (field: string) =>
  z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, `${field} must be a positive amount with up to two decimal places (e.g. 189 or 189.00).`);

const bodySchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).optional(),
  adult_price: money("Adult price").optional(),
  child_price: money("Child price").optional(),
  pricing_mode: z.enum(["per_person", "package"]).optional(),
  included_adults: z.number().int().min(1).optional(),
  package_base_price: money("Package base price").optional(),
  extra_adult_price: money("Extra adult price").optional(),
  extra_child_price: money("Extra child price").optional(),
  infant_price: money("Infant price").optional(),
  infant_pricing_type: z.enum(["free", "fixed", "not_allowed"]).optional(),
  min_guests: z.number().int().min(1).optional(),
  max_guests: z.number().int().min(1).optional(),
  max_guests_scope: z.enum(["entire_party", "adults_and_children_only", "adults_only"]).optional(),
  max_infants: z.number().int().min(0).nullable().optional(),
  currency_code: z.string().min(3).max(3).optional(),
  valid_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  valid_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  priority: z.number().int().optional(),
  is_active: z.boolean().optional(),
}).superRefine((val, ctx) => {
  if (val.min_guests !== undefined && val.max_guests !== undefined && val.max_guests < val.min_guests) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["max_guests"],
      message: PRICING_GUESTS_ORDER_TOAST,
    });
  }
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: zodErrorToApiMessage(parsed.error) },
      { status: 400 }
    );
  }

  const existing = await db.select().from(pricingRules).where(eq(pricingRules.id, parsed.data.id)).limit(1);
  if (!existing[0]) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }
  const nextMinGuests = parsed.data.min_guests ?? existing[0].minGuests;
  const nextMaxGuests = parsed.data.max_guests ?? existing[0].maxGuests;
  const nextInfantPricingType =
    parsed.data.infant_pricing_type ?? existing[0].infantPricingType;
  if (nextMaxGuests < nextMinGuests) {
    return NextResponse.json({ success: false, message: PRICING_GUESTS_ORDER_TOAST }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "admin_pricing_update",
    admin_user_id: session.user.id,
    tour_id: existing[0].tourId,
  });

  const [row] = await db
    .update(pricingRules)
    .set({
      ...(parsed.data.label !== undefined ? { label: parsed.data.label } : {}),
      ...(parsed.data.adult_price !== undefined ? { adultPrice: parsed.data.adult_price } : {}),
      ...(parsed.data.child_price !== undefined ? { childPrice: parsed.data.child_price } : {}),
      ...(parsed.data.pricing_mode !== undefined ? { pricingMode: parsed.data.pricing_mode } : {}),
      ...(parsed.data.included_adults !== undefined ? { includedAdults: parsed.data.included_adults } : {}),
      ...(parsed.data.package_base_price !== undefined
        ? { packageBasePrice: parsed.data.package_base_price }
        : {}),
      ...(parsed.data.extra_adult_price !== undefined ? { extraAdultPrice: parsed.data.extra_adult_price } : {}),
      ...(parsed.data.extra_child_price !== undefined ? { extraChildPrice: parsed.data.extra_child_price } : {}),
      ...(parsed.data.infant_price !== undefined ? { infantPrice: parsed.data.infant_price } : {}),
      ...(parsed.data.infant_pricing_type !== undefined
        ? { infantPricingType: parsed.data.infant_pricing_type }
        : {}),
      ...(parsed.data.min_guests !== undefined ? { minGuests: parsed.data.min_guests } : {}),
      ...(parsed.data.max_guests !== undefined ? { maxGuests: parsed.data.max_guests } : {}),
      ...(parsed.data.max_guests_scope !== undefined ? { maxGuestsScope: parsed.data.max_guests_scope } : {}),
      ...(nextInfantPricingType === "not_allowed"
        ? { maxInfants: null }
        : parsed.data.max_infants !== undefined
          ? { maxInfants: parsed.data.max_infants }
          : {}),
      ...(parsed.data.currency_code !== undefined ? { currencyCode: parsed.data.currency_code } : {}),
      ...(parsed.data.valid_from !== undefined ? { validFrom: parsed.data.valid_from } : {}),
      ...(parsed.data.valid_until !== undefined ? { validUntil: parsed.data.valid_until } : {}),
      ...(parsed.data.priority !== undefined ? { priority: parsed.data.priority } : {}),
      ...(parsed.data.is_active !== undefined ? { isActive: parsed.data.is_active } : {}),
      updatedAt: new Date(),
    })
    .where(eq(pricingRules.id, parsed.data.id))
    .returning();

  return NextResponse.json({ success: true, rule: row });
}
