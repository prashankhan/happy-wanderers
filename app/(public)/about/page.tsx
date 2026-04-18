"use client";

import Image from "next/image";
import { Check, Globe2, HeartHandshake, MapPin, Shield } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { PageHeader } from "@/components/layout/page-header";
import { TestimonialSection } from "@/components/marketing/testimonial-section";
import { Button } from "@/components/ui/button";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";
import { cn } from "@/lib/utils/cn";

/** Same scale as Featured / Destination / Voices section intros (`components/marketing/*`). */
const ABOUT_SECTION_TITLE =
  "font-serif text-3xl font-bold tracking-tight text-brand-heading md:text-4xl lg:text-5xl lg:leading-[1.12]";
/** Intro line under section titles (matches Featured + Voices deks). */
const ABOUT_SECTION_LEDE = "mx-auto max-w-3xl text-lg leading-relaxed text-brand-body md:text-xl";
/** Longer body copy under a section title — slightly smaller than lede, same measure. */
const ABOUT_SECTION_BODY =
  "mx-auto mt-6 max-w-3xl space-y-6 text-base font-medium leading-relaxed text-brand-body/90 md:text-lg";

/** Hero for service-area card (wide landscape; verified 200 from Unsplash). */
const SERVICE_AREA_HERO_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=85";

