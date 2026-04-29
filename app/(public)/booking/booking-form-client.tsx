"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { RevealOnView } from "@/components/motion/reveal-on-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  normalizeMaxGuestsScope,
  type MaxGuestsScope,
  type PricingConstraints,
} from "@/lib/types/pricing-constraints";
import type { PricingRuleOption } from "@/lib/types/pricing-rule-option";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";
import { addCalendarDaysIso } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/** One-line hint under “Guests”; full detail is shown in the amber alert when pricing fails. */
function guestPartyLimitsShortLine(c: PricingConstraints, scope: MaxGuestsScope): string {
  const maxMeans =
    scope === "entire_party"
      ? "max counts everyone"
      : scope === "adults_and_children_only"
        ? "max is adults + children"
        : "max is adults only";
  let children = "";
  let infants = "";
  if (c.childPricingType === "not_allowed") children = " · No children";
  if (c.infantPricingType === "not_allowed") infants = " · No infants";
  else if (c.infantPricingType === "free") infants = " · Infants free";
  else infants = " · Infants priced";
  const infantCap =
    typeof c.maxInfants === "number"
      ? ` · ≤${c.maxInfants} infant${c.maxInfants === 1 ? "" : "s"}`
      : "";
  return `This date: min ${c.minGuests} · max ${c.maxGuests} guests (${maxMeans})${children}${infants}${infantCap}.`;
}

interface PricingBreakdown {
  pricingMode?: "per_person" | "package";
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
  adults: number;
  children: number;
  infants: number;
}

