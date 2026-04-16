import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { departureLocations, pricingRules } from "@/lib/db/schema";

interface TourEditorBannersProps {
  tourId: string;
  status: string;
}

export async function TourEditorBanners({ tourId, status }: TourEditorBannersProps) {
  const activeDl = await db
    .select({ id: departureLocations.id })
    .from(departureLocations)
    .where(
      and(eq(departureLocations.tourId, tourId), eq(departureLocations.isActive, true))
    )
    .limit(1);

  const activePr = await db
    .select({ id: pricingRules.id })
    .from(pricingRules)
    .where(and(eq(pricingRules.tourId, tourId), eq(pricingRules.isActive, true)))
    .limit(1);

  const missingOps = !activeDl[0] || !activePr[0];

  if (status !== "draft" && !missingOps) return null;

  return (
    <div className="space-y-3">
      {status === "draft" ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
          <strong>Draft tour.</strong> Finish content, weekday rules, departures, and pricing, then set
          <strong>Status</strong> to published when ready. Turn on <strong>Booking enabled</strong> only when
          you want this tour on the public site.
        </div>
      ) : null}
      {missingOps ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Setup required:</strong>{" "}
          {!activeDl[0] ? "Add at least one active departure (pickup) in the Content tab. " : null}
          {!activePr[0]
            ? "Add at least one active pricing rule in the Pricing tab (admins only)."
            : null}
          Bookings and checkout need both.
        </div>
      ) : null}
    </div>
  );
}
