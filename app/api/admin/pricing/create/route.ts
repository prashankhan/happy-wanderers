import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { setAdminOperationContext } from "@/lib/sentry/context";
import { pricingRules } from "@/lib/db/schema";

const bodySchema = z.object({
  tour_id: z.string().uuid(),
  label: z.string().min(1),
  adult_price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  child_price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  infant_price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  infant_pricing_type: z.enum(["free", "fixed", "not_allowed"]),
  currency_code: z.string().min(3).max(3).optional(),
  valid_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  valid_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  priority: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export async function POST(request: Request) {
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
    return NextResponse.json({ success: false, message: "Validation failed" }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "admin_pricing_create",
    admin_user_id: session.user.id,
    tour_id: parsed.data.tour_id,
  });

  const [row] = await db
    .insert(pricingRules)
    .values({
      tourId: parsed.data.tour_id,
      label: parsed.data.label,
      adultPrice: parsed.data.adult_price,
      childPrice: parsed.data.child_price,
      infantPrice: parsed.data.infant_price ?? "0",
      infantPricingType: parsed.data.infant_pricing_type,
      currencyCode: parsed.data.currency_code ?? "AUD",
      validFrom: parsed.data.valid_from ?? null,
      validUntil: parsed.data.valid_until ?? null,
      priority: parsed.data.priority ?? 1,
      isActive: parsed.data.is_active ?? true,
    })
    .returning();

  return NextResponse.json({ success: true, rule: row });
}
