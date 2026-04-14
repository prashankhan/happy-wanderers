"use client";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { TestimonialSection } from "@/components/marketing/testimonial-section";
import { motion, Variants } from "framer-motion";
import { BadgeCheck, Globe2, HeartHandshake, MapPin, Shield } from "lucide-react";
import Link from "next/link";

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
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 20,
      },
    },
  };

  return (
    <div className="bg-brand-surface">
      <PageHeader 
        label="About Happy Wanderers"
        title="Rainforest departures built on calm logistics"
        description="We are a focused team running scheduled and private departures across Cairns and the Daintree with transparent availability and operator-level craft."
        breadcrumb={[{ label: "About" }]}
      />

      {/* Narrative Section */}
      <section className="py-24 md:py-32">
        <Container className="grid gap-16 lg:grid-cols-12 lg:gap-24">
          <div className="lg:col-span-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary mb-6">Our story</p>
            <h2 className="font-serif text-4xl font-bold tracking-tight text-brand-heading">Built for the forest floor</h2>
          </div>
          <div className="lg:col-span-12 lg:mt-8 space-y-8 text-lg leading-[1.8] text-brand-body/90 font-medium tracking-tight">
            <p className="max-w-4xl">
              Happy Wanderers began with a simple frustration: too many rainforest days felt rushed, over-scripted, or
              disconnected from the ecology guests had travelled to see. We built an operator model around senior
              guides, small vehicles, and software that respects capacity in real time.
            </p>
            <p className="max-w-4xl">
              Today we host guests from across the world who want premium pacing without pretence — where
              &ldquo;luxury&rdquo; means silence on the trail, honest briefings, and pickups that arrive on schedule.
            </p>
          </div>
        </Container>
      </section>

      {/* Local Expertise / Highlights */}
      <section className="bg-brand-surface-soft border-y border-brand-border py-24 md:py-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-brand-heading">Local expertise</h2>
            <p className="text-xl leading-relaxed text-brand-body/80 tracking-tight">
              Our guides live inside the rhythms of the Wet Tropics — weather windows, creek behaviour, and the ethics
              of wildlife approach. Expertise that shows up in every route choice.
            </p>
          </div>
          
          <div className="mt-20 grid gap-8 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-md border border-brand-border bg-white p-10 text-left transition-all hover:shadow-xl hover:ring-1 hover:ring-brand-border/80"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-primary/5 text-brand-primary group-hover:scale-110 transition-transform">
                  <Icon className="size-6" aria-hidden />
                </div>
                <h3 className="mt-8 text-xl font-bold tracking-tight text-brand-heading">{title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-brand-body/70">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Service Area & Features */}
      <section className="py-24 md:py-32">
        <Container className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
          <div className="space-y-10">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-brand-heading">The service difference</h2>
            <ul className="space-y-8">
              {[
                "Live availability and cutoffs tied to real pickup times — not estimates.",
                "Immutable booking snapshots after confirmation — total clarity.",
                "Private charters when you need the forest on your own terms.",
              ].map((text, i) => (
                <li key={i} className="flex gap-4">
                  <BadgeCheck className="mt-1 size-6 shrink-0 text-availability-open" aria-hidden />
                  <span className="text-lg font-medium tracking-tight text-brand-body">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="rounded-md border border-brand-border bg-brand-heading p-12 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-brand-primary">
                <MapPin className="size-6" aria-hidden />
                <h3 className="font-bold uppercase tracking-[0.2em] text-xs">Service area</h3>
              </div>
              <p className="mt-8 text-2xl font-bold tracking-tight">
                Cairns, Port Douglas & the Daintree rainforest corridor.
              </p>
              <p className="mt-4 text-lg text-white/60 leading-relaxed">
                Scheduled and private departures operate across regional access routes — exact pickup matrix
                depends on the tour you select.
              </p>
              <Link 
                href="/tours"
                className="mt-10 inline-flex items-center justify-center rounded-md bg-brand-primary px-10 py-3.5 text-xl font-bold tracking-tight text-white transition-all hover:bg-brand-primary-hover active:scale-[0.98]"
              >
                View our tours
              </Link>
            </div>
            {/* Subtle background accent */}
            <div className="absolute -right-8 -bottom-8 size-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <div className="border-t border-brand-border">
        <TestimonialSection />
      </div>

      {/* Final Contact Section */}
      <section className="bg-brand-surface py-12 md:py-24 border-t border-brand-border">
        <Container className="mx-auto max-w-4xl text-center">
          <div className="space-y-8">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-brand-heading md:text-5xl lg:text-6xl italic">
              Speak with the team
            </h2>
            <p className="text-xl leading-relaxed text-brand-body/80 font-medium tracking-tight max-w-3xl mx-auto">
              Planning a milestone trip or a private charter? Send us a note. 
              We respond personally—no scripts, just field expertise.
            </p>
            <div className="pt-6">
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-brand-primary px-12 py-4 text-xl font-bold tracking-tight text-white transition-all hover:bg-brand-primary-hover hover:shadow-lg active:scale-[0.98]"
              >
                Contact us
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
