"use client";

import Link from "next/link";
import { useState } from "react";

import { TourNextOpenChip } from "@/components/tours/tour-next-open-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";
import { cn } from "@/lib/utils/cn";

interface PickupData {
  id: string;
  name: string;
  timeLabel: string;
}

interface TourBookingSidebarProps {
  tourId: string;
  priceFromText: string | null;
  priceContextText?: string | null;
  pricingRules: Array<{
    id: string;
    pricingMode: string;
    extraAdultPricingType: string;
    extraAdultPrice: string;
    childPricingType: string;
    extraChildPrice: string;
    infantPricingType: string;
    infantPrice: string;
    currencyCode: string;
    priority: number;
  }>;
  defaultPickupId?: string;
  pickups: PickupData[];
  cancellationPolicy?: string | null;
}

function formatPriceContextText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(/\s+/g, " ");

  if (/^per person$/i.test(normalized)) return "Per Person";

  const fixedPeopleMatch = normalized.match(/^for\s+(\d+)\s+people$/i);
  if (fixedPeopleMatch) return `For ${fixedPeopleMatch[1]} People`;

  const upToPeopleMatch = normalized.match(/^for\s+up\s+to\s+(\d+)\s+people$/i);
  if (upToPeopleMatch) return `For up to ${upToPeopleMatch[1]} People`;

  return normalized;
}

function toAmount(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency || "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function TourBookingSidebar({
  tourId,
  priceFromText,
  priceContextText,
  pricingRules,
  defaultPickupId,
  pickups,
  cancellationPolicy,
}: TourBookingSidebarProps) {
  const [pickupId, setPickupId] = useState<string | undefined>(defaultPickupId);
  const normalizedPriceContext = formatPriceContextText(priceContextText);
  const packageRule = pricingRules.find((rule) => rule.pricingMode === "package");
  const extrasCurrency = packageRule?.currencyCode ?? "AUD";
  const extraAdultPrice = packageRule ? toAmount(packageRule.extraAdultPrice) : 0;
  const extraChildPrice = packageRule ? toAmount(packageRule.extraChildPrice) : 0;
  const infantPrice = packageRule ? toAmount(packageRule.infantPrice) : 0;
  const showExtraAdult =
    Boolean(packageRule) &&
    packageRule.extraAdultPricingType !== "not_allowed" &&
    extraAdultPrice > 0;
  const showExtraChild =
    Boolean(packageRule) &&
    packageRule.childPricingType !== "not_allowed" &&
    extraChildPrice > 0;
  const showExtraInfant =
    Boolean(packageRule) &&
    packageRule.infantPricingType !== "not_allowed" &&
    infantPrice > 0;
  const hasAnyExtras = showExtraAdult || showExtraChild || showExtraInfant;
  const availabilityHref = pickupId
    ? `/availability?tour_id=${tourId}&departure_location_id=${pickupId}`
    : `/availability?tour_id=${tourId}`;

  return (
    <aside className="lg:sticky lg:top-28">
      <Card className="rounded-sm border-brand-border shadow-[0_12px_24px_-20px_rgba(12,22,44,0.28)] ring-1 ring-brand-heading/5">
        <CardHeader className="border-b border-brand-border pb-4 pt-4 px-4 md:pb-5 md:pt-5 md:px-6">
          {priceFromText ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-normal text-brand-muted">Starting from</p>
              <p className="text-[2.35rem] font-black tracking-tight text-brand-heading">
                {priceFromText.replace(/^(From\s*|from\s*)/i, "")}
              </p>
              {normalizedPriceContext ? (
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.03em] text-brand-primary">
                  {normalizedPriceContext}
                </p>
              ) : null}
              {hasAnyExtras ? (
                <div className="mt-3 border-t border-brand-border/40 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-brand-muted">
                    Optional extras
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-brand-body/85">
                    {showExtraAdult ? (
                      <p className="flex items-center justify-between gap-3">
                        <span>Extra adult</span>
                        <span className="font-semibold text-brand-heading">
                          {formatMoney(extraAdultPrice, extrasCurrency)}
                        </span>
                      </p>
                    ) : null}
                    {showExtraChild ? (
                      <p className="flex items-center justify-between gap-3">
                        <span>Extra child</span>
                        <span className="font-semibold text-brand-heading">
                          {formatMoney(extraChildPrice, extrasCurrency)}
                        </span>
                      </p>
                    ) : null}
                    {showExtraInfant ? (
                      <p className="flex items-center justify-between gap-3">
                        <span>Extra infant</span>
                        <span className="font-semibold text-brand-heading">
                          {formatMoney(infantPrice, extrasCurrency)}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-5 px-4 pt-4 pb-4 md:space-y-6 md:px-6 md:pt-6 md:pb-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Pickup location</label>
            <select
              className="w-full rounded-sm border border-brand-border/70 bg-white px-3 py-2.5 md:px-4 md:py-3 text-sm font-medium text-brand-heading transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
              value={pickupId ?? ""}
              onChange={(e) => setPickupId(e.target.value || undefined)}
            >
              {pickups.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.timeLabel}
                </option>
              ))}
            </select>
          </div>

          <Button asChild variant="primary" className={cn("mt-1 w-full", primaryTourCtaClassName)}>
            <Link href={availabilityHref}>
              Check dates & book
            </Link>
          </Button>

          <div className="space-y-3 border-t border-brand-border/40 pt-4 md:space-y-4 md:pt-4">
            <p className="text-[11px] leading-relaxed text-brand-muted/65">
              Live availability and instant confirmation via our secure booking partner.
            </p>
            <TourNextOpenChip tourId={tourId} departureLocationId={pickupId} />
          </div>

          {/* Cancellation Policy Link */}
          {cancellationPolicy && (
            <div className="border-t border-brand-border/50 pt-5">
              <Link
                href="/cancellation-policy"
                className="block text-center text-sm font-medium text-brand-primary transition-colors hover:text-brand-primary-hover"
              >
                View cancellation policy
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
