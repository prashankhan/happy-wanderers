"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, MapPin, Users } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";
import { cn } from "@/lib/utils/cn";

interface TourDetailViewProps {
  tour: any;
  heroGallery: React.ReactNode;
  bookingSidebar: React.ReactNode;
}

export function TourDetailView({ tour, heroGallery, bookingSidebar }: TourDetailViewProps) {
  return (
    <div className="bg-white pb-32 lg:pb-24">

      {/* ─── Hero Gallery Only ─────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {heroGallery}
      </div>

      {/* ─── Two-Column Layout ────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-16 xl:gap-20">

          {/* ─── Left Column: Tour Content ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12 md:space-y-16"
          >
            {/* Title Block */}
            <div className="space-y-5">
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

              {/* Stat Chips */}
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
            </div>

            {/* ─── 1. The Full Story ───────────────────────────── */}
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

            {/* ─── 2. Included / Not Included Grid ─────────────── */}
            <div className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* What's Included */}
                {(tour.inclusions ?? []).length > 0 && (
                  <section className="rounded-sm border border-brand-border/60 bg-brand-surface-soft/50 p-6 md:p-8">
                    <p className="text-base font-bold uppercase tracking-normal text-green-600 mb-6">
                      What's included
                    </p>
                    <ul className="space-y-3">
                      {(tour.inclusions ?? []).map((x: string) => (
                        <li key={x} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" aria-hidden />
                          <span className="text-base leading-relaxed text-brand-body">{x}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Not Included */}
                {(tour.exclusions ?? []).length > 0 && (
                  <section className="rounded-sm border border-brand-border/60 bg-brand-surface-soft/50 p-6 md:p-8">
                    <p className="text-base font-bold uppercase tracking-normal text-brand-muted mb-6">
                      Not included
                    </p>
                    <ul className="space-y-3">
                      {(tour.exclusions ?? []).map((x: string) => (
                        <li key={x} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-muted/40" aria-hidden />
                          <span className="text-base leading-relaxed text-brand-body/60">{x}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              {/* What to Bring */}
              {(tour.whatToBring ?? []).length > 0 && (
                <section className="rounded-sm border border-brand-border/60 bg-brand-surface-soft/50 p-6 md:p-8">
                  <p className="text-base font-bold uppercase tracking-normal text-brand-primary mb-6">
                    What to bring
                  </p>
                  <ul className="space-y-3">
                    {(tour.whatToBring ?? []).map((x: string) => (
                      <li key={x} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" aria-hidden />
                        <span className="text-base leading-relaxed text-brand-body">{x}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </motion.div>

          {/* ─── Right Column: Booking Sidebar ──────────────────── */}
          <div className="lg:sticky lg:top-40">
            {bookingSidebar}
          </div>
        </div>
      </div>

      {/* ─── Mobile Sticky Bar ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-border bg-white/95 backdrop-blur-sm px-4 py-3 lg:hidden">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div>
            {tour.priceFromText && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Starting from</p>
                <p className="text-xl font-black tracking-tighter text-brand-heading leading-none">
                  {tour.priceFromText.replace(/^(From\s*|from\s*)/i, "")}
                </p>
              </>
            )}
          </div>
          <Button asChild variant="primary" className={cn("shrink-0", primaryTourCtaClassName)}>
            <Link href={`/availability?tour_id=${tour.id}`}>Check availability</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
