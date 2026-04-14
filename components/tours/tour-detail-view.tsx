"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { CalendarRange, Leaf, MapPin, Sparkles, Sun, Users } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { publicHeroUnderFixedNavClass } from "@/lib/layout/public-nav-offset";
import { TestimonialSection } from "@/components/marketing/testimonial-section";

interface TourDetailViewProps {
  tour: any;
  images: any[];
  pickups: any[];
  heroGallery: React.ReactNode;
  bookingSidebar: React.ReactNode;
}

export function TourDetailView({ tour, images, pickups, heroGallery, bookingSidebar }: TourDetailViewProps) {
  const descriptionTimeline = (description: string): string[] => {
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
  };

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
    <div className="bg-white pb-24">
      {/* Dark Hero Section */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-brand-heading">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <nav className="mb-10 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            <Link href="/" className="transition hover:text-brand-primary">Home</Link>
            <span className="mx-3 opacity-40">/</span>
            <Link href="/tours" className="transition hover:text-brand-primary">Tours</Link>
            <span className="mx-3 opacity-40">/</span>
            <span className="text-white/90">{tour.title}</span>
          </nav>

          {heroGallery}

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 max-w-4xl space-y-6"
          >
            {tour.heroBadge ? (
              <span className="inline-flex rounded-md bg-brand-primary px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-lg">
                {tour.heroBadge}
              </span>
            ) : null}
            <h1 className="font-serif text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-7xl lg:leading-[1.1]">
              {tour.title}
            </h1>
            <p className="max-w-2xl text-xl leading-relaxed text-white/70">{tour.shortDescription}</p>
          </motion.div>
        </div>
      </div>

      <Container className="mt-20 md:mt-28">
        <div className="grid gap-16 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-24">
          <div className="space-y-24 md:space-y-32">
            
            {/* Highlights Section */}
            <section>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary mb-4">The detail</p>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-heading md:text-4xl">Tour highlights</h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-body/80">
                What sets this experience apart — the details guests remember long after the trail.
              </p>
              <div className="mt-12 grid gap-8 sm:grid-cols-3">
                {highlightCards.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="group rounded-md border border-brand-border bg-white p-8 transition-all hover:shadow-xl hover:ring-1 hover:ring-brand-border/80">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-primary/5 text-brand-primary transition-transform group-hover:scale-110">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <h3 className="mt-6 font-bold tracking-tight text-xl text-brand-heading">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-brand-body/70">{body}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline Section */}
            <section className="rounded-md bg-brand-surface-soft p-12 md:p-16 border border-brand-border">
              <h2 className="flex items-center gap-3 font-serif text-3xl font-bold tracking-tight text-brand-heading md:text-4xl">
                <CalendarRange className="h-8 w-8 text-brand-primary" aria-hidden />
                Your day, step by step
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-brand-body/80">
                A clear rhythm from booking to trail — tailored to how we run departures in the Wet Tropics.
              </p>
              <ol className="relative mt-12 space-y-0 border-l border-brand-primary/20 pl-10">
                {timelineItems.map((text, i) => (
                  <li key={i} className="relative pb-12 last:pb-0">
                    <span className="absolute -left-[51px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-[11px] font-bold text-white shadow-lg ring-4 ring-white">
                      {i + 1}
                    </span>
                    <p className="text-base font-medium leading-relaxed text-brand-heading md:text-lg">{text}</p>
                  </li>
                ))}
              </ol>
            </section>

            {/* Detailed Overview */}
            <section className="max-w-none space-y-6">
              <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-heading md:text-4xl">Overview</h2>
              <div className="whitespace-pre-line text-lg leading-[1.8] text-brand-body/90 font-medium tracking-tight">
                {tour.description}
              </div>
            </section>

            {/* Inclusions / Exclusions */}
            <section className="space-y-10">
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Pragmatics</p>
                <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-heading md:text-4xl">Inclusions & exclusions</h2>
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
                <Card className="rounded-md border-brand-border shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold tracking-tight">
                      <Leaf className="h-5 w-5 text-availability-open" aria-hidden />
                      Inclusions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4 text-sm font-medium tracking-tight text-brand-body/80">
                      {(tour.inclusions ?? []).map((x: string) => (
                        <li key={x} className="flex gap-3">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-availability-open" aria-hidden />
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="rounded-md border-brand-border shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold tracking-tight">Exclusions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4 text-sm font-medium tracking-tight text-brand-body/80">
                      {(tour.exclusions ?? []).map((x: string) => (
                        <li key={x} className="flex gap-3">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-muted/40" aria-hidden />
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Testimonials */}
            <div className="border-t border-brand-border pt-20">
              <TestimonialSection />
            </div>

            {/* Final Booking Drive */}
            <section className="rounded-md bg-brand-heading p-10 md:p-14 text-white overflow-hidden relative">
              <div className="relative z-10">
                <h2 className="font-serif text-3xl font-bold tracking-tight">Check Availability</h2>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
                  Choose a signature departure date — seating and cutoffs are managed in real-time by our field operations.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link 
                    href={`/availability?tour_id=${tour.id}`}
                    className="inline-flex items-center justify-center rounded-sm bg-brand-primary px-14 py-5 text-2xl font-bold tracking-tight text-white transition-all hover:bg-brand-primary-hover hover:shadow-md active:scale-[0.98]"
                  >
                    Open full calendar
                  </Link>
                  <Link 
                    href={`/booking?tour_id=${tour.id}`}
                    className="inline-flex items-center justify-center rounded-sm border border-white/30 bg-white/5 px-14 py-5 text-2xl font-bold tracking-tight text-white backdrop-blur-sm transition-all hover:bg-white/15 active:scale-[0.98]"
                  >
                    Book this tour
                  </Link>
                </div>
              </div>
            </section>
          </div>

          {bookingSidebar}
        </div>
      </Container>
    </div>
  );
}
