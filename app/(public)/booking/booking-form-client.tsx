"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicAvailabilityCalendar } from "@/components/calendar/public-availability-calendar";

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
  const month = useMemo(() => {
    if (initialDate) return initialDate.slice(0, 7);
    return new Date().toISOString().slice(0, 7);
  }, [initialDate]);

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
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <form onSubmit={onSubmit} className="space-y-10">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Date &amp; pickup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Pickup location</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
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
              month={month}
              selectedDate={date}
              onSelectDate={setDate}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Guests</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm">
              <span className="font-medium text-gray-700">Adults</span>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-gray-700">Children</span>
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-gray-700">Infants</span>
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={infants}
                onChange={(e) => setInfants(Number(e.target.value))}
              />
            </label>
            <p className="sm:col-span-3 text-xs text-gray-500">Infants count toward vehicle capacity.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Your details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="text-sm md:col-span-1">
              <span className="font-medium text-gray-700">First name</span>
              <input
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>
            <label className="text-sm md:col-span-1">
              <span className="font-medium text-gray-700">Last name</span>
              <input
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="font-medium text-gray-700">Email</span>
              <input
                required
                type="email"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="font-medium text-gray-700">Phone</span>
              <input
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="font-medium text-gray-700">Notes (optional)</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
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
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p className="font-medium text-gray-900">{tourTitle}</p>
            <p>Date: {date ?? "—"}</p>
            <p>
              Guests: {adults + children + infants} total ({adults}A / {children}C / {infants}I)
            </p>
            <p className="text-xs text-gray-500">
              Pricing is locked from live rules at checkout creation and matches what you pay in Stripe.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
