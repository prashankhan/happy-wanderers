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
        title="Rainforest departures built on calm logistics"
        description="We are a focused team running scheduled and private departures across Cairns and the Daintree with transparent availability and operator-level craft."
        breadcrumb={[{ label: "About" }]}
      />

      {/* Narrative Section */}
      <section className="py-32 md:py-48 lg:py-64">
        <Container className="grid gap-20 lg:grid-cols-12">
          <div className="lg:col-span-12 mb-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-primary mb-8">The Narrative</p>
            <h2 className="font-serif text-5xl font-black tracking-tighter text-brand-heading md:text-7xl lg:text-8xl leading-[0.9]">
              Built for the <br className="hidden md:block" />forest floor.
            </h2>
          </div>
          <div className="lg:col-span-8 lg:col-start-1 space-y-12 text-xl leading-[1.6] text-brand-body/90 font-medium tracking-tight md:text-3xl md:leading-[1.4]">
            <p className="max-w-5xl">
              Happy Wanderers began with a simple frustration: too many rainforest days felt rushed, over-scripted, or
              disconnected from the ecology guests had travelled to see. We built an operator model around senior
              guides, small vehicles, and software that respects capacity in real time.
            </p>
            <p className="max-w-5xl text-brand-body/60 italic">
              Today we host guests from across the world who want premium pacing without pretence — where
              &ldquo;luxury&rdquo; means silence on the trail, honest briefings, and arrivals that synchronize with the natural light.
            </p>
          </div>
        </Container>
      </section>

      {/* Local Expertise / Highlights */}
      <section className="bg-brand-surface-soft border-y border-brand-border py-32 md:py-48">
        <Container>
          <div className="mx-auto max-w-4xl text-center space-y-10">
            <h2 className="font-serif text-5xl font-bold tracking-tight text-brand-heading md:text-7xl">Field authority.</h2>
            <p className="text-xl leading-relaxed text-brand-body/80 tracking-tight md:text-3xl max-w-2xl mx-auto">
              Our guides live inside the rhythms of the Wet Tropics — weather windows, creek behaviour, and the ethics
              of wildlife approach.
            </p>
          </div>
          
          <div className="mt-28 grid gap-8 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-sm border border-brand-border bg-white p-12 text-left transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-brand-primary/10 text-brand-primary transition-transform">
                  <Icon className="size-6" aria-hidden />
                </div>
                <h3 className="mt-10 text-2xl font-bold tracking-tighter text-brand-heading uppercase">{title}</h3>
                <p className="mt-6 text-base leading-relaxed text-brand-body/60 font-medium">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Service Area & Features */}
      <section className="py-32 md:py-48 bg-white">
        <Container className="grid gap-24 lg:grid-cols-2 lg:items-center">
          <div className="space-y-16">
            <h2 className="font-serif text-5xl font-bold tracking-tight text-brand-heading md:text-7xl">The service <br />difference.</h2>
            <ul className="space-y-12">
              {[
                "Live availability tied to real field capacity — not estimates.",
                "Immutable booking snapshots for total passenger clarity.",
                "Private charters when you need the forest on your own terms.",
              ].map((text, i) => (
                <li key={i} className="flex gap-6">
                  <BadgeCheck className="mt-1 size-8 shrink-0 text-brand-primary" aria-hidden />
                  <span className="text-xl font-bold tracking-tight text-brand-heading md:text-2xl">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="rounded-sm border border-brand-border bg-brand-heading p-12 text-white shadow-3xl relative overflow-hidden lg:p-20">
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-brand-primary">
                <MapPin className="size-6" aria-hidden />
                <h3 className="font-bold uppercase tracking-[0.3em] text-[10px]">Service area profile</h3>
              </div>
              <p className="mt-10 text-4xl font-black tracking-tighter lg:text-5xl leading-[0.9]">
                Cairns, <br />Port Douglas <br />& the Daintree.
              </p>
              <p className="mt-8 text-xl text-white/50 leading-relaxed font-medium tracking-tight">
                Scheduled and private departures operate across the rainforest corridor. Exact pickup rules depend on the specific seasonal tour you choose.
              </p>
              <div className="mt-14">
                <Link 
                  href="/tours"
                  className="inline-flex items-center justify-center rounded-sm bg-brand-primary px-14 py-5 text-2xl font-bold tracking-tight text-white transition-all hover:bg-brand-primary-hover active:scale-[0.98]"
                >
                  View departures
                </Link>
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
      <section className="bg-brand-surface py-32 md:py-64 border-t border-brand-border">
        <Container className="mx-auto max-w-5xl text-center">
          <div className="space-y-12">
            <h2 className="font-serif text-6xl font-black tracking-tighter text-brand-heading md:text-8xl lg:text-9xl leading-[0.85] italic">
              Connect with <br />the field.
            </h2>
            <p className="text-xl leading-relaxed text-brand-body/80 font-bold tracking-tight max-w-3xl mx-auto md:text-3xl">
              Planning a milestone trip or a private charter? Send us a note. 
              We respond personally—no automated scripts.
            </p>
            <div className="pt-12">
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center rounded-sm bg-brand-primary px-16 py-6 text-3xl font-bold tracking-tighter text-white transition-all hover:bg-brand-primary-hover hover:shadow-2xl active:scale-[0.98]"
              >
                Send a message
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
