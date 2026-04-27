import { Container } from "@/components/layout/container";
import { listPublishedTours } from "@/lib/services/tours-public";
import {
  HOME_MARKETING_CTA_PATH,
  HOME_MARKETING_DESTINATION_SHOWCASE_PATH,
} from "@/lib/ui/home-marketing";

import { HomeHeroBackground } from "@/components/marketing/home-hero-background";
import { HeroContent } from "@/components/marketing/hero-content";
import { HomeIntroductionSection } from "@/components/marketing/home-introduction-section";
import { CredibilityBar } from "@/components/marketing/credibility-bar";
import { FeaturedTours } from "@/components/marketing/featured-tours";
import { DestinationShowcase } from "@/components/marketing/destination-showcase";
import { PhilosophySection } from "@/components/marketing/philosophy-section";
import { TestimonialSection } from "@/components/marketing/testimonial-section";
import { TrustStripe } from "@/components/marketing/trust-stripe";
import { CtaSection } from "@/components/marketing/cta-section";

export default async function HomePage() {
  const featured = await listPublishedTours({ featured: true });
  const fallback = featured.length ? featured : await listPublishedTours({});
  const toursForGrid = fallback.slice(0, 3);

  return (
    <>
      <section
        className="relative flex min-h-dvh w-full flex-col overflow-x-clip bg-gray-950"
      >
        <div className="absolute inset-0 min-h-full">
          <HomeHeroBackground />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/88 to-blue-950/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/40 via-transparent to-gray-950/40" />
        </div>
        <Container className="relative z-10 flex min-h-0 flex-1 flex-col justify-start py-16 max-md:pt-28 max-md:pb-20 md:justify-center md:py-28 lg:py-32">
          <HeroContent />
        </Container>
      </section>

      <CredibilityBar />

      <HomeIntroductionSection />

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

      <DestinationShowcase imageSrc={HOME_MARKETING_DESTINATION_SHOWCASE_PATH} />

      <PhilosophySection />

      <TestimonialSection />

      <TrustStripe />

      <CtaSection imageSrc={HOME_MARKETING_CTA_PATH} />
    </>
  );
}
