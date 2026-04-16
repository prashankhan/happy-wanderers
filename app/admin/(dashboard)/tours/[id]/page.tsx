import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";

import { auth } from "@/auth";
import { TourEditorBanners } from "@/components/admin/tour-editor-banners";
import { TourEditorTabs, type PricingRuleRow, type SerializedTour } from "@/components/admin/tour-editor-tabs";
import { db } from "@/lib/db";
import { pricingRules, tours } from "@/lib/db/schema";

export default async function AdminTourEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const role = session?.user?.role === "admin" ? "admin" : "staff";

  const rows = await db.select().from(tours).where(and(eq(tours.id, id), isNull(tours.deletedAt))).limit(1);
  const tour = rows[0];
  if (!tour) notFound();

  let initialPricing: PricingRuleRow[] | undefined;
  if (role === "admin") {
    const pr = await db
      .select()
      .from(pricingRules)
      .where(eq(pricingRules.tourId, id))
      .orderBy(asc(pricingRules.priority));
    initialPricing = pr.map((r) => ({
      id: r.id,
      tourId: r.tourId,
      label: r.label,
      adultPrice: String(r.adultPrice),
      childPrice: String(r.childPrice),
      infantPrice: String(r.infantPrice),
      infantPricingType: r.infantPricingType,
      currencyCode: r.currencyCode,
      validFrom: r.validFrom ? String(r.validFrom) : null,
      validUntil: r.validUntil ? String(r.validUntil) : null,
      priority: r.priority,
      isActive: r.isActive,
    }));
  }

  const serialized: SerializedTour = {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    shortDescription: tour.shortDescription,
    description: tour.description,
    durationText: tour.durationText,
    durationMinutes: tour.durationMinutes,
    groupSizeText: tour.groupSizeText,
    defaultCapacity: tour.defaultCapacity,
    priceFromText: tour.priceFromText,
    locationRegion: tour.locationRegion,
    inclusions: tour.inclusions,
    exclusions: tour.exclusions,
    whatToBring: tour.whatToBring,
    pickupNotes: tour.pickupNotes,
    cancellationPolicy: tour.cancellationPolicy,
    heroBadge: tour.heroBadge,
    bookingCutoffHours: tour.bookingCutoffHours,
    bookingEnabled: tour.bookingEnabled,
    isActive: tour.isActive,
    status: tour.status,
    isFeatured: tour.isFeatured,
    displayOrder: tour.displayOrder,
    seoTitle: tour.seoTitle,
    seoDescription: tour.seoDescription,
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/tours" className="text-sm text-brand-primary hover:underline">
        ← Tours
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-brand-heading">{tour.title}</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Content, pricing, weekday availability, media, and publishing — saved via admin APIs.
        </p>
      </div>
      <TourEditorBanners tourId={id} status={tour.status} />
      <TourEditorTabs tour={serialized} role={role} initialPricingRules={initialPricing} />
    </div>
  );
}
