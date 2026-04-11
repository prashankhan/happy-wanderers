import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { setAdminOperationContext } from "@/lib/sentry/context";
import { pricingRules } from "@/lib/db/schema";

const querySchema = z.object({
  id: z.string().uuid(),
});

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ id: searchParams.get("id") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid query" }, { status: 400 });
  }

  const existing = await db.select().from(pricingRules).where(eq(pricingRules.id, parsed.data.id)).limit(1);
  if (existing[0]) {
    setAdminOperationContext({
      operation_type: "admin_pricing_delete",
      admin_user_id: session.user.id,
      tour_id: existing[0].tourId,
    });
  }

  const deleted = await db.delete(pricingRules).where(eq(pricingRules.id, parsed.data.id)).returning({ id: pricingRules.id });
  if (!deleted[0]) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
