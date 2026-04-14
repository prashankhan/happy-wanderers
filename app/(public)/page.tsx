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
import { DestinationShowcase } from "@/components/marketing/destination-showcase";
import { PhilosophySection } from "@/components/marketing/philosophy-section";
import { TestimonialSection } from "@/components/marketing/testimonial-section";
import { TrustStripe } from "@/components/marketing/trust-stripe";
import { CtaSection } from "@/components/marketing/cta-section";

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

  return (
    <>
      <section
        className="relative left-1/2 right-1/2 -mx-[50vw] flex min-h-dvh w-screen flex-col bg-gray-950"
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

      <DestinationShowcase imageSrc={heroPhotoSrc} />

      <PhilosophySection />

      <TestimonialSection />

      <TrustStripe />

      <CtaSection imageSrc={heroPhotoSrc} />
    </>
  );
}
