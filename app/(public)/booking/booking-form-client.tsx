"use client";

import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";

import { PublicAvailabilityCalendar } from "@/components/calendar/public-availability-calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const inputClass =
  "mt-2 w-full rounded-sm border border-brand-border bg-brand-surface px-5 py-4 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10";

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
    <div className="grid gap-16 lg:grid-cols-[1fr_400px]">
      <form onSubmit={onSubmit} className="space-y-12">
        <Card className="shadow-md ring-1 ring-brand-heading/[0.03] rounded-sm">
          <CardHeader className="border-b border-brand-border px-8 py-6">
            <CardTitle className="font-serif text-2xl font-bold">Departure logistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted mb-3">Pickup location</label>
              <select
                className="w-full rounded-sm border border-brand-border bg-brand-surface px-5 py-4 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                value={departureId ?? ""}
                onChange={(e) => setDepartureId(e.target.value || undefined)}
              >
                {pickups.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.timeLabel}
                  </option>
                ))}
              </select>
            </div>
            <div className="border border-brand-border rounded-sm p-4 bg-white/50">
              <PublicAvailabilityCalendar
                tourId={tourId}
                departureLocationId={departureId}
                initialMonth={initialMonth}
                selectedDate={date}
                onSelectDate={setDate}
                variant="compact"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md ring-1 ring-brand-heading/[0.03] rounded-sm">
          <CardHeader className="border-b border-brand-border px-8 py-6">
            <CardTitle className="font-serif text-2xl font-bold italic">Guest composition</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-8 p-8 sm:grid-cols-3">
            <label>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">Adults</span>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
              />
            </label>
            <label>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">Children</span>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
              />
            </label>
            <label>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">Infants</span>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={infants}
                onChange={(e) => setInfants(Number(e.target.value))}
              />
            </label>
            <p className="sm:col-span-3 text-[10px] uppercase font-bold tracking-widest text-brand-primary">Infants count toward vehicle capacity norms.</p>
          </CardContent>
        </Card>

        <Card className="shadow-md ring-1 ring-brand-heading/[0.03] rounded-sm">
          <CardHeader className="border-b border-brand-border px-8 py-6">
            <CardTitle className="font-serif text-2xl font-bold">Contact details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-8 p-8 md:grid-cols-2">
            <label className="md:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">First name</span>
              <input required className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>
            <label className="md:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">Last name</span>
              <input required className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </label>
            <label className="md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">Email address</span>
              <input
                required
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">Primary phone</span>
              <input required className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">Special notes</span>
              <textarea className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
          </CardContent>
        </Card>

        {error ? <p className="text-sm font-bold text-red-600 bg-red-50 p-4 rounded-sm border border-red-200">{error}</p> : null}

        <div className="flex flex-wrap gap-6 pt-6">
          <Button type="submit" variant="primary" className="h-auto px-14 py-5 text-2xl font-bold tracking-tight rounded-sm" disabled={loading}>
            {loading ? "Redirecting…" : "Continue to payment"}
          </Button>
          <Button type="button" variant="secondary" className="h-auto px-10 py-5 text-xl font-bold tracking-tight rounded-sm border-brand-border" onClick={() => router.push("/tours")}>
            Back to tours
          </Button>
        </div>
      </form>

      <aside className="lg:sticky lg:top-36">
        <div className="mb-6 flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-widest text-brand-body">
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-brand-border bg-brand-surface px-3 py-1.5 shadow-sm">
            <Lock className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
            Secure
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-brand-border bg-brand-surface px-3 py-1.5 shadow-sm">
            <Zap className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
            Instant
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-brand-border bg-brand-surface px-3 py-1.5 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-availability-open" aria-hidden />
            Verified
          </span>
        </div>
        <Card className="border-brand-border shadow-xl ring-1 ring-brand-heading/[0.04] rounded-sm">
          <CardHeader className="border-b border-brand-border px-8 py-8">
            <CardTitle className="font-serif text-2xl font-bold italic">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <p className="text-xl font-bold tracking-tight text-brand-heading leading-tight">{tourTitle}</p>
            <dl className="space-y-4 rounded-sm border border-brand-border bg-brand-surface-soft p-6">
              <div className="flex flex-col gap-1">
                <dt className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Departure date</dt>
                <dd className="text-xl font-black text-brand-heading">{date ?? "—"}</dd>
              </div>
              <div className="flex flex-col gap-1 pt-4 border-t border-brand-border/40">
                <dt className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Pickup source</dt>
                <dd className="text-base font-bold text-brand-heading">{pickupLabel}</dd>
              </div>
              <div className="flex flex-col gap-1 pt-4 border-t border-brand-border/40">
                <dt className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Total parties</dt>
                <dd className="text-base font-bold text-brand-heading">
                  {adults + children + infants} Guests ({adults}A · {children}C · {infants}I)
                </dd>
              </div>
            </dl>
            <div className="rounded-sm border border-dashed border-brand-border bg-white/50 p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Billing logic</p>
              <p className="mt-3 text-sm leading-relaxed text-brand-body/70 font-medium">
                Regional pricing is calculated dynamically. Confirmed seats depend on the completion of the Stripe secure session.
              </p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
