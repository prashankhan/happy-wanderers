"use client";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { motion } from "framer-motion";
import { CalendarClock, Car, Map, Sparkles, Users } from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: Map,
    title: "Custom itinerary",
    body: "Shape the day around photography, family pacing, accessibility, or a deeper naturalist focus — within park access realities.",
  },
  {
    icon: CalendarClock,
    title: "Flexible timing",
    body: "Charter options unlock earlier departures or extended field time where regulations allow — discussed upfront with our team.",
  },
  {
    icon: Car,
    title: "Exclusive vehicle",
    body: "Your group travels together in a dedicated vehicle with a senior guide — no mixed pickups, no strangers on the trail.",
  },
  {
    icon: Users,
    title: "Local expertise",
    body: "Guides who read weather, creek levels, and wildlife behaviour in real time — the same field standards as our scheduled departures.",
  },
];

const ideas = [
  "Slow morning in the Daintree with extended canopy time and a private morning tea stop.",
  "Multi-generational family day with generous rest points and simplified walking options.",
  "Photography-forward pacing with quiet approaches to birding corridors and creek crossings.",
  "Anniversary or proposal logistics — discrete coordination and premium pacing without spectacle.",
];

export default function PrivateToursPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } },
  };

  return (
    <div className="bg-brand-surface">
      <PageHeader 
        label="Private departures"
        title="The rainforest, chartered on your terms"
        description="For guests who want the Wet Tropics without the constraints of a fixed schedule — private vehicles, curated pacing, and deep operator discipline."
        breadcrumb={[{ label: "Private tours" }]}
      />

      {/* Philosophy / Note section */}
      <section className="py-24 md:py-32">
        <Container className="grid gap-16 lg:grid-cols-12 lg:gap-24">
          <div className="lg:col-span-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary mb-6">Editorial note</p>
            <h2 className="font-serif text-4xl font-bold tracking-tight text-brand-heading">Private touring is about margin</h2>
          </div>
          <div className="lg:col-span-12 lg:mt-8 space-y-8 text-lg leading-[1.8] text-brand-body/90 font-medium tracking-tight">
            <p className="max-w-4xl">
              Private touring is not about excess — it is about margin. Margin to wait for a cassowary crossing, to
              shorten a leg when heat builds, or to spend longer at a creek without watching the clock for a mixed group.
            </p>
            <p className="max-w-4xl">
              We work within national park rules, road access, and seasonal closures — then build the best possible day
              inside those guardrails.
            </p>
          </div>
        </Container>
      </section>

      {/* Benefits Grid */}
      <section className="bg-brand-surface-soft border-y border-brand-border py-24 md:py-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-brand-heading">Why guests choose private</h2>
            <p className="text-xl leading-relaxed text-brand-body/80 tracking-tight">
              The same rainforest — with logistics and narration tuned exclusively to your party.
            </p>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {benefits.map(({ icon: Icon, title, body }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                className="group rounded-md border border-brand-border bg-white p-8 transition-all hover:shadow-xl hover:ring-1 hover:ring-brand-border/80"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-primary/5 text-brand-primary group-hover:scale-110 transition-transform">
                  <Icon className="size-6" aria-hidden />
                </div>
                <h3 className="mt-8 text-lg font-bold tracking-tight text-brand-heading">{title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-brand-body/70">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Inspiration Ideas */}
      <section className="py-24 md:py-32 bg-white">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start lg:gap-24">
            <div>
              <div className="flex items-center gap-3 text-brand-primary">
                <Sparkles className="size-5" aria-hidden />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Inspiration</p>
              </div>
              <h2 className="mt-6 font-serif text-4xl font-bold tracking-tight text-brand-heading md:text-5xl">
                Experience ideas
              </h2>
              <p className="mt-8 text-xl text-brand-body/70 leading-relaxed font-medium tracking-tight">
                Starting points for conversation — final routes are always confirmed with guides and access conditions.
              </p>
            </div>
            <ul className="space-y-6">
              {ideas.map((idea) => (
                <li key={idea} className="flex gap-5 rounded-md border border-brand-border bg-brand-surface-soft p-8 transition-all hover:border-brand-primary/30">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-brand-primary" aria-hidden />
                  <span className="text-lg font-bold tracking-tight text-brand-heading leading-snug">{idea}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Final Action Drive */}
      <section className="bg-brand-heading py-24 md:py-32 text-white overflow-hidden relative border-t border-brand-border">
        <Container className="mx-auto max-w-4xl text-center relative z-10">
          <div className="space-y-8">
            <h2 className="font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl italic">
              Start a private enquiry
            </h2>
            <p className="text-xl leading-relaxed text-white/70 font-medium tracking-tight max-w-3xl mx-auto">
              Share dates, party size, and what a perfect day feels like — we will reply personally with options and next steps.
            </p>
            <div className="pt-6">
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-brand-primary px-12 py-4 text-xl font-bold tracking-tight text-white transition-all hover:bg-brand-primary-hover hover:shadow-lg active:scale-[0.98]"
              >
                Connect with our team
              </Link>
            </div>
          </div>
        </Container>
        {/* Subtle background glow */}
        <div className="absolute -bottom-[20vw] -left-[10vw] size-[50vw] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      </section>
    </div>
  );
}
