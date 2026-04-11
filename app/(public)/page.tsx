import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { TourCard } from "@/components/tours/tour-card";
import { listPublishedTours } from "@/lib/services/tours-public";

export default async function HomePage() {
  const featured = await listPublishedTours({ featured: true });
  const fallback = featured.length ? featured : await listPublishedTours({});

  return (
    <>
      <section className="border-b border-gray-200 bg-white pt-28 pb-24">
        <Container>
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-8">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Cairns &amp; Daintree</p>
              <h1 className="font-serif text-5xl font-medium leading-tight text-blue-900 md:text-6xl">
                Rainforest tours, quietly luxurious.
              </h1>
              <p className="max-w-xl text-lg text-gray-600">
                Small groups, curated pickups, and availability you can trust — built for guests who value calm,
                clarity, and the living forest.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="primary" size="lg">
                  <Link href="/tours">View tours</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/availability">Check availability</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-orange-500/10" />
              <div className="absolute inset-0 flex items-end p-8">
                <p className="max-w-sm text-sm text-gray-700">
                  Editorial pacing, generous guides, and logistics that feel effortless on the day.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-gray-900 md:text-4xl">Curated experiences</h2>
              <p className="mt-2 max-w-xl text-gray-600">
                A focused collection — not a marketplace. Each departure is capacity-safe and pickup-aware.
              </p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/tours">Browse all tours</Link>
            </Button>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {fallback.slice(0, 3).map((t) => (
              <TourCard
                key={t.id}
                title={t.title}
                slug={t.slug}
                shortDescription={t.shortDescription}
                durationText={t.durationText}
                groupSizeText={t.groupSizeText}
                priceFromText={t.priceFromText}
                heroImage={t.heroImage}
                isFeatured={t.isFeatured}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-gray-200 bg-white py-20">
        <Container className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-gray-900 md:text-4xl">Why travellers choose us</h2>
            <ul className="mt-8 space-y-4 text-gray-600">
              <li>Transparent availability with operator-grade safety checks.</li>
              <li>Pickup times and locations stored with your booking — no guesswork on the morning.</li>
              <li>Infants count toward capacity — transport and comfort stay honest.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8">
            <h3 className="text-lg font-semibold text-gray-900">FAQ</h3>
            <dl className="mt-6 space-y-6 text-sm text-gray-600">
              <div>
                <dt className="font-medium text-gray-900">When does booking close?</dt>
                <dd className="mt-1">Cutoffs respect departure pickup time in Australia/Brisbane — shown live in the calendar.</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900">Is my seat held while I pay?</dt>
                <dd className="mt-1">Yes. Pending checkout reserves seats until the hold expires.</dd>
              </div>
            </dl>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container className="flex flex-col items-start justify-between gap-8 rounded-2xl bg-blue-900 px-8 py-12 text-white md:flex-row md:items-center">
          <div>
            <h2 className="font-serif text-3xl font-semibold md:text-4xl">Ready for a calm rainforest day?</h2>
            <p className="mt-2 max-w-xl text-blue-100">Pick a date, choose your pickup, and checkout securely with Stripe.</p>
          </div>
          <Button asChild variant="secondary" size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
            <Link href="/booking">Start booking</Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
