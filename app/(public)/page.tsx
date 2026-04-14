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

import { HeroContent } from "@/components/marketing/hero-content";
import { CredibilityBar } from "@/components/marketing/credibility-bar";
import { FeaturedTours } from "@/components/marketing/featured-tours";

function resolveHeroPhotoSrc(heroImage: string | null | undefined): string {
  const trimmed = typeof heroImage === "string" ? heroImage.trim() : "";
  if (!trimmed) return STATIC_HERO_FALLBACK;
  if (trimmed.includes(DEAD_HERO_IMAGE_SUBSTR)) return STATIC_HERO_FALLBACK;
  return trimmed;
}



export default async function HomePage() {
  const featured = await listPublishedTours({ featured: true });
  const fallback = featured.length ? featured : await listPublishedTours({});
  const heroImage = fallback[0]?.heroImage ?? null;
  const heroPhotoSrc = resolveHeroPhotoSrc(heroImage);

  const toursForGrid = fallback.slice(0, 3);

  const trustChips = ["Secure booking", "Local operators", "Instant confirmation", "Real-time availability"];

  return (
    <>
      <section
        className={`relative left-1/2 right-1/2 -mx-[50vw] flex min-h-dvh w-screen flex-col bg-gray-950 ${publicHeroUnderFixedNavClass}`}
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
        <Container className="relative z-10 flex min-h-0 flex-1 flex-col justify-start py-16 max-md:pt-36 max-md:pb-20 md:justify-center md:py-28 lg:py-32">
          <HeroContent />
        </Container>
      </section>

      <CredibilityBar />

      <FeaturedTours
        tours={toursForGrid.map((t) => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          shortDescription: t.shortDescription,
          durationText: t.durationText || "",
          groupSizeText: t.groupSizeText || "",
          priceFromText: t.priceFromText,
          locationRegion: t.locationRegion,
          heroImage: t.heroImage,
          isFeatured: t.isFeatured,
        }))}
      />

      <section className="border-y border-brand-border bg-gradient-to-b from-brand-surface via-brand-surface-soft to-brand-surface py-24 md:py-32">
        <Container className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="relative aspect-[4/5] max-h-[560px] overflow-hidden rounded-3xl bg-brand-border shadow-2xl ring-1 ring-brand-heading/5">
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
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-accent-soft to-brand-surface-warm text-sm text-brand-muted">
                Region imagery
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/75 via-transparent to-transparent" />
            <p className="absolute bottom-8 left-8 right-8 text-sm leading-relaxed text-white/95 md:text-base">
              Where two World Heritage areas breathe together — reef air on the breeze and ancient canopy overhead.
            </p>
          </div>
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">Destination</p>
            <h2 className="font-serif text-3xl font-semibold text-brand-heading md:text-4xl lg:text-5xl">
              North Queensland, told through the forest floor
            </h2>
            <div className="max-w-prose space-y-5 text-base leading-[1.75] text-brand-body md:text-lg">
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
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-2 text-xs font-medium text-brand-body shadow-sm">
                <Leaf className="h-4 w-4 text-availability-open" aria-hidden />
                Low-impact routing
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-2 text-xs font-medium text-brand-body shadow-sm">
                <BadgeCheck className="h-4 w-4 text-brand-gold" aria-hidden />
                Operator-grade safety
              </span>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent-soft text-brand-accent">
              <Compass className="h-7 w-7" aria-hidden />
            </div>
            <h2 className="mt-8 font-serif text-3xl font-semibold text-brand-heading md:text-4xl lg:text-5xl">
              Guide-led, field-quiet luxury
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-brand-body md:text-xl">
              Luxury here is not gold trim on a coach — it is the confidence of a senior naturalist reading the day,
              adjusting pace, and protecting silence when the forest offers it. We lead small groups so conversation
              stays intimate and the trail stays respectful.
            </p>
            <p className="mt-6 text-base leading-relaxed text-brand-body">
              Expect clear briefings, generous margins in the schedule, and logistics that feel invisible — the same
              standards we would want on our own family departures.
            </p>
          </div>
        </Container>
      </section>

      <TestimonialStrip />

      <section className="border-y border-brand-border bg-brand-accent py-14 md:py-16">
        <Container>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-sm font-medium text-white/95 md:justify-between">
            {trustChips.map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 shrink-0 text-availability-open" aria-hidden />
                {t}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container className="flex flex-col items-start justify-between gap-12 rounded-3xl bg-gradient-to-br from-brand-accent via-brand-accent to-brand-heading px-8 py-16 text-white shadow-2xl ring-1 ring-white/10 md:flex-row md:items-center md:px-14 lg:py-20">
          <div className="max-w-xl space-y-5">
            <h2 className="font-serif text-3xl font-semibold md:text-4xl">Reserve your rainforest day</h2>
            <p className="text-lg leading-relaxed text-white/90">
              Choose a scheduled departure or speak with us about a private charter — then checkout securely with Stripe.
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:w-auto">
            <Button asChild variant="primary" size="lg">
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
