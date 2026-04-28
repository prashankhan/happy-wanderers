import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTourBySlug } from "@/lib/services/tours-public";
import { TourDetailView } from "@/components/tours/tour-detail-view";
import { TourHeroGallery } from "./tour-hero-gallery";
import { TourBookingSidebar } from "./tour-booking-sidebar";

export const dynamic = "force-dynamic";

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
  const defaultPickup = pickups.find((p) => p.isDefault)?.id ?? pickups[0]?.id;

  return (
    <TourDetailView 
      tour={tour}
      heroGallery={<TourHeroGallery images={images.map(i => ({ id: i.id, imageUrl: i.imageUrl, altText: i.altText, isHero: i.isHero }))} tourTitle={tour.title} />}
      bookingSidebar={
        <TourBookingSidebar
          tourId={tour.id}
          priceFromText={tour.priceFromText}
          priceContextText={tour.priceContextText}
          defaultPickupId={defaultPickup}
          pickups={pickups.map((p) => ({ id: p.id, name: p.name, timeLabel: p.pickupTimeLabel ?? p.pickupTime }))}
          cancellationPolicy={tour.cancellationPolicy}
        />
      }
    />
  );
}
