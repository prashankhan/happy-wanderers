import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Compass,
  Leaf,
  MapPin,
  Shield,
  Sparkles,
  Sunrise,
  Users,
} from "lucide-react";

import { TestimonialStrip } from "@/components/marketing/testimonials";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TourCard } from "@/components/tours/tour-card";
import { publicHeroUnderFixedNavClass } from "@/lib/layout/public-nav-offset";
import { listPublishedTours } from "@/lib/services/tours-public";

/** When no published tour has a hero image yet (`next.config` allows this host). */
const STATIC_HERO_FALLBACK =
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80";

/** Unsplash removed this asset; DB seeds sometimes still reference it → Next Image 404. */
const DEAD_HERO_IMAGE_SUBSTR = "1511497584788";

function resolveHeroPhotoSrc(heroImage: string | null | undefined): string {
  const trimmed = typeof heroImage === "string" ? heroImage.trim() : "";
  if (!trimmed) return STATIC_HERO_FALLBACK;
  if (trimmed.includes(DEAD_HERO_IMAGE_SUBSTR)) return STATIC_HERO_FALLBACK;
  return trimmed;
}

/** Hero primary CTA: accent orange outline (overrides `Button` secondary defaults). */
const heroCtaOrangeOutlineClassName =
  "h-14 rounded-sm border-2 border-orange-500 bg-orange-500/5 px-8 font-sans text-base font-medium uppercase tracking-widest text-white shadow-sm transition-[background-color,border-color,transform,box-shadow] duration-200 ease-out hover:border-orange-400 hover:bg-orange-500/15 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 motion-safe:active:scale-[0.98] lg:h-16 lg:px-12 lg:text-lg";

/** Hero secondary CTA: white outline, same scale/type as orange button. */
const heroCtaWhiteOutlineClassName =
  "h-14 rounded-sm border-2 border-white/80 bg-white/5 px-8 font-sans text-base font-medium uppercase tracking-widest text-white shadow-sm transition-[background-color,border-color,transform,box-shadow] duration-200 ease-out hover:border-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 motion-safe:active:scale-[0.98] lg:h-16 lg:px-12 lg:text-lg";

