"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface PricingBreakdown {
  currency: string;
  adultUnit: number;
  childUnit: number;
  infantUnit: number;
  total: number;
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
}: {
  tourId: string;
  tourTitle: string;
  initialDate?: string;
  initialDepartureId?: string;
  pickups: { id: string; name: string; timeLabel: string }[];
}) {
  const router = useRouter();

  const date = initialDate;
  const departureId = initialDepartureId ?? pickups[0]?.id;
  const selectedPickup = pickups.find((p) => p.id === departureId);

  const [adults, setAdults] = useState(2);
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

  useEffect(() => {
    if (!date || !departureId) return;

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
            infants,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setPricing(json.breakdown);
        }
      } catch {
        // Silently fail - pricing is optional
      }
    }

    fetchPricing();
  }, [tourId, date, departureId, adults, children, infants]);

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
          infants,
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
    <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-16">
      <form onSubmit={onSubmit} className="space-y-8">
        <Card className="rounded-sm border-brand-border shadow-lg shadow-brand-heading/5 ring-1 ring-brand-heading/5">
          <CardHeader className="border-b border-brand-border p-4 md:p-6">
            <CardTitle className="font-serif text-lg md:text-2xl font-bold">Guests</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1">
                <label className="block text-base font-bold uppercase tracking-normal text-brand-muted mb-2">Adults</label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                />
              </div>
              <div className="flex-1">
                <label className="block text-base font-bold uppercase tracking-normal text-brand-muted mb-2">Children</label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                />
              </div>
              <div className="flex-1">
                <label className="block text-base font-bold uppercase tracking-normal text-brand-muted mb-2">Infants</label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={infants}
                  onChange={(e) => setInfants(Number(e.target.value))}
                />
              </div>
            </div>
            <p className="mt-4 text-xs text-brand-muted">Infants count toward vehicle capacity.</p>
          </CardContent>
        </Card>

        <Card className="rounded-sm border-brand-border shadow-lg shadow-brand-heading/5 ring-1 ring-brand-heading/5">
          <CardHeader className="border-b border-brand-border p-4 md:p-6">
            <CardTitle className="font-serif text-lg md:text-2xl font-bold">Contact details</CardTitle>
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
            <p className="text-lg md:text-2xl font-bold text-brand-heading">{tourTitle}</p>
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
                {infants > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-brand-border bg-brand-surface px-2.5 py-1.5 font-medium text-brand-heading">
                    <span className="text-brand-primary font-bold">{infants}</span>
                    <span className="text-brand-muted">Infant{infants !== 1 ? "s" : ""}</span>
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
                  {pricing.adults > 0 && (
                    <p>{pricing.adults} Adult{pricing.adults !== 1 ? "s" : ""} × {formatPrice(pricing.adultUnit, pricing.currency)}</p>
                  )}
                  {pricing.children > 0 && (
                    <p>{pricing.children} Child{pricing.children !== 1 ? "ren" : ""} × {formatPrice(pricing.childUnit, pricing.currency)}</p>
                  )}
                  {pricing.infants > 0 && (
                    <p>{pricing.infants} Infant{pricing.infants !== 1 ? "s" : ""} × {formatPrice(pricing.infantUnit, pricing.currency)}</p>
                  )}
                </div>
              </div>
            )}

            <Button variant="primary" className="w-full h-auto py-4 text-lg font-bold tracking-tight rounded-sm" disabled={loading} onClick={onSubmit}>
              {loading ? "Redirecting…" : "Continue to payment"}
            </Button>

            <button type="button" onClick={() => router.push("/availability")} className="block w-full text-center text-sm font-medium text-brand-muted hover:text-brand-primary transition-colors">
              Back
            </button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
