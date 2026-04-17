"use client";

import { BadgeCheck, Globe2, HeartHandshake, MapPin, Shield } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
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

const pillars = [
  {
    icon: Shield,
    title: "Operator discipline",
    body: "Capacity, cutoffs, and confirmations are handled with the same rigour we expect when booking our own travel — no surprises at the pickup.",
  },
  {
    icon: Globe2,
    title: "Destination authority",
    body: "We speak in specifics — which creek is running clear, which canopy loop is quieter in wet season, where cassowary crossings need extra care.",
  },
  {
    icon: HeartHandshake,
    title: "Guest dignity",
    body: "Small groups, honest infant capacity, and guides who know when to narrate and when to let the forest speak.",
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
        </Container>
      </section>

      {/* Local Expertise / Highlights */}
      <section className="border-b border-brand-border bg-brand-surface-soft py-24 md:py-32">
        <Container>
          <div className="mx-auto max-w-5xl text-center">
            <h2 className={ABOUT_SECTION_TITLE}>Field authority.</h2>
            <p className={cn("mt-6", ABOUT_SECTION_LEDE)}>
              Our guides live inside the rhythms of the Wet Tropics — weather windows, creek behaviour, and the ethics
              of wildlife approach.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-8 md:mt-20 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-sm border border-brand-border bg-white p-8 text-left shadow-sm transition-shadow hover:shadow-md md:p-10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-brand-primary/10 text-brand-primary">
                  <Icon className="size-6" aria-hidden />
                </div>
                <h3 className="mt-7 text-lg font-bold tracking-tight text-brand-heading md:mt-8 md:text-xl">{title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-brand-body/70 md:text-base">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Service Area & Features */}
      <section className="bg-white py-24 md:py-32">
        <Container className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="mx-auto max-w-xl space-y-8 text-center lg:mx-0 lg:max-w-none lg:space-y-10 lg:text-left">
            <h2 className={ABOUT_SECTION_TITLE}>The service difference.</h2>
            <ul className="space-y-6 text-left md:space-y-8">
              {[
                "Live availability tied to real field capacity — not estimates.",
                "Immutable booking snapshots for total passenger clarity.",
                "Groups, milestones, or special dates — talk to us on Contact before you book.",
              ].map((text, i) => (
                <li key={i} className="flex justify-start gap-4 md:gap-5">
                  <BadgeCheck className="mt-0.5 size-7 shrink-0 text-brand-primary md:size-8" aria-hidden />
                  <span className="text-left text-base font-bold leading-snug tracking-tight text-brand-heading md:text-lg">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative overflow-hidden rounded-sm border border-brand-border bg-brand-heading p-10 text-white shadow-lg md:p-14 lg:p-16">
            <div className="relative z-10">
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
            {/* Subtle background accent */}
            <div className="absolute -right-20 -bottom-20 size-96 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <div className="border-t border-brand-border">
        <TestimonialSection />
      </div>

      {/* Final Contact Section */}
      <section className="border-t border-brand-border bg-brand-surface py-24 md:py-32">
        <Container className="mx-auto max-w-5xl text-center">
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
        </Container>
      </section>
    </div>
  );
}
