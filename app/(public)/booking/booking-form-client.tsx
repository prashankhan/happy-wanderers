"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RevealOnView } from "@/components/motion/reveal-on-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  normalizeMaxGuestsScope,
  type MaxGuestsScope,
  type PricingConstraints,
} from "@/lib/types/pricing-constraints";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";
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
  let infants = "";
  if (c.infantPricingType === "not_allowed") infants = " · No infants";
  else if (c.infantPricingType === "free") infants = " · Infants free";
  else infants = " · Infants priced";
  const infantCap =
    typeof c.maxInfants === "number"
      ? ` · ≤${c.maxInfants} infant${c.maxInfants === 1 ? "" : "s"}`
      : "";
  return `This date: min ${c.minGuests} · max ${c.maxGuests} guests (${maxMeans})${infants}${infantCap}.`;
}

interface PricingBreakdown {
  pricingMode?: "per_person" | "package";
  currency: string;
  adultUnit: number;
  childUnit: number;
  infantUnit: number;
  total: number;
  includedAdults?: number;
  packageBase?: number;
  extraAdultUnit?: number;
  extraChildUnit?: number;
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
}: {
  tourId: string;
  tourTitle: string;
  initialDate?: string;
  initialDepartureId?: string;
  pickups: { id: string; name: string; timeLabel: string }[];
  pricingConstraints: PricingConstraints | null;
}) {
  const router = useRouter();

  const date = initialDate;
  const departureId = initialDepartureId ?? pickups[0]?.id;
  const selectedPickup = pickups.find((p) => p.id === departureId);

  const defaultAdultsFloor = pricingConstraints?.minGuests ?? 2;
  const [adults, setAdults] = useState(() => Math.max(1, defaultAdultsFloor));
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [pricingMessage, setPricingMessage] = useState<string | null>(null);

  const infantsNotAllowed = pricingConstraints?.infantPricingType === "not_allowed";
  const infantCap =
    typeof pricingConstraints?.maxInfants === "number" ? pricingConstraints.maxInfants : null;
  const infantsLocked = infantsNotAllowed || infantCap === 0;
  const effectiveInfants = infantsLocked ? 0 : infants;
  const maxGuests = pricingConstraints?.maxGuests;
  const maxGuestsScope: MaxGuestsScope = pricingConstraints
    ? normalizeMaxGuestsScope(pricingConstraints.maxGuestsScope)
    : "entire_party";

  let adultsMax: number | undefined;
  let childrenMax: number | undefined;
  let infantPartyRoom: number;

  if (typeof maxGuests === "number") {
    if (maxGuestsScope === "entire_party") {
      adultsMax = Math.max(1, maxGuests - children - effectiveInfants);
      childrenMax = Math.max(0, maxGuests - adults - effectiveInfants);
      infantPartyRoom = Math.max(0, maxGuests - adults - children - effectiveInfants);
    } else if (maxGuestsScope === "adults_and_children_only") {
      adultsMax = Math.max(1, maxGuests - children);
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
    if (adultsMax !== undefined && adults > adultsMax) setAdults(adultsMax);
  }, [adultsMax, adults]);

  useEffect(() => {
    if (childrenMax !== undefined && children > childrenMax) setChildren(childrenMax);
  }, [childrenMax, children]);

  useEffect(() => {
    if (infantsLocked) {
      if (infants !== 0) setInfants(0);
      return;
    }
    if (infantInputMax !== undefined && infants > infantInputMax) {
      setInfants(infantInputMax);
      return;
    }
    if (typeof infantCap === "number" && infants > infantCap) setInfants(infantCap);
  }, [infantsLocked, infantCap, infantInputMax, infants]);

  useEffect(() => {
    if (!date || !departureId) {
      setPricing(null);
      setPricingMessage(null);
      return;
    }

    async function fetchPricing() {
      try {
        const res = await fetch("/api/bookings/calculate-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tour_id: tourId,
            departure_location_id: departureId,
            booking_date: date,
            adults,
            children,
            infants: infantsLocked ? 0 : infants,
          }),
        });
        const json = (await res.json()) as {
          success?: boolean;
          message?: string;
          breakdown?: Record<string, unknown>;
        };
        if (!res.ok || !json.success) {
          setPricing(null);
          setPricingMessage(
            typeof json.message === "string" ? json.message : "Unable to price this party size."
          );
          return;
        }
        setPricingMessage(null);
        const b = json.breakdown as unknown as PricingBreakdown;
        setPricing({
          ...b,
          adults,
          children,
          infants: infantsLocked ? 0 : infants,
        });
      } catch {
        setPricing(null);
        setPricingMessage("Unable to calculate pricing right now.");
      }
    }

    fetchPricing();
  }, [tourId, date, departureId, adults, children, infants, infantsLocked]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
          children,
          infants: infantsLocked ? 0 : infants,
          customer_first_name: firstName,
          customer_last_name: lastName,
          customer_email: email,
          customer_phone: phone,
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
          <CardContent className="p-4 md:p-6">
            {pricingConstraints ? (
              <p className="mb-4 rounded-sm border border-brand-border bg-brand-surface-soft/70 px-3 py-2.5 text-sm font-medium leading-snug text-brand-body ring-1 ring-brand-heading/5">
                {guestPartyLimitsShortLine(pricingConstraints, maxGuestsScope)}
              </p>
            ) : null}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
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
              <div className="flex-1">
                <label className="block text-base font-bold uppercase tracking-normal text-brand-muted mb-2">Children</label>
                <input
                  type="number"
                  min={0}
                  max={childrenMax}
                  className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={children}
                  onChange={(e) => {
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
            </div>
            {pricingMessage ? (
              <div className="mt-4 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950">
                <p>{pricingMessage}</p>
                {pricingConstraints ? (
                  <p className="mt-2 border-t border-amber-200/80 pt-2 text-xs font-normal leading-relaxed text-amber-950/95">
                    Minimum{" "}
                    <span className="font-bold">{pricingConstraints.minGuests}</span> guests in total (adults +
                    children + infants).
                    {maxGuestsScope === "entire_party" ? (
                      <>
                        {" "}
                        Up to <span className="font-bold">{pricingConstraints.maxGuests}</span> guests; everyone in
                        the party counts toward that maximum.
                      </>
                    ) : maxGuestsScope === "adults_and_children_only" ? (
                      <>
                        {" "}
                        Up to <span className="font-bold">{pricingConstraints.maxGuests}</span> adults and children
                        combined; infants do not use a seat against that cap.
                      </>
                    ) : (
                      <>
                        {" "}
                        Up to <span className="font-bold">{pricingConstraints.maxGuests}</span> adults; children and
                        infants are outside that cap (still subject to the minimum and infant rules).
                      </>
                    )}
                    {pricingConstraints.infantPricingType === "not_allowed" ? (
                      <> Infants are not offered on this tour.</>
                    ) : pricingConstraints.infantPricingType === "free" ? (
                      maxGuestsScope === "entire_party" ? (
                        <> Infants travel free (still count toward the party maximum).</>
                      ) : (
                        <> Infants travel free.</>
                      )
                    ) : (
                      <> Infant seats are priced per the active rule.</>
                    )}
                    {typeof pricingConstraints.maxInfants === "number" ? (
                      <>
                        {" "}
                        At most <span className="font-bold">{pricingConstraints.maxInfants}</span> infant
                        {pricingConstraints.maxInfants === 1 ? "" : "s"} per booking
                        {pricingConstraints.maxInfants === 0 ? " (none allowed)" : ""}.
                      </>
                    ) : null}
                  </p>
                ) : null}
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
            <p className="text-lg md:text-2xl font-bold tracking-tight text-brand-heading">{tourTitle}</p>
          </CardHeader>
          <CardContent className="space-y-4 p-3 md:space-y-6 md:p-6">
            {date && (
              <div className="rounded-sm border border-brand-border bg-brand-surface-soft/40 p-4">
                <span className="text-xs font-bold uppercase tracking-normal text-brand-muted">Date</span>
                <p className="mt-1 text-base font-bold text-brand-heading">{formatDate(date)}</p>
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
                {children > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-brand-border bg-brand-surface px-2.5 py-1.5 font-medium text-brand-heading">
                    <span className="text-brand-primary font-bold">{children}</span>
                    <span className="text-brand-muted">Child{children !== 1 ? "ren" : ""}</span>
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
                <div className="space-y-1 text-xs text-brand-muted">
                  {pricing.pricingMode === "package" ? (
                    <>
                      <p>
                        Package ({pricing.includedAdults ?? 2} adults included){" "}
                        {formatPrice(pricing.packageBase ?? 0, pricing.currency)}
                      </p>
                      {Math.max(0, pricing.adults - (pricing.includedAdults ?? 2)) > 0 ? (
                        <p>
                          {Math.max(0, pricing.adults - (pricing.includedAdults ?? 2))} Extra adult
                          {Math.max(0, pricing.adults - (pricing.includedAdults ?? 2)) !== 1 ? "s" : ""} ×{" "}
                          {formatPrice(pricing.extraAdultUnit ?? pricing.adultUnit, pricing.currency)}
                        </p>
                      ) : null}
                    </>
                  ) : pricing.adults > 0 ? (
                    <p>
                      {pricing.adults} Adult{pricing.adults !== 1 ? "s" : ""} ×{" "}
                      {formatPrice(pricing.adultUnit, pricing.currency)}
                    </p>
                  ) : null}
                  {pricing.children > 0 && (
                    <p>
                      {pricing.children} Child{pricing.children !== 1 ? "ren" : ""} ×{" "}
                      {formatPrice(
                        pricing.pricingMode === "package"
                          ? pricing.extraChildUnit ?? pricing.childUnit
                          : pricing.childUnit,
                        pricing.currency
                      )}
                    </p>
                  )}
                  {pricing.infants > 0 && (
                    <p>
                      {pricing.infants} Infant{pricing.infants !== 1 ? "s" : ""} ×{" "}
                      {formatPrice(pricing.infantUnit, pricing.currency)}
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button
              variant="primary"
              className={cn("w-full", primaryTourCtaClassName)}
              disabled={loading}
              onClick={onSubmit}
            >
              {loading ? "Redirecting…" : "Continue to payment"}
            </Button>

            <button type="button" onClick={() => router.push("/availability")} className="block w-full text-center text-sm font-medium text-brand-muted hover:text-brand-primary transition-colors">
              Back
            </button>
          </CardContent>
        </Card>
      </aside>
    </RevealOnView>
  );
}