const pillars = [
  {
    icon: Shield,
    title: "Operator discipline",
    body: "Capacity, cutoffs, and confirmations are handled with the same rigour we expect when booking our own travel — no surprises at the pickup.",
    image:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=85",
  },
  {
    icon: Globe2,
    title: "Destination authority",
    body: "We speak in specifics — which creek is running clear, which canopy loop is quieter in wet season, where cassowary crossings need extra care.",
    image:
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    icon: HeartHandshake,
    title: "Guest dignity",
    body: "Small groups, honest infant capacity, and guides who know when to narrate and when to let the forest speak.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-brand-surface">
      <PageHeader 
        title="Rainforest departures built on calm logistics"
        description="We are a focused team running scheduled departures across Cairns and the Daintree — transparent availability, calm logistics, and operator-level craft."
        breadcrumb={[{ label: "About" }]}
      />

      {/* Narrative — one centered spine with PageHeader (no center → left switch on md) */}
      <section className="border-b border-brand-border py-24 md:py-32">
        <Container>
          <RevealOnView>
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
              The Narrative
            </p>
            <h2 className={cn("mt-4", ABOUT_SECTION_TITLE)}>Built for the forest floor.</h2>
            <div className={ABOUT_SECTION_BODY}>
              <p>
                Happy Wanderers began with a simple frustration: too many rainforest days felt rushed, over-scripted,
                or disconnected from the ecology guests had travelled to see. We built an operator model around senior
                guides, small vehicles, and software that respects capacity in real time.
              </p>
              <p className="text-brand-body/65 italic md:text-lg">
                Today we host guests from across the world who want premium pacing without pretence — where
                &ldquo;luxury&rdquo; means silence on the trail, honest briefings, and arrivals that synchronize with the
                natural light.
              </p>
            </div>
          </div>
          </RevealOnView>
        </Container>
      </section>

      {/* Local Expertise / Highlights */}
      <section className="border-b border-brand-border bg-brand-surface-soft py-24 md:py-32">
        <Container>
          <RevealOnView>
          <div className="mx-auto max-w-5xl text-center">
            <h2 className={ABOUT_SECTION_TITLE}>Field authority.</h2>
            <p className={cn("mt-6", ABOUT_SECTION_LEDE)}>
              Our guides live inside the rhythms of the Wet Tropics — weather windows, creek behaviour, and the ethics
              of wildlife approach.
            </p>
          </div>
          </RevealOnView>

          <RevealOnView className="mx-auto mt-16 block max-w-6xl md:mt-20">
          <div className="grid gap-8 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body, image }) => (
              <div
                key={title}
                className="group overflow-hidden rounded-sm border border-brand-border bg-white text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={image}
                    alt=""
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                  />
                </div>
                <div className="p-8 md:p-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-brand-primary/10 text-brand-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-brand-heading md:text-xl">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-brand-body/70 md:text-base">{body}</p>
                </div>
              </div>
            ))}
          </div>
          </RevealOnView>
        </Container>
      </section>

      {/* Service Area & Features */}
      <section className="bg-white py-24 md:py-32">
        <Container className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
          <RevealOnView className="mx-auto max-w-xl space-y-8 text-center lg:mx-0 lg:max-w-none lg:space-y-10 lg:text-left">
            <h2 className={ABOUT_SECTION_TITLE}>The service difference.</h2>
            <ul className="space-y-5 text-left md:space-y-6">
              {[
                "Live capacity — not guesses.",
                "One snapshot, every guest.",
                "Custom plan? Contact first.",
              ].map((text, i) => (
                <li key={i} className="flex items-start justify-start gap-4 md:gap-5">
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-border/70 bg-brand-surface-soft text-brand-primary shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                    aria-hidden
                  >
                    <Check className="size-3.5" strokeWidth={2.25} aria-hidden />
                  </span>
                  <span className="text-left text-base font-medium leading-snug tracking-tight text-brand-heading/80 md:text-lg">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </RevealOnView>

          <RevealOnView className="relative min-h-[20rem] overflow-hidden rounded-sm border border-brand-border bg-brand-heading p-10 text-white shadow-lg md:min-h-[24rem] md:p-14 lg:min-h-[26rem] lg:p-16">
            {/* Photo under gradient; explicit z-index so the image is never painted above copy */}
            <div className="pointer-events-none absolute inset-0 z-0">
              <Image
                src={SERVICE_AREA_HERO_IMAGE}
                alt="Wide view over forested ranges in North Queensland"
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="z-0 object-cover"
              />
              <div
                className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/65 to-black/35"
                aria-hidden
              />
            </div>

            <div className="relative z-20">
              <div className="flex items-center gap-3 text-brand-primary">
                <MapPin className="size-6" aria-hidden />
                <h3 className="font-bold uppercase tracking-[0.3em] text-[10px]">Service area profile</h3>
              </div>
              <p className="mt-8 font-serif text-2xl font-bold leading-tight tracking-tight md:text-3xl lg:text-4xl">
                Cairns, <br />Port Douglas <br />& the Daintree.
              </p>
              <p className="mt-5 text-sm font-medium leading-relaxed tracking-tight text-white/65 md:text-base">
                Scheduled departures run across the rainforest corridor. Exact pickup windows depend on the tour and
                season you choose.
              </p>
              <div className="mt-14">
                <Button asChild variant="primary" className={primaryTourCtaClassName}>
                  <Link href="/tours">View departures</Link>
                </Button>
              </div>
            </div>
            {/* Subtle overlay accent */}
            <div className="pointer-events-none absolute -right-20 -bottom-20 z-10 size-96 rounded-full bg-brand-primary/20 blur-[100px]" />
          </RevealOnView>
        </Container>
      </section>

      {/* Testimonials */}
      <div className="border-t border-brand-border">
        <TestimonialSection />
      </div>

      {/* Final Contact Section */}
      <section className="border-t border-brand-border bg-brand-surface py-24 md:py-32">
        <Container className="mx-auto max-w-5xl text-center">
          <RevealOnView>
          <div className="space-y-6 md:space-y-8">
            <h2 className={cn(ABOUT_SECTION_TITLE, "italic tracking-tight")}>Connect with the field.</h2>
            <p className={cn("mt-6", ABOUT_SECTION_LEDE, "text-brand-body/80")}>
              Planning a milestone trip or something bespoke? Send us a note. We respond personally — no automated
              scripts.
            </p>
            <div className="flex justify-center pt-2 md:pt-4">
              <Button
                asChild
                variant="primary"
                className={cn(
                  primaryTourCtaClassName,
                  "rounded-sm shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:shadow-md"
                )}
              >
                <Link href="/contact">Send a message</Link>
              </Button>
            </div>
          </div>
          </RevealOnView>
        </Container>
      </section>
    </div>
  );
}
