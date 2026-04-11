import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { setAdminOperationContext } from "@/lib/sentry/context";
import { pricingRules } from "@/lib/db/schema";

const bodySchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).optional(),
  adult_price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  child_price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  infant_price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  infant_pricing_type: z.enum(["free", "fixed", "not_allowed"]).optional(),
  currency_code: z.string().min(3).max(3).optional(),
  valid_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  valid_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  priority: z.number().int().optional(),
  is_active: z.boolean().optional(),
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
    return NextResponse.json({ success: false, message: "Validation failed" }, { status: 400 });
  }

  const existing = await db.select().from(pricingRules).where(eq(pricingRules.id, parsed.data.id)).limit(1);
  if (!existing[0]) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
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
      ...(parsed.data.infant_price !== undefined ? { infantPrice: parsed.data.infant_price } : {}),
      ...(parsed.data.infant_pricing_type !== undefined
        ? { infantPricingType: parsed.data.infant_pricing_type }
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
