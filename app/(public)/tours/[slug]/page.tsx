import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarRange, Leaf, MapPin, Sparkles, Sun, Users } from "lucide-react";

import { TestimonialStrip } from "@/components/marketing/testimonials";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { publicHeroUnderFixedNavClass } from "@/lib/layout/public-nav-offset";
import { getTourBySlug } from "@/lib/services/tours-public";

import { TourBookingSidebar } from "./tour-booking-sidebar";
import { TourHeroGallery } from "./tour-hero-gallery";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTourBySlug(slug);
  if (!data) return { title: "Tour" };
  const t = data.tour;
  const ogImages = data.images.filter((i) => i.isHero).map((i) => ({ url: i.imageUrl }));
  return {
    title: t.seoTitle ?? t.title,
    description: t.seoDescription ?? t.shortDescription,
    openGraph: {
      title: t.title,
      description: t.shortDescription,
      images: ogImages.length ? ogImages : undefined,
    },
  };
}

function descriptionTimeline(description: string): string[] {
  const parts = description
    .split(/\n\s*\n|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts.slice(0, 6);
  return [
    "Reserve your seats online with live availability and transparent cutoffs.",
    "Receive your confirmation with pickup time and meeting details stored for the day of travel.",
    "Join your guide for a paced rainforest experience — small groups, clear logistics.",
  ];
}

export default async function TourDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getTourBySlug(slug);
  if (!data) notFound();

  const { tour, images, pickups } = data;
  const defaultPickup = pickups.find((p) => p.isDefault)?.id ?? pickups[0]?.id;
  const galleryImages = images.map((i) => ({
    id: i.id,
    imageUrl: i.imageUrl,
    altText: i.altText,
    isHero: i.isHero,
  }));
  const timelineItems = descriptionTimeline(tour.description);

  const highlightCards = [
    {
      icon: Sun,
      title: tour.durationText,
      body: "Thoughtfully paced departures — no rushed mornings.",
    },
    {
      icon: Users,
      title: tour.groupSizeText,
      body: "Intentionally small groups for comfort and access.",
    },
    {
      icon: MapPin,
      title: tour.locationRegion,
      body: "Curated pickups and regional expertise on every departure.",
    },
  ];

  return (
    <div className="border-b border-gray-200 bg-white pb-24">
      <div
        className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-gray-950 ${publicHeroUnderFixedNavClass}`}
      >
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
          <nav className="mb-8 text-sm text-blue-100/90">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <span className="mx-2 opacity-60">/</span>
            <Link href="/tours" className="transition hover:text-white">
              Tours
            </Link>
            <span className="mx-2 opacity-60">/</span>
            <span className="text-white">{tour.title}</span>
          </nav>
          {galleryImages.length ? (
            <TourHeroGallery images={galleryImages} tourTitle={tour.title} />
          ) : (
            <div className="flex min-h-[280px] items-center justify-center rounded-3xl bg-gray-800 text-sm text-gray-400">
              Imagery soon
            </div>
          )}
          <div className="mt-10 max-w-3xl space-y-4">
            {tour.heroBadge ? (
              <span className="inline-flex rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
                {tour.heroBadge}
              </span>
            ) : null}
            <h1 className="font-serif text-4xl font-medium leading-tight text-white md:text-5xl lg:text-6xl">
              {tour.title}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-blue-100/95">{tour.shortDescription}</p>
          </div>
        </div>
      </div>

      <Container className="mt-16 md:mt-20">
        <div className="grid gap-16 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-20">
          <div className="space-y-20 md:space-y-28">
            <section>
              <h2 className="font-serif text-2xl font-semibold text-gray-900 md:text-3xl">Tour highlights</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                What sets this experience apart — the details guests remember long after the trail.
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {highlightCards.map(({ icon: Icon, title, body }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-gray-900/[0.04] transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-900/5 text-blue-900">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="mt-4 font-serif text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-gray-900 md:text-3xl">
                <CalendarRange className="h-7 w-7 text-blue-900/80" aria-hidden />
                Your day, step by step
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                A clear rhythm from booking to trail — tailored to how we run departures in the Wet Tropics.
              </p>
              <ol className="relative mt-10 space-y-0 border-l border-blue-900/15 pl-8">
                {timelineItems.map((text, i) => (
                  <li key={i} className="relative pb-10 last:pb-0">
                    <span className="absolute -left-[39px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-blue-900 text-[10px] font-bold text-white shadow">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-gray-700 md:text-base">{text}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="max-w-none space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-gray-900 md:text-3xl">Overview</h2>
              <p className="whitespace-pre-line text-base leading-relaxed text-gray-700">{tour.description}</p>
            </section>

            <section>
              <Card className="border-gray-100 shadow-md ring-1 ring-gray-900/[0.03]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MapPin className="h-5 w-5 text-blue-900" aria-hidden />
                    Pickup locations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-3">
                    {pickups.map((p) => (
                      <li
                        key={p.id}
                        className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="font-medium text-gray-900">{p.name}</span>
                        <span className="text-gray-600">{p.pickupTimeLabel ?? p.pickupTime}</span>
                      </li>
                    ))}
                  </ul>
                  {tour.pickupNotes ? <p className="text-sm leading-relaxed text-gray-600">{tour.pickupNotes}</p> : null}
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-gray-900 md:text-3xl">
                <Sparkles className="h-7 w-7 text-blue-900/80" aria-hidden />
                Inclusions & exclusions
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
                Side-by-side comparison — what we provide on tour versus what to plan for independently.
              </p>
              <div className="mt-10 grid gap-8 lg:grid-cols-2">
                <Card className="border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Leaf className="h-5 w-5 text-emerald-700" aria-hidden />
                      Inclusions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm leading-relaxed text-gray-700">
                      {(tour.inclusions ?? []).map((x) => (
                        <li key={x} className="flex gap-2">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Exclusions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm leading-relaxed text-gray-700">
                      {(tour.exclusions ?? []).map((x) => (
                        <li key={x} className="flex gap-2">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-400" aria-hidden />
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <Card className="mt-8 border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">What to bring</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {(tour.whatToBring ?? []).map((x) => (
                      <li key={x} className="text-sm text-gray-700">
                        · {x}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>

            <TestimonialStrip
              variant="compact"
              heading="Guest impressions"
              intro="Verified quotes for this departure style will appear here. Ask us for recent field notes in the meantime."
              className="border-t border-gray-100 pt-16 md:pt-20"
            />

            <section className="rounded-2xl border border-gray-100 bg-gray-50/80 p-8 md:p-10">
              <h2 className="font-serif text-2xl font-semibold text-gray-900">Availability</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                Use the booking panel to choose a date — cutoffs and remaining seats update in real time.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="primary">
                  <Link href={`/availability?tour_id=${tour.id}`}>Open full calendar</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={`/booking?tour_id=${tour.id}`}>Book this tour</Link>
                </Button>
              </div>
            </section>
          </div>

          <TourBookingSidebar
            tourId={tour.id}
            title={tour.title}
            priceFromText={tour.priceFromText}
            defaultPickupId={defaultPickup}
            pickups={pickups.map((p) => ({ id: p.id, name: p.name, timeLabel: p.pickupTimeLabel ?? p.pickupTime }))}
          />
        </div>
      </Container>
    </div>
  );
}
