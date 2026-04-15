"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Leaf, MapPin, MinusCircle, Users } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";

interface TourDetailViewProps {
  tour: any;
  images: any[];
  pickups: any[];
  heroGallery: React.ReactNode;
  bookingSidebar: React.ReactNode;
}

export function TourDetailView({ tour, images, pickups, heroGallery, bookingSidebar }: TourDetailViewProps) {
  return (
    <div className="bg-white pb-32 lg:pb-24">

      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-brand-surface-soft border-b border-brand-border">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">

          {/* Gallery */}
          {heroGallery}

          {/* Title block */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 max-w-4xl space-y-5"
          >
            {tour.heroBadge && (
              <span className="inline-flex rounded-sm bg-brand-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                {tour.heroBadge}
              </span>
            )}
            <h1 className="font-serif text-3xl font-bold tracking-tight text-brand-heading sm:text-4xl md:text-5xl lg:text-6xl lg:leading-[1.1]">
              {tour.title}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-brand-body md:text-lg">
              {tour.shortDescription}
            </p>

            {/* Stat chips — inline in hero */}
            <div className="flex flex-wrap gap-3 pt-2">
              {tour.durationText && (
                <span className="inline-flex items-center gap-2 rounded-sm border border-brand-border bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-brand-muted shadow-sm">
                  <Clock className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
                  {tour.durationText}
                </span>
              )}
              {tour.groupSizeText && (
                <span className="inline-flex items-center gap-2 rounded-sm border border-brand-border bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-brand-muted shadow-sm">
                  <Users className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
                  {tour.groupSizeText}
                </span>
              )}
              {tour.locationRegion && (
                <span className="inline-flex items-center gap-2 rounded-sm border border-brand-border bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-brand-muted shadow-sm">
                  <MapPin className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
                  {tour.locationRegion}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <Container className="mt-16 md:mt-24">
        <div className="grid gap-16 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-20">
          <div className="space-y-14 md:space-y-20">

            {/* ─── 1. What's Included ──────────────────────────────── */}
            {(tour.inclusions ?? []).length > 0 && (
              <section>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-3">What's included</p>
                <h2 className="font-serif text-2xl font-bold tracking-tighter text-brand-heading md:text-4xl">
                  Everything covered.
                </h2>
                <ul className="mt-8 space-y-4">
                  {(tour.inclusions ?? []).map((x: string) => (
                    <li key={x} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-availability-open" aria-hidden />
                      <span className="text-base font-medium leading-relaxed text-brand-body">{x}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ─── 2. The Full Story ───────────────────────────────── */}
            {tour.description && (
              <section>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-3">About this experience</p>
                <h2 className="font-serif text-2xl font-bold tracking-tighter text-brand-heading md:text-4xl italic">
                  The full story.
                </h2>
                <div className="mt-8 whitespace-pre-line text-base leading-relaxed text-brand-body/90 md:text-lg md:leading-[1.8]">
                  {tour.description}
                </div>
              </section>
            )}

            {/* ─── 3. Fine Print (exclusions, de‑emphasized) ──────── */}
            {(tour.exclusions ?? []).length > 0 && (
              <section className="rounded-sm border border-brand-border/60 bg-brand-surface-soft/50 p-6 md:p-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-4">
                  Not included
                </p>
                <ul className="space-y-3">
                  {(tour.exclusions ?? []).map((x: string) => (
                    <li key={x} className="flex items-start gap-3">
                      <MinusCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-muted/50" aria-hidden />
                      <span className="text-sm leading-relaxed text-brand-body/60">{x}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ─── 4. Single CTA ───────────────────────────────────── */}
            <section className="rounded-sm bg-brand-heading p-8 md:p-12 text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-3">Ready to go?</p>
              <h2 className="font-serif text-2xl font-bold tracking-tighter text-white md:text-4xl">
                Check live availability.
              </h2>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-white/60 md:text-lg">
                Seating is limited — select a departure date on the calendar and confirm your spot today.
              </p>
              <Link
                href={`/availability?tour_id=${tour.id}`}
                className="mt-8 inline-flex items-center justify-center rounded-sm bg-brand-primary px-8 py-4 text-base font-bold tracking-tight text-white transition-all hover:bg-brand-primary-hover hover:shadow-lg active:scale-[0.98] md:text-lg"
              >
                Open availability calendar
              </Link>
            </section>

          </div>

          {/* Booking Sidebar */}
          {bookingSidebar}
        </div>
      </Container>

      {/* ─── Mobile Sticky Bar ───────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-border bg-white/95 backdrop-blur-sm px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            {tour.priceFromText && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Starting from</p>
                <p className="text-xl font-black tracking-tighter text-brand-heading leading-none">{tour.priceFromText}</p>
              </>
            )}
          </div>
          <Link
            href={`/availability?tour_id=${tour.id}`}
            className="inline-flex shrink-0 items-center justify-center rounded-sm bg-brand-primary px-6 py-3 text-base font-bold tracking-tight text-white transition-all hover:bg-brand-primary-hover active:scale-[0.98]"
          >
            Check availability
          </Link>
        </div>
      </div>
    </div>
  );
}