export function BookingFormClient({
  tourId,
  tourTitle,
  initialDate,
  initialDepartureId,
  pickups,
  pricingConstraints,
  pricingRules,
  minimumAdvanceBookingDays,
  minimumAdvanceBookingBlocked,
  isMultiDay,
  durationDays,
}: {
  tourId: string;
  tourTitle: string;
  initialDate?: string;
  initialDepartureId?: string;
  pickups: { id: string; name: string; timeLabel: string }[];
  pricingConstraints: PricingConstraints | null;
  pricingRules: PricingRuleOption[];
  minimumAdvanceBookingDays: number;
  minimumAdvanceBookingBlocked: boolean;
  isMultiDay: boolean;
  durationDays: number;
}) {
  const router = useRouter();

  const date = initialDate;
  const departureId = initialDepartureId ?? pickups[0]?.id;
  const selectedPickup = pickups.find((p) => p.id === departureId);
  const effectiveDuration = Math.max(1, durationDays);
  const isMultiDayJourney = Boolean(isMultiDay) && effectiveDuration > 1;
  const returnDateStr =
    date && isMultiDayJourney ? addCalendarDaysIso(date, effectiveDuration - 1) : date;

  const defaultAdultsFloor = pricingConstraints?.minGuests ?? 2;
  const packageRules = pricingRules.filter((r) => r.pricingMode === "package");
  const hasPackagePricing = packageRules.length > 0;
  const [selectedPricingRuleId, setSelectedPricingRuleId] = useState<string | null>(
    hasPackagePricing ? packageRules[0]!.id : null
  );
  const [extraAdults, setExtraAdults] = useState(0);
  const [extraChildren, setExtraChildren] = useState(0);
  const [extraInfants, setExtraInfants] = useState(0);
  const selectedPackageRule = hasPackagePricing
    ? packageRules.find((r) => r.id === selectedPricingRuleId) ?? packageRules[0]!
    : null;
  const activeConstraints: PricingConstraints | null = selectedPackageRule
    ? {
        minGuests: selectedPackageRule.minGuests,
        maxGuests: selectedPackageRule.maxGuests,
        maxGuestsScope: selectedPackageRule.maxGuestsScope,
        childPricingType: selectedPackageRule.childPricingType,
        maxInfants: selectedPackageRule.maxInfants,
        infantPricingType: selectedPackageRule.infantPricingType,
        pricingMode: selectedPackageRule.pricingMode,
      }
    : pricingConstraints;

  const defaultAdultsFromPackage = selectedPackageRule?.includedGuests ?? defaultAdultsFloor;
  const [adults, setAdults] = useState(() => Math.max(1, defaultAdultsFromPackage));
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupGoogleMapsLink, setPickupGoogleMapsLink] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [pricingMessage, setPricingMessage] = useState<string | null>(null);
  const pricingRequestSeq = useRef(0);
  const minimumAdvanceMessage =
    minimumAdvanceBookingDays > 0
      ? `This tour requires at least ${minimumAdvanceBookingDays} day${minimumAdvanceBookingDays === 1 ? "" : "s"} advance booking. If you need a last-minute reservation, please contact us directly.`
      : null;

  const childrenNotAllowed = activeConstraints?.childPricingType === "not_allowed";
  const infantsNotAllowed = activeConstraints?.infantPricingType === "not_allowed";
  const infantCap =
    typeof activeConstraints?.maxInfants === "number" ? activeConstraints.maxInfants : null;
  const childrenLocked = childrenNotAllowed;
  const infantsLocked = infantsNotAllowed || infantCap === 0;
  const effectiveChildren = childrenLocked ? 0 : children;
  const effectiveInfants = infantsLocked ? 0 : infants;
  const maxGuests = activeConstraints?.maxGuests;
  const maxGuestsScope: MaxGuestsScope = activeConstraints
    ? normalizeMaxGuestsScope(activeConstraints.maxGuestsScope)
    : "entire_party";

  useEffect(() => {
    if (!selectedPackageRule) return;
    setExtraAdults(0);
    setExtraChildren(0);
    setExtraInfants(0);
    setAdults(Math.max(1, selectedPackageRule.includedGuests));
    setChildren(0);
    setInfants(0);
  }, [selectedPackageRule?.id]);

  useEffect(() => {
    if (!selectedPackageRule) return;
    const included = Math.max(1, selectedPackageRule.includedGuests);
    setAdults(included + Math.max(0, extraAdults));
    setChildren(childrenLocked ? 0 : Math.max(0, extraChildren));
    setInfants(infantsLocked ? 0 : Math.max(0, extraInfants));
  }, [
    selectedPackageRule?.id,
    selectedPackageRule?.includedGuests,
    extraAdults,
    extraChildren,
    extraInfants,
    childrenLocked,
    infantsLocked,
  ]);

  let adultsMax: number | undefined;
  let childrenMax: number | undefined;
  let infantPartyRoom: number;

  if (typeof maxGuests === "number") {
    if (maxGuestsScope === "entire_party") {
      adultsMax = Math.max(1, maxGuests - effectiveChildren - effectiveInfants);
      childrenMax = Math.max(0, maxGuests - adults - effectiveInfants);
      infantPartyRoom = Math.max(0, maxGuests - adults - effectiveChildren - effectiveInfants);
    } else if (maxGuestsScope === "adults_and_children_only") {
      adultsMax = Math.max(1, maxGuests - effectiveChildren);
      childrenMax = Math.max(0, maxGuests - adults);
      infantPartyRoom = Number.POSITIVE_INFINITY;
    } else {
      adultsMax = Math.max(1, maxGuests);
      childrenMax = undefined;
      infantPartyRoom = Number.POSITIVE_INFINITY;
    }
  } else {
    adultsMax = undefined;
    childrenMax = undefined;
    infantPartyRoom = Number.POSITIVE_INFINITY;
  }

  const infantRuleCap = typeof infantCap === "number" ? infantCap : Number.POSITIVE_INFINITY;
  const infantInputMax = infantsLocked
    ? 0
    : Number.isFinite(Math.min(infantPartyRoom, infantRuleCap))
      ? Math.min(infantPartyRoom, infantRuleCap)
      : undefined;

  useEffect(() => {
    if (selectedPackageRule) return;
    if (adultsMax !== undefined && adults > adultsMax) setAdults(adultsMax);
  }, [selectedPackageRule, adultsMax, adults]);

  useEffect(() => {
    if (selectedPackageRule) return;
    if (childrenLocked) {
      if (children !== 0) setChildren(0);
      return;
    }
    if (childrenMax !== undefined && children > childrenMax) setChildren(childrenMax);
  }, [selectedPackageRule, childrenLocked, childrenMax, children]);

  useEffect(() => {
    if (selectedPackageRule) return;
    if (infantsLocked) {
      if (infants !== 0) setInfants(0);
      return;
    }
    if (infantInputMax !== undefined && infants > infantInputMax) {
      setInfants(infantInputMax);
      return;
    }
    if (typeof infantCap === "number" && infants > infantCap) setInfants(infantCap);
  }, [selectedPackageRule, infantsLocked, infantCap, infantInputMax, infants]);

  const includedAdultsForPackage = selectedPackageRule
    ? Math.max(1, selectedPackageRule.includedGuests)
    : 0;
  const extraAdultsNotAllowed = selectedPackageRule?.extraAdultPricingType === "not_allowed";
  const extraAdultsMax =
    selectedPackageRule && adultsMax !== undefined
      ? extraAdultsNotAllowed
        ? 0
        : Math.max(0, adultsMax - includedAdultsForPackage)
      : undefined;
  const extraChildrenMax = selectedPackageRule ? childrenMax : undefined;
  const extraInfantsMax = selectedPackageRule ? infantInputMax : undefined;
  const canAddExtraAdults = Boolean(
    selectedPackageRule &&
      !extraAdultsNotAllowed &&
      (extraAdultsMax === undefined || extraAdultsMax > 0)
  );
  const canAddExtraChildren = Boolean(
    selectedPackageRule && !childrenLocked && (extraChildrenMax === undefined || extraChildrenMax > 0)
  );
  const canAddExtraInfants = Boolean(
    selectedPackageRule && !infantsLocked && (extraInfantsMax === undefined || extraInfantsMax > 0)
  );
  const hasAnyAddOns = canAddExtraAdults || canAddExtraChildren || canAddExtraInfants;

  useEffect(() => {
    if (!extraAdultsNotAllowed) return;
    if (extraAdults !== 0) setExtraAdults(0);
  }, [extraAdultsNotAllowed, extraAdults]);

  useEffect(() => {
    if (!date || !departureId) {
      setPricing(null);
      setPricingMessage(null);
      return;
    }

    async function fetchPricing() {
      const requestId = ++pricingRequestSeq.current;
      try {
        const res = await fetch("/api/bookings/calculate-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tour_id: tourId,
            departure_location_id: departureId,
            booking_date: date,
            adults,
            children: childrenLocked ? 0 : children,
            infants: infantsLocked ? 0 : infants,
            pricing_rule_id: selectedPackageRule?.id ?? null,
          }),
        });
        const json = (await res.json()) as {
          success?: boolean;
          message?: string;
          breakdown?: Record<string, unknown>;
        };
        if (!res.ok || !json.success) {
          if (requestId !== pricingRequestSeq.current) return;
          setPricing(null);
          setPricingMessage(
            typeof json.message === "string" ? json.message : "Unable to price this party size."
          );
          return;
        }
        if (requestId !== pricingRequestSeq.current) return;
        setPricingMessage(null);
        const b = json.breakdown as unknown as PricingBreakdown;
        setPricing({
          ...b,
          adults,
          children: childrenLocked ? 0 : children,
          infants: infantsLocked ? 0 : infants,
        });
      } catch {
        if (requestId !== pricingRequestSeq.current) return;
        setPricing(null);
        setPricingMessage("Unable to calculate pricing right now.");
      }
    }

    fetchPricing();
  }, [
    tourId,
    date,
    departureId,
    adults,
    children,
    infants,
    childrenLocked,
    infantsLocked,
    selectedPackageRule?.id,
  ]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (minimumAdvanceBookingBlocked) {
      setError("Minimum advance booking period not met");
      return;
    }
    if (!date || !departureId) {
      setError("Please select a date and pickup.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tour_id: tourId,
          booking_date: date,
          departure_location_id: departureId,
          adults,
          children: childrenLocked ? 0 : children,
          infants: infantsLocked ? 0 : infants,
          pricing_rule_id: selectedPackageRule?.id ?? null,
          customer_first_name: firstName,
          customer_last_name: lastName,
          customer_email: email,
          customer_phone: phone,
          pickup_address: pickupAddress,
          pickup_google_maps_link: pickupGoogleMapsLink.trim() ? pickupGoogleMapsLink.trim() : null,
          customer_notes: notes || null,
        }),
      });
      const json = (await res.json()) as { success?: boolean; message?: string; stripe_checkout_url?: string };
      if (!res.ok || !json.success || !json.stripe_checkout_url) {
        setError(json.message ?? "Could not start checkout");
        setLoading(false);
        return;
      }
      window.location.href = json.stripe_checkout_url;
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <RevealOnView className="grid gap-12 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-16">
      <form onSubmit={onSubmit} className="space-y-8">
        <Card className="rounded-sm border-brand-border shadow-lg shadow-brand-heading/5 ring-1 ring-brand-heading/5">
          <CardHeader className="border-b border-brand-border p-4 md:p-6">
            <CardTitle className="font-sans text-lg font-bold tracking-tight text-brand-heading md:text-2xl">
              Guests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-4 md:space-y-6 md:p-6">
            {activeConstraints ? (
              <p className="rounded-sm border border-brand-border bg-brand-surface-soft/70 px-3 py-2.5 text-sm font-medium leading-snug text-brand-body ring-1 ring-brand-heading/5">
                {guestPartyLimitsShortLine(activeConstraints, maxGuestsScope)}
              </p>
            ) : null}
            {hasPackagePricing ? (
              <div className="rounded-sm border border-brand-border/70 bg-brand-surface-soft/30 p-3 md:p-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-normal text-brand-muted">
                  Package selection
                </label>
                <select
                  className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={selectedPackageRule?.id ?? ""}
                  onChange={(e) => setSelectedPricingRuleId(e.target.value)}
                >
                  {packageRules.map((rule) => (
                    <option key={rule.id} value={rule.id}>
                      {rule.label} - {formatPrice(rule.packageBase, "AUD")}
                    </option>
                  ))}
                </select>
                {selectedPackageRule ? (
                  <p className="mt-2 text-xs text-brand-muted">
                    Includes {selectedPackageRule.includedGuests} guest
                    {selectedPackageRule.includedGuests === 1 ? "" : "s"}.
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {selectedPackageRule ? (
                <>
                  <div className="w-full space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-sm border border-brand-border bg-brand-surface-soft px-2 py-1 font-semibold text-brand-heading">
                        Includes {includedAdultsForPackage} adult{includedAdultsForPackage === 1 ? "" : "s"}
                      </span>
                      <span className="rounded-sm border border-brand-border bg-brand-surface-soft px-2 py-1 text-brand-muted">
                        {childrenLocked ? "No children" : "Children allowed"}
                      </span>
                      <span className="rounded-sm border border-brand-border bg-brand-surface-soft px-2 py-1 text-brand-muted">
                        {infantsLocked ? "No infants" : "Infants allowed"}
                      </span>
                    </div>

                    {hasAnyAddOns ? (
                      <div className="rounded-sm border border-brand-border/70 bg-white p-3 md:p-4">
                        <p className="mb-3 text-xs font-bold uppercase tracking-normal text-brand-muted">
                          Add extras
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {canAddExtraAdults ? (
                          <div>
                            <label className="block text-sm font-semibold text-brand-muted mb-2">
                              Extra adults
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={extraAdultsMax}
                              className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                              value={extraAdults}
                              onChange={(e) => {
                                const raw = Number.parseInt(e.target.value, 10);
                                if (Number.isNaN(raw)) return;
                                const capped =
                                  extraAdultsMax === undefined
                                    ? raw
                                    : Math.min(Math.max(0, raw), extraAdultsMax);
                                setExtraAdults(capped);
                              }}
                            />
                          </div>
                        ) : null}
                        {canAddExtraChildren ? (
                          <div>
                            <label className="block text-sm font-semibold text-brand-muted mb-2">
                              Extra children
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={extraChildrenMax}
                              className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                              value={extraChildren}
                              onChange={(e) => {
                                const raw = Number.parseInt(e.target.value, 10);
                                if (Number.isNaN(raw)) return;
                                const capped =
                                  extraChildrenMax === undefined
                                    ? raw
                                    : Math.min(Math.max(0, raw), extraChildrenMax);
                                setExtraChildren(capped);
                              }}
                            />
                          </div>
                        ) : null}
                        {canAddExtraInfants ? (
                          <div>
                            <label className="block text-sm font-semibold text-brand-muted mb-2">
                              Extra infants
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={extraInfantsMax}
                              className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                              value={extraInfants}
                              onChange={(e) => {
                                const raw = Number.parseInt(e.target.value, 10);
                                if (Number.isNaN(raw)) return;
                                const capped =
                                  extraInfantsMax === undefined
                                    ? raw
                                    : Math.min(Math.max(0, raw), extraInfantsMax);
                                setExtraInfants(capped);
                              }}
                            />
                          </div>
                        ) : null}
                        </div>
                      </div>
                    ) : (
                      <p className="rounded-sm border border-brand-border/70 bg-white px-3 py-2.5 text-sm text-brand-muted">
                        This package does not allow additional guests.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <label className="block text-base font-bold uppercase tracking-normal text-brand-muted mb-2">Adults</label>
                    <input
                      type="number"
                      min={1}
                      max={adultsMax}
                      className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                      value={adults}
                      onChange={(e) => {
                        const raw = Number.parseInt(e.target.value, 10);
                        if (Number.isNaN(raw)) return;
                        const capped = adultsMax === undefined ? raw : Math.min(raw, adultsMax);
                        setAdults(Math.max(1, capped));
                      }}
                    />
                  </div>
                  <div className={cn("flex-1", childrenLocked && "opacity-50")}>
                    <label className="block text-base font-bold uppercase tracking-normal text-brand-muted mb-2">
                      Children
                      {childrenLocked ? (
                        <span className="ml-2 font-normal normal-case text-brand-muted">(not available)</span>
                      ) : null}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={childrenMax}
                      disabled={childrenLocked}
                      aria-disabled={childrenLocked}
                      className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                      value={childrenLocked ? 0 : children}
                      onChange={(e) => {
                        if (childrenLocked) return;
                        const raw = Number.parseInt(e.target.value, 10);
                        if (Number.isNaN(raw)) return;
                        const capped = childrenMax === undefined ? raw : Math.min(Math.max(0, raw), childrenMax);
                        setChildren(capped);
                      }}
                    />
                  </div>
                  <div className={cn("flex-1", infantsLocked && "opacity-50")}>
                    <label className="block text-base font-bold uppercase tracking-normal text-brand-muted mb-2">
                      Infants
                      {infantsLocked ? (
                        <span className="ml-2 font-normal normal-case text-brand-muted">(not available)</span>
                      ) : null}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={infantInputMax}
                      disabled={infantsLocked}
                      aria-disabled={infantsLocked}
                      className={cn(
                        "w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10",
                        infantsLocked && "cursor-not-allowed bg-brand-surface-soft text-brand-muted"
                      )}
                      value={infantsLocked ? 0 : infants}
                      onChange={(e) => {
                        if (infantsLocked) return;
                        const raw = Number.parseInt(e.target.value, 10);
                        if (Number.isNaN(raw)) return;
                        const upper =
                          infantInputMax === undefined ? raw : Math.min(raw, infantInputMax);
                        setInfants(Math.max(0, upper));
                      }}
                    />
                  </div>
                </>
              )}
            </div>
            {pricingMessage ? (
              <div className="mt-4 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950">
                <p>{pricingMessage}</p>
                {activeConstraints ? (
                  <p className="mt-2 border-t border-amber-200/80 pt-2 text-xs font-normal leading-relaxed text-amber-950/95">
                    Minimum{" "}
                    <span className="font-bold">{activeConstraints.minGuests}</span> guests in total (adults +
                    children + infants).
                    {maxGuestsScope === "entire_party" ? (
                      <>
                        {" "}
                        Up to <span className="font-bold">{activeConstraints.maxGuests}</span> guests; everyone in
                        the party counts toward that maximum.
                      </>
                    ) : maxGuestsScope === "adults_and_children_only" ? (
                      <>
                        {" "}
                        Up to <span className="font-bold">{activeConstraints.maxGuests}</span> adults and children
                        combined; infants do not use a seat against that cap.
                      </>
                    ) : (
                      <>
                        {" "}
                        Up to <span className="font-bold">{activeConstraints.maxGuests}</span> adults; children and
                        infants are outside that cap (still subject to the minimum and infant rules).
                      </>
                    )}
                    {activeConstraints.infantPricingType === "not_allowed" ? (
                      <> Infants are not offered on this tour.</>
                    ) : activeConstraints.infantPricingType === "free" ? (
                      maxGuestsScope === "entire_party" ? (
                        <> Infants travel free (still count toward the party maximum).</>
                      ) : (
                        <> Infants travel free.</>
                      )
                    ) : (
                      <> Infant seats are priced per the active rule.</>
                    )}
                    {activeConstraints.childPricingType === "not_allowed" ? (
                      <> Children are not offered on this tour.</>
                    ) : null}
                    {typeof activeConstraints.maxInfants === "number" ? (
                      <>
                        {" "}
                        At most <span className="font-bold">{activeConstraints.maxInfants}</span> infant
                        {activeConstraints.maxInfants === 1 ? "" : "s"} per booking
                        {activeConstraints.maxInfants === 0 ? " (none allowed)" : ""}.
                      </>
                    ) : null}
                  </p>
                ) : null}
              </div>
            ) : null}
            {minimumAdvanceBookingBlocked && minimumAdvanceMessage ? (
              <div className="mt-4 rounded-sm border border-amber-200 bg-amber-50 px-3 py-3 text-sm font-medium text-amber-950">
                <p>{minimumAdvanceMessage}</p>
                <Button asChild variant="secondary" className="mt-3 h-10 px-4 text-sm font-bold tracking-tight">
                  <Link href="/contact">Contact us for urgent bookings</Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-sm border-brand-border shadow-lg shadow-brand-heading/5 ring-1 ring-brand-heading/5">
          <CardHeader className="border-b border-brand-border p-4 md:p-6">
            <CardTitle className="font-sans text-lg font-bold tracking-tight text-brand-heading md:text-2xl">
              Contact details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-base font-bold uppercase tracking-normal text-brand-muted mb-2">First name</label>
                <input
                  required
                  className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-base font-bold uppercase tracking-normal text-brand-muted mb-2">Last name</label>
                <input
                  required
                  className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-base font-bold uppercase tracking-normal text-brand-muted mb-2">Email address</label>
                <input
                  required
                  type="email"
                  className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-base font-bold uppercase tracking-normal text-brand-muted mb-2">Phone</label>
                <input
                  required
                  className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-base font-bold uppercase tracking-normal text-brand-muted mb-2">
                  Exact pickup location
                </label>
                <input
                  required
                  minLength={5}
                  placeholder="Hotel name, street address, suburb"
                  className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                />
                <p className="mt-2 text-xs text-brand-muted">
                  Please provide the exact pickup point for your tour day (minimum 5 characters).
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-base font-bold uppercase tracking-normal text-brand-muted mb-2">
                  Google Maps link (optional)
                </label>
                <input
                  placeholder="https://maps.google.com/..."
                  className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={pickupGoogleMapsLink}
                  onChange={(e) => setPickupGoogleMapsLink(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-base font-bold uppercase tracking-normal text-brand-muted mb-2">Special notes</label>
                <textarea
                  className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? <p className="text-sm font-bold text-red-600 bg-red-50 p-4 rounded-sm border border-red-200">{error}</p> : null}
      </form>

      {/* Sidebar */}
      <aside className="lg:sticky lg:top-40">
        <Card className="rounded-sm border-brand-border shadow-lg shadow-brand-heading/5 ring-1 ring-brand-heading/5">
          <CardHeader className="border-b border-brand-border p-3 md:p-6">
            <p className="line-clamp-2 text-xl font-bold tracking-tight text-brand-heading md:text-2xl">{tourTitle}</p>
          </CardHeader>
          <CardContent className="space-y-4 p-3 md:space-y-6 md:p-6">
            {date && (
              <div className="rounded-sm border border-brand-border bg-brand-surface-soft/40 p-4 space-y-3">
                {isMultiDayJourney && returnDateStr && returnDateStr !== date ? (
                  <>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-normal text-brand-muted">
                        Departure
                      </span>
                      <p className="mt-1 text-base font-bold text-brand-heading">{formatDate(date)}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-normal text-brand-muted">Return</span>
                      <p className="mt-1 text-base font-bold text-brand-heading">{formatDate(returnDateStr)}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-bold uppercase tracking-normal text-brand-muted">Tour date</span>
                    <p className="mt-1 text-base font-bold text-brand-heading">{formatDate(date)}</p>
                  </>
                )}
              </div>
            )}
            {selectedPickup && (
              <div className="rounded-sm border border-brand-border bg-brand-surface-soft/40 p-4">
                <span className="text-xs font-bold uppercase tracking-normal text-brand-muted">Pickup location & time</span>
                <p className="mt-1 text-sm font-medium text-brand-heading">{selectedPickup.name}</p>
                <p className="mt-0.5 text-xs text-brand-muted">{selectedPickup.timeLabel}</p>
              </div>
            )}

            <div>
              <span className="text-xs font-bold uppercase tracking-normal text-brand-muted">Guests</span>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {adults > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-brand-border bg-brand-surface px-2.5 py-1.5 font-medium text-brand-heading">
                    <span className="text-brand-primary font-bold">{adults}</span>
                    <span className="text-brand-muted">Adult{adults !== 1 ? "s" : ""}</span>
                  </span>
                )}
                {effectiveChildren > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-brand-border bg-brand-surface px-2.5 py-1.5 font-medium text-brand-heading">
                    <span className="text-brand-primary font-bold">{effectiveChildren}</span>
                    <span className="text-brand-muted">Child{effectiveChildren !== 1 ? "ren" : ""}</span>
                  </span>
                )}
                {effectiveInfants > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-brand-border bg-brand-surface px-2.5 py-1.5 font-medium text-brand-heading">
                    <span className="text-brand-primary font-bold">{effectiveInfants}</span>
                    <span className="text-brand-muted">Infant{effectiveInfants !== 1 ? "s" : ""}</span>
                  </span>
                )}
              </div>
            </div>

            {pricing && (
              <div className="rounded-sm border border-brand-border bg-brand-surface p-4">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-bold uppercase tracking-normal text-brand-muted">Total</span>
                  <span className="text-2xl font-black text-brand-heading">{formatPrice(pricing.total, pricing.currency)}</span>
                </div>
                <div className="space-y-1.5 text-xs text-brand-muted">
                  {pricing.pricingMode === "package" ? (
                    <>
                      <p className="flex items-start justify-between gap-3">
                        <span>Package ({pricing.includedGuests ?? pricing.includedAdults ?? 2} guests included)</span>
                        <span className="shrink-0 font-semibold text-brand-heading">
                          {formatPrice(pricing.packageBase ?? 0, pricing.currency)}
                        </span>
                      </p>
                      {(pricing.extraAdultsCount ?? 0) > 0 ? (
                        <p className="flex items-start justify-between gap-3">
                          <span>
                            {pricing.extraAdultsCount} Extra adult
                          {pricing.extraAdultsCount !== 1 ? "s" : ""} ×{" "}
                            {formatPrice(pricing.extraAdultUnit ?? pricing.adultUnit, pricing.currency)}
                          </span>
                          <span className="shrink-0 font-semibold text-brand-heading">
                            {formatPrice(
                              (pricing.extraAdultsCount ?? 0) *
                                (pricing.extraAdultUnit ?? pricing.adultUnit),
                              pricing.currency
                            )}
                          </span>
                        </p>
                      ) : null}
                    </>
                  ) : pricing.adults > 0 ? (
                    <p className="flex items-start justify-between gap-3">
                      <span>
                        {pricing.adults} Adult{pricing.adults !== 1 ? "s" : ""} ×{" "}
                        {formatPrice(pricing.adultUnit, pricing.currency)}
                      </span>
                      <span className="shrink-0 font-semibold text-brand-heading">
                        {formatPrice(pricing.adults * pricing.adultUnit, pricing.currency)}
                      </span>
                    </p>
                  ) : null}
                  {pricing.pricingMode === "package" ? (
                    <>
                      {(pricing.extraChildrenCount ?? 0) > 0 ? (
                        <p className="flex items-start justify-between gap-3">
                          <span>
                            {pricing.extraChildrenCount} Extra child
                          {pricing.extraChildrenCount !== 1 ? "ren" : ""} ×{" "}
                            {formatPrice(pricing.extraChildUnit ?? pricing.childUnit, pricing.currency)}
                          </span>
                          <span className="shrink-0 font-semibold text-brand-heading">
                            {formatPrice(
                              (pricing.extraChildrenCount ?? 0) *
                                (pricing.extraChildUnit ?? pricing.childUnit),
                              pricing.currency
                            )}
                          </span>
                        </p>
                      ) : pricing.children > 0 ? (
                        <p>
                          {pricing.children} Child
                          {pricing.children !== 1 ? "ren" : ""} included in package
                        </p>
                      ) : null}
                    </>
                  ) : pricing.children > 0 ? (
                    <p className="flex items-start justify-between gap-3">
                      <span>
                        {pricing.children} Child{pricing.children !== 1 ? "ren" : ""} ×{" "}
                        {formatPrice(pricing.childUnit, pricing.currency)}
                      </span>
                      <span className="shrink-0 font-semibold text-brand-heading">
                        {formatPrice(pricing.children * pricing.childUnit, pricing.currency)}
                      </span>
                    </p>
                  ) : null}
                  {pricing.infants > 0 && (
                    <p className="flex items-start justify-between gap-3">
                      <span>
                        {pricing.infants} Infant{pricing.infants !== 1 ? "s" : ""} ×{" "}
                        {formatPrice(pricing.infantUnit, pricing.currency)}
                      </span>
                      <span className="shrink-0 font-semibold text-brand-heading">
                        {formatPrice(pricing.infants * pricing.infantUnit, pricing.currency)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button
              variant="primary"
              className={cn("w-full", primaryTourCtaClassName)}
              disabled={loading || minimumAdvanceBookingBlocked}
              onClick={onSubmit}
            >
              {minimumAdvanceBookingBlocked ? "Contact us for urgent bookings" : loading ? "Redirecting…" : "Continue to payment"}
            </Button>
            {!minimumAdvanceBookingBlocked ? (
              <p className="text-center text-xs leading-relaxed text-brand-muted">
                Secure checkout powered by Stripe. You can review details before final payment.
              </p>
            ) : null}
            {minimumAdvanceBookingBlocked ? (
              <Button asChild variant="secondary" className="w-full text-base font-bold tracking-tight">
                <Link href="/contact">Contact us for urgent bookings</Link>
              </Button>
            ) : null}

            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/availability")}
              className="w-full text-base font-bold tracking-tight"
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </aside>
    </RevealOnView>
  );
}
