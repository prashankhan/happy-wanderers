import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTourBySlug } from "@/lib/services/tours-public";

import { TourBookingSidebar } from "./tour-booking-sidebar";

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

export default async function TourDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getTourBySlug(slug);
  if (!data) notFound();

  const { tour, images, pickups } = data;
  const hero = images.find((i) => i.isHero) ?? images[0];
  const defaultPickup = pickups.find((p) => p.isDefault)?.id ?? pickups[0]?.id;

  return (
    <div className="border-b border-gray-200 bg-white pb-20 pt-12">
      <Container>
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-900">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/tours" className="hover:text-blue-900">
            Tours
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{tour.title}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="space-y-12">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                {tour.heroBadge ? (
                  <span className="inline-flex rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-white">
                    {tour.heroBadge}
                  </span>
                ) : null}
                <h1 className="font-serif text-4xl font-medium text-blue-900 md:text-5xl">{tour.title}</h1>
                <p className="text-lg text-gray-600">{tour.shortDescription}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>{tour.durationText}</span>
                  <span>{tour.groupSizeText}</span>
                  <span>{tour.locationRegion}</span>
                </div>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
                {hero ? (
                  <Image
                    src={hero.imageUrl}
                    alt={hero.altText ?? `${tour.title} hero`}
                    fill
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">Imagery soon</div>
                )}
              </div>
            </div>

            {images.length > 1 ? (
              <div>
                <h2 className="font-serif text-2xl font-semibold text-gray-900">Gallery</h2>
                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {images.slice(0, 8).map((img) => (
                    <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                      <Image
                        src={img.imageUrl}
                        alt={img.altText ?? tour.title}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 50vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <section className="prose prose-gray max-w-none">
              <h2 className="font-serif text-2xl font-semibold text-gray-900">Overview</h2>
              <p className="whitespace-pre-line text-gray-700">{tour.description}</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-gray-900">Pickups</h2>
              <ul className="mt-4 space-y-3 text-gray-700">
                {pickups.map((p) => (
                  <li key={p.id} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
                    <span className="font-medium text-gray-900">{p.name}</span>
                    <span className="text-gray-600"> — {p.pickupTimeLabel ?? p.pickupTime}</span>
                  </li>
                ))}
              </ul>
              {tour.pickupNotes ? <p className="mt-3 text-sm text-gray-600">{tour.pickupNotes}</p> : null}
            </section>

            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Inclusions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-inside list-disc text-sm text-gray-600">
                    {(tour.inclusions ?? []).map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Exclusions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-inside list-disc text-sm text-gray-600">
                    {(tour.exclusions ?? []).map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What to bring</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-inside list-disc text-sm text-gray-600">
                    {(tour.whatToBring ?? []).map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-gray-900">Availability</h2>
              <p className="mt-2 text-sm text-gray-600">
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
