"use client";

import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";

import { PublicAvailabilityCalendar } from "@/components/calendar/public-availability-calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const inputClass =
  "mt-1 w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-heading shadow-sm transition focus:border-brand-accent/40 focus:outline-none focus:ring-2 focus:ring-brand-accent/20";

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
  const initialMonth = initialDate?.slice(0, 7);

  const [date, setDate] = useState<string | undefined>(initialDate);
  const [departureId, setDepartureId] = useState<string | undefined>(
    initialDepartureId ?? pickups[0]?.id
  );
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

  const pickupLabel = pickups.find((p) => p.id === departureId)?.name ?? "—";

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
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <form onSubmit={onSubmit} className="space-y-10">
        <Card className="shadow-md ring-1 ring-brand-heading/[0.03]">
          <CardHeader className="border-b border-brand-border">
            <CardTitle className="font-serif text-xl">Date &amp; pickup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <label className="block text-sm font-medium text-brand-heading">Pickup location</label>
            <select
              className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-heading shadow-sm transition focus:border-brand-accent/40 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              value={departureId ?? ""}
              onChange={(e) => setDepartureId(e.target.value || undefined)}
            >
              {pickups.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.timeLabel}
                </option>
              ))}
            </select>
            <PublicAvailabilityCalendar
              tourId={tourId}
              departureLocationId={departureId}
              initialMonth={initialMonth}
              selectedDate={date}
              onSelectDate={setDate}
              variant="compact"
            />
          </CardContent>
        </Card>

        <Card className="shadow-md ring-1 ring-brand-heading/[0.03]">
          <CardHeader className="border-b border-brand-border">
            <CardTitle className="font-serif text-xl">Guests</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
            <label className="text-sm">
              <span className="font-medium text-brand-body">Adults</span>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-brand-body">Children</span>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-brand-body">Infants</span>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={infants}
                onChange={(e) => setInfants(Number(e.target.value))}
              />
            </label>
            <p className="sm:col-span-3 text-xs text-brand-muted">Infants count toward vehicle capacity.</p>
          </CardContent>
        </Card>

        <Card className="shadow-md ring-1 ring-brand-heading/[0.03]">
          <CardHeader className="border-b border-brand-border">
            <CardTitle className="font-serif text-xl">Your details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            <label className="text-sm md:col-span-1">
              <span className="font-medium text-brand-body">First name</span>
              <input required className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>
            <label className="text-sm md:col-span-1">
              <span className="font-medium text-brand-body">Last name</span>
              <input required className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="font-medium text-brand-body">Email</span>
              <input
                required
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="font-medium text-brand-body">Phone</span>
              <input required className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="font-medium text-brand-body">Notes (optional)</span>
              <textarea className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
          </CardContent>
        </Card>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex flex-wrap gap-4">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Redirecting…" : "Continue to payment"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/tours")}>
            Back to tours
          </Button>
        </div>
      </form>

      <aside className="lg:sticky lg:top-28">
        <div className="mb-4 flex flex-wrap gap-2 text-[11px] font-medium text-brand-body">
          <span className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-surface px-2.5 py-1 shadow-sm">
            <Lock className="h-3 w-3 text-brand-accent" aria-hidden />
            Secure checkout
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-surface px-2.5 py-1 shadow-sm">
            <Zap className="h-3 w-3 text-brand-gold" aria-hidden />
            Instant confirmation
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-surface px-2.5 py-1 shadow-sm">
            <ShieldCheck className="h-3 w-3 text-availability-open" aria-hidden />
            Live availability
          </span>
        </div>
        <Card className="border-brand-border shadow-lg ring-1 ring-brand-heading/[0.04]">
          <CardHeader className="border-b border-brand-border pb-4">
            <CardTitle className="font-serif text-lg">Departure summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5 text-sm text-brand-body">
            <p className="font-medium text-brand-heading">{tourTitle}</p>
            <dl className="space-y-3 rounded-xl border border-brand-border bg-brand-accent-soft p-4">
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Selected date</dt>
                <dd className="text-right font-medium text-brand-heading">{date ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Pickup</dt>
                <dd className="text-right font-medium text-brand-heading">{pickupLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-muted">Guests</dt>
                <dd className="text-right font-medium text-brand-heading">
                  {adults + children + infants} total ({adults}A / {children}C / {infants}I)
                </dd>
              </div>
            </dl>
            <div className="rounded-xl border border-dashed border-brand-border bg-brand-surface-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Price summary</p>
              <p className="mt-2 text-sm leading-relaxed text-brand-body">
                Final pricing is calculated when you continue — locked from live rules at checkout and matching Stripe.
              </p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