function FeaturedSlotPlaceholder({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden border-dashed border-gray-200 bg-gray-50/50 p-0 shadow-sm transition duration-300 hover:border-gray-300 hover:shadow-md">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-blue-900/5 to-orange-500/10">
        <Sparkles className="h-12 w-12 text-blue-900/20" aria-hidden />
      </div>
      <CardContent className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-xl font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{body}</p>
        <Button asChild variant="secondary" className="mt-6 w-full sm:w-auto">
          <Link href={href}>Learn more</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function HomePage() {
  const featured = await listPublishedTours({ featured: true });
  const fallback = featured.length ? featured : await listPublishedTours({});
  const heroImage = fallback[0]?.heroImage ?? null;
  const heroPhotoSrc = resolveHeroPhotoSrc(heroImage);

  const toursForGrid = fallback.slice(0, 3);
  const fillerCount = Math.max(0, 3 - toursForGrid.length);
  const fillers = [
    {
      title: "Private rainforest charters",
      body: "Exclusive vehicle, flexible timing, and itineraries shaped around your pace — ideal for families and small groups.",
      href: "/private-tours",
    },
    {
      title: "Bespoke departures",
      body: "Tell us what you are celebrating or studying — we will advise what is possible within park access and season.",
      href: "/contact",
    },
  ].slice(0, fillerCount);

  const credibility = [
    { label: "Local expert guides", icon: MapPin },
    { label: "Small-group experiences", icon: Users },
    { label: "Flexible booking policies", icon: Shield },
    { label: "Real-time availability", icon: Sunrise },
  ];

  const trustChips = ["Secure booking", "Local operators", "Instant confirmation", "Real-time availability"];

  return (
    <>
      <section
        className={`relative left-1/2 right-1/2 -mx-[50vw] flex min-h-dvh w-screen flex-col border-b border-gray-200/80 bg-gray-950 ${publicHeroUnderFixedNavClass}`}
      >
        <div className="absolute inset-0 min-h-full">
          <Image
            src={heroPhotoSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.58]"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/88 to-blue-950/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/40 via-transparent to-gray-950/40" />
        </div>
        <Container className="relative z-10 flex flex-1 flex-col justify-center py-20 md:py-28 lg:py-32">
          <div className="mx-auto max-w-5xl space-y-10 text-center">
            <p className="text-sm font-light uppercase tracking-[0.2em] text-blue-200/90 md:text-base">
              Your luxury far north experience
            </p>
            <h1 className="mx-auto max-w-5xl font-serif text-4xl font-normal tracking-tight leading-[1.08] text-white md:text-5xl md:leading-[1.06] lg:text-6xl xl:text-7xl">
              Exclusive Luxury Experiences &amp; Tours in Cairns &amp; Tropical North Queensland
            </h1>
            <p className="mx-auto max-w-5xl text-base font-light leading-relaxed text-blue-100/95 md:text-xl md:leading-relaxed">
              At Cairns Luxury Guides, we specialise in crafting unforgettable, one-of-a-kind experiences in Tropical
              North Queensland. Our commitment to luxury goes beyond standard tours, offering exclusive, curated
              adventures that connect you to the breathtaking beauty and hidden gems of this stunning region.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Button asChild variant="secondary" size="lg" className={heroCtaOrangeOutlineClassName}>
                <Link href="/tours">View tours</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className={heroCtaWhiteOutlineClassName}>
                <Link href="/availability">Check availability</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-gray-200 bg-white py-12 md:py-14">
        <Container>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-8 md:justify-between lg:gap-x-12">
            {credibility.map(({ label, icon: Icon }) => (
              <div key={label} className="flex max-w-[220px] items-center gap-3 text-sm font-medium text-gray-800">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-900/5 text-blue-900">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container>
          <div className="mb-16 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Featured</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
              Signature departures
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-600 md:text-xl">
              Each experience is paced for the forest — with duration, region, and transparent pricing context before
              you open a tour. Three curated cards below; when new tours publish, they appear here automatically.
            </p>
          </div>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {toursForGrid.map((t) => (
              <TourCard
                key={t.id}
                title={t.title}
                slug={t.slug}
                shortDescription={t.shortDescription}
                durationText={t.durationText}
                groupSizeText={t.groupSizeText}
                priceFromText={t.priceFromText}
                locationRegion={t.locationRegion}
                heroImage={t.heroImage}
                isFeatured={t.isFeatured}
              />
            ))}
            {fillers.map((f, idx) => (
              <FeaturedSlotPlaceholder key={`filler-${idx}`} title={f.title} body={f.body} href={f.href} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="ghost">
              <Link href="/tours">Browse all scheduled tours</Link>
            </Button>
          </div>
        </Container>
      </section>

      <section className="border-y border-gray-200 bg-gradient-to-b from-white via-gray-50/50 to-white py-24 md:py-32">
        <Container className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="relative aspect-[4/5] max-h-[560px] overflow-hidden rounded-3xl bg-gray-200 shadow-2xl ring-1 ring-black/5">
            {heroImage ? (
              <Image
                src={resolveHeroPhotoSrc(heroImage)}
                alt="North Queensland rainforest"
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-900/20 to-orange-500/10 text-sm text-gray-500">
                Region imagery
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/75 via-transparent to-transparent" />
            <p className="absolute bottom-8 left-8 right-8 text-sm leading-relaxed text-white/95 md:text-base">
              Where two World Heritage areas breathe together — reef air on the breeze and ancient canopy overhead.
            </p>
          </div>
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Destination</p>
            <h2 className="font-serif text-3xl font-semibold text-gray-900 md:text-4xl lg:text-5xl">
              North Queensland, told through the forest floor
            </h2>
            <div className="max-w-prose space-y-5 text-base leading-[1.75] text-gray-600 md:text-lg">
              <p>
                The Wet Tropics is not a theme park — it is a climate archive written in leaves, roots, and seasonal
                sound. We design departures around light angles, creek behaviour, and the rhythms of wildlife, so your
                day feels authored by the landscape — not rushed through it.
              </p>
              <p>
                From Cairns pickups to Daintree access corridors, our guides carry deep place knowledge and the calm
                authority guests expect from a luxury field operation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-sm">
                <Leaf className="h-4 w-4 text-emerald-600" aria-hidden />
                Low-impact routing
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-sm">
                <BadgeCheck className="h-4 w-4 text-blue-900" aria-hidden />
                Operator-grade safety
              </span>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-900/5 text-blue-900">
              <Compass className="h-7 w-7" aria-hidden />
            </div>
            <h2 className="mt-8 font-serif text-3xl font-semibold text-gray-900 md:text-4xl lg:text-5xl">
              Guide-led, field-quiet luxury
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600 md:text-xl">
              Luxury here is not gold trim on a coach — it is the confidence of a senior naturalist reading the day,
              adjusting pace, and protecting silence when the forest offers it. We lead small groups so conversation
              stays intimate and the trail stays respectful.
            </p>
            <p className="mt-6 text-base leading-relaxed text-gray-600">
              Expect clear briefings, generous margins in the schedule, and logistics that feel invisible — the same
              standards we would want on our own family departures.
            </p>
          </div>
        </Container>
      </section>

      <TestimonialStrip />

      <section className="border-y border-gray-200 bg-blue-950 py-14 md:py-16">
        <Container>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-sm font-medium text-blue-100/95 md:justify-between">
            {trustChips.map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
                {t}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container className="flex flex-col items-start justify-between gap-12 rounded-3xl bg-gradient-to-br from-blue-900 via-blue-900 to-gray-900 px-8 py-16 text-white shadow-2xl ring-1 ring-white/10 md:flex-row md:items-center md:px-14 lg:py-20">
          <div className="max-w-xl space-y-5">
            <h2 className="font-serif text-3xl font-semibold md:text-4xl">Reserve your rainforest day</h2>
            <p className="text-lg leading-relaxed text-blue-100/95">
              Choose a scheduled departure or speak with us about a private charter — then checkout securely with Stripe.
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:w-auto">
            <Button asChild variant="secondary" size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
              <Link href="/booking">Book a tour</Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/private-tours">Private tours</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
