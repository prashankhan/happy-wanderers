import { notFound } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";

import { auth } from "@/auth";
import { TourEditorBanners } from "@/components/admin/tour-editor-banners";
import { TourEditorTabs, type PricingRuleRow, type SerializedTour } from "@/components/admin/tour-editor-tabs";
import { db } from "@/lib/db";
import { pricingRules, tours } from "@/lib/db/schema";
import { normalizeMaxGuestsScope } from "@/lib/types/pricing-constraints";

export default async function AdminTourEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const role = session?.user?.role === "admin" ? "admin" : "staff";

  const baseTourQuery = db
    .select({
      id: tours.id,
      title: tours.title,
      slug: tours.slug,
      shortDescription: tours.shortDescription,
      description: tours.description,
      durationText: tours.durationText,
      durationMinutes: tours.durationMinutes,
      groupSizeText: tours.groupSizeText,
      defaultCapacity: tours.defaultCapacity,
      priceFromText: tours.priceFromText,
      locationRegion: tours.locationRegion,
      inclusions: tours.inclusions,
      exclusions: tours.exclusions,
      whatToBring: tours.whatToBring,
      pickupNotes: tours.pickupNotes,
      cancellationPolicy: tours.cancellationPolicy,
      heroBadge: tours.heroBadge,
      bookingCutoffHours: tours.bookingCutoffHours,
      minimumAdvanceBookingDays: tours.minimumAdvanceBookingDays,
      durationDays: tours.durationDays,
      isMultiDay: tours.isMultiDay,
      requiresAccommodation: tours.requiresAccommodation,
      itineraryDays: tours.itineraryDays,
      bookingEnabled: tours.bookingEnabled,
      isActive: tours.isActive,
      status: tours.status,
      isFeatured: tours.isFeatured,
      displayOrder: tours.displayOrder,
      seoTitle: tours.seoTitle,
      seoDescription: tours.seoDescription,
      deletedAt: tours.deletedAt,
    })
    .from(tours)
    .where(and(eq(tours.id, id), isNull(tours.deletedAt)))
    .limit(1);

  const tour = (await baseTourQuery)[0];
  let priceContextText: string | null = null;

  try {
    const rowWithContext = await db
      .select({
        priceContextText: tours.priceContextText,
      })
      .from(tours)
      .where(and(eq(tours.id, id), isNull(tours.deletedAt)))
      .limit(1);
    if (tour && rowWithContext[0]) {
      priceContextText = rowWithContext[0].priceContextText;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("price_context_text") || !tour) throw error;
    priceContextText = null;
  }
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
      childPricingType: (r.childPricingType === "not_allowed" ? "not_allowed" : "fixed") as
        | "fixed"
        | "not_allowed",
      extraAdultPricingType: (r.extraAdultPricingType === "not_allowed" ? "not_allowed" : "fixed") as
        | "fixed"
        | "not_allowed",
      pricingMode: r.pricingMode as "per_person" | "package",
      includedAdults: r.includedAdults,
      packageBasePrice: String(r.packageBasePrice),
      extraAdultPrice: String(r.extraAdultPrice),
      extraChildPrice: String(r.extraChildPrice),
      infantPrice: String(r.infantPrice),
      infantPricingType: r.infantPricingType,
      minGuests: r.minGuests,
      maxGuests: r.maxGuests,
      maxGuestsScope: normalizeMaxGuestsScope(r.maxGuestsScope),
      maxInfants: r.maxInfants,
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
    priceContextText,
    locationRegion: tour.locationRegion,
    inclusions: tour.inclusions,
    exclusions: tour.exclusions,
    whatToBring: tour.whatToBring,
    pickupNotes: tour.pickupNotes,
    cancellationPolicy: tour.cancellationPolicy,
    heroBadge: tour.heroBadge,
    bookingCutoffHours: tour.bookingCutoffHours,
    minimumAdvanceBookingDays: tour.minimumAdvanceBookingDays,
    durationDays: tour.durationDays,
    isMultiDay: tour.isMultiDay,
    requiresAccommodation: tour.requiresAccommodation,
    itineraryDays: tour.itineraryDays ?? null,
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
      <div>
        <h1 className="text-2xl font-bold text-brand-heading">{tour.title}</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Content, pickups, pricing, weekday availability, media, and publishing — saved via admin APIs.
        </p>
      </div>
      <TourEditorBanners tourId={id} status={tour.status} />
      <TourEditorTabs tour={serialized} role={role} initialPricingRules={initialPricing} />
    </div>
  );
}
