"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Users } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { publicRevealEase } from "@/lib/motion/public-reveal";
import { hasStructuredItinerary, parseTourItineraryDays } from "@/lib/types/tour-itinerary";

interface TourDetailViewProps {
  tour: any;
  heroGallery: React.ReactNode;
  bookingSidebar: React.ReactNode;
}

export function TourDetailView({ tour, heroGallery, bookingSidebar }: TourDetailViewProps) {
  return (
    <div className="bg-white pb-24">

      {/* ─── Hero Gallery Only ─────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        {heroGallery}
      </div>

      {/* ─── Two-Column Layout ────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:pt-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-16 xl:gap-20">

          {/* ─── Left Column: Tour Content ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: publicRevealEase }}
            className="space-y-10 md:space-y-14"
          >
            {/* Title Block */}
            <div className="space-y-4">
              {tour.heroBadge && (
                <span className="inline-flex rounded-sm bg-brand-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  {tour.heroBadge}
                </span>
              )}
              <h1 className="font-serif text-3xl font-bold tracking-tight text-brand-heading sm:text-4xl md:text-5xl lg:text-6xl lg:leading-[1.1]">
                {tour.title}
              </h1>
              <p className="max-w-[52ch] text-base leading-relaxed text-brand-body md:text-lg">
                {tour.shortDescription}
              </p>

              {/* Stat Chips */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                {tour.durationText && (
                  <span className="inline-flex items-center gap-2 rounded-sm border border-brand-border bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-heading">
                    <Clock className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
                    {tour.durationText}
                  </span>
                )}
                {tour.groupSizeText && (
                  <span className="inline-flex items-center gap-2 rounded-sm border border-brand-border/70 bg-brand-surface-soft/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-brand-muted">
                    <Users className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
                    {tour.groupSizeText}
                  </span>
                )}
                {tour.locationRegion && (
                  <span className="inline-flex items-center gap-2 rounded-sm border border-brand-border/70 bg-brand-surface-soft/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-brand-muted">
                    <MapPin className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
                    {tour.locationRegion}
                  </span>
                )}
              </div>
            </div>

            {/* ─── 1. The Full Story / structured multi-day itinerary ───────── */}
            {(() => {
              const itinerary = parseTourItineraryDays(tour.itineraryDays);
              const useStructured = hasStructuredItinerary(
                tour.isMultiDay,
                tour.durationDays,
                tour.itineraryDays
              );
              if (useStructured) {
                return (
                  <div className="space-y-12">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                      About this experience
                    </p>
                    {itinerary.map((day, idx) => (
                      <section
                        key={`${day.day_number}-${idx}`}
                        className="rounded-sm border border-brand-border/50 bg-white px-5 py-6 md:px-7 md:py-7"
                      >
                        <p className="inline-flex items-center rounded-sm border border-brand-border/60 bg-brand-surface-soft/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
                          Day {day.day_number}
                        </p>
                        {day.title ? (
                          <h2 className="mt-4 max-w-[30ch] font-serif text-2xl font-semibold tracking-tight text-brand-heading md:text-[2rem] md:leading-tight">
                            {day.title}
                          </h2>
                        ) : null}
                        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-brand-body">
                          <span className="inline-flex items-center gap-2 rounded-sm border border-brand-border/55 bg-white px-2.5 py-1 font-medium">
                            <MapPin className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
                            {day.pickup_location}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-sm border border-brand-border/55 bg-white px-2.5 py-1 font-medium">
                            <Clock className="h-3.5 w-3.5 text-brand-primary" aria-hidden />
                            {day.pickup_time}
                          </span>
                        </div>
                        {day.summary ? (
                          <div className="mt-5 max-w-[64ch] whitespace-pre-line text-base leading-[1.8] text-brand-body/90 md:text-lg">
                            {day.summary}
                          </div>
                        ) : null}
                      </section>
                    ))}
                  </div>
                );
              }
              if (!tour.description) return null;
              return (
                <section>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-3">
                    About this experience
                  </p>
                  <h2 className="font-serif text-2xl font-bold tracking-tighter text-brand-heading md:text-4xl italic">
                    The full story.
                  </h2>
                  <div className="mt-8 whitespace-pre-line text-base leading-relaxed text-brand-body/90 md:text-lg md:leading-[1.8]">
                    {tour.description}
                  </div>
                </section>
              );
            })()}

            {/* ─── 2. Included / Not Included Grid ─────────────── */}
            <div className="grid gap-6">
              {/* What's Included */}
              {(tour.inclusions ?? []).length > 0 && (
                <section className="rounded-sm border border-brand-border bg-brand-surface-soft/40 p-6 md:p-8">
                  <p className="inline-flex items-center rounded-sm border border-brand-border/60 bg-brand-surface-soft/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
                    Included
                  </p>
                  <h2 className="mt-4 max-w-[30ch] font-serif text-2xl font-semibold tracking-tight text-brand-heading md:text-[2rem] md:leading-tight">
                    What's included
                  </h2>
                  <ul className="mt-6 space-y-3.5">
                    {(tour.inclusions ?? []).map((x: string) => (
                      <li key={x} className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary/80" aria-hidden />
                        <span className="text-base leading-[1.8] text-brand-body/90 md:text-lg">{x}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Not Included */}
              {(tour.exclusions ?? []).length > 0 && (
                <section className="rounded-sm border border-brand-border bg-brand-surface-soft/25 p-6 md:p-8">
                  <p className="inline-flex items-center rounded-sm border border-brand-border/60 bg-brand-surface-soft/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
                    Exclusions
                  </p>
                  <h2 className="mt-4 max-w-[30ch] font-serif text-2xl font-semibold tracking-tight text-brand-heading md:text-[2rem] md:leading-tight">
                    Not included
                  </h2>
                  <ul className="mt-6 space-y-3.5">
                    {(tour.exclusions ?? []).map((x: string) => (
                      <li key={x} className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-muted/50" aria-hidden />
                        <span className="text-base leading-[1.8] text-brand-body/90 md:text-lg">{x}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 border-t border-brand-border/50 pt-4 text-sm leading-relaxed text-brand-muted">
                    Optional add-ons may be available on request before travel.
                  </p>
                </section>
              )}

              {/* What to Bring */}
              {(tour.whatToBring ?? []).length > 0 && (
                <section className="rounded-sm border border-brand-border bg-brand-surface-soft/25 p-6 md:p-8">
                  <p className="inline-flex items-center rounded-sm border border-brand-border/60 bg-brand-surface-soft/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
                    Preparation
                  </p>
                  <h2 className="mt-4 max-w-[30ch] font-serif text-2xl font-semibold tracking-tight text-brand-heading md:text-[2rem] md:leading-tight">
                    What to bring
                  </h2>
                  <ul className="mt-6 space-y-3.5">
                    {(tour.whatToBring ?? []).map((x: string) => (
                      <li key={x} className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary/80" aria-hidden />
                        <span className="text-base leading-[1.8] text-brand-body/90 md:text-lg">{x}</span>
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
    </div>
  );
}
