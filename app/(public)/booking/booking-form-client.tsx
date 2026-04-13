"use client";

import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";

import { PublicAvailabilityCalendar } from "@/components/calendar/public-availability-calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Card className="shadow-md ring-1 ring-gray-900/[0.03]">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="font-serif text-xl">Date &amp; pickup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <label className="block text-sm font-medium text-gray-800">Pickup location</label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-900/15"
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

        <Card className="shadow-md ring-1 ring-gray-900/[0.03]">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="font-serif text-xl">Guests</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
            <label className="text-sm">
              <span className="font-medium text-gray-700">Adults</span>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-gray-700">Children</span>
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm"
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-gray-700">Infants</span>
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm"
                value={infants}
                onChange={(e) => setInfants(Number(e.target.value))}
              />
            </label>
            <p className="sm:col-span-3 text-xs text-gray-500">Infants count toward vehicle capacity.</p>
          </CardContent>
        </Card>

        <Card className="shadow-md ring-1 ring-gray-900/[0.03]">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="font-serif text-xl">Your details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            <label className="text-sm md:col-span-1">
              <span className="font-medium text-gray-700">First name</span>
              <input
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>
            <label className="text-sm md:col-span-1">
              <span className="font-medium text-gray-700">Last name</span>
              <input
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="font-medium text-gray-700">Email</span>
              <input
                required
                type="email"
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="font-medium text-gray-700">Phone</span>
              <input
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="font-medium text-gray-700">Notes (optional)</span>
              <textarea
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
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
        <div className="mb-4 flex flex-wrap gap-2 text-[11px] font-medium text-gray-600">
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 shadow-sm">
            <Lock className="h-3 w-3 text-blue-900" aria-hidden />
            Secure checkout
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 shadow-sm">
            <Zap className="h-3 w-3 text-amber-600" aria-hidden />
            Instant confirmation
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 shadow-sm">
            <ShieldCheck className="h-3 w-3 text-emerald-700" aria-hidden />
            Live availability
          </span>
        </div>
        <Card className="border-gray-100 shadow-lg ring-1 ring-gray-900/[0.04]">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="font-serif text-lg">Departure summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5 text-sm text-gray-600">
            <p className="font-medium text-gray-900">{tourTitle}</p>
            <dl className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/90 p-4">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Selected date</dt>
                <dd className="text-right font-medium text-gray-900">{date ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Pickup</dt>
                <dd className="text-right font-medium text-gray-900">{pickupLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Guests</dt>
                <dd className="text-right font-medium text-gray-900">
                  {adults + children + infants} total ({adults}A / {children}C / {infants}I)
                </dd>
              </div>
            </dl>
            <div className="rounded-xl border border-dashed border-gray-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Price summary</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Final pricing is calculated when you continue — locked from live rules at checkout and matching Stripe.
              </p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
