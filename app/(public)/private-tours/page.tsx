import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Car, Map, Sparkles, Users } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { publicHeroUnderFixedNavClass } from "@/lib/layout/public-nav-offset";

export const metadata: Metadata = {
  title: "Private tours",
  description:
    "Private rainforest departures with custom timing, exclusive vehicle, and local expertise — Happy Wanderers Cairns & Daintree.",
};

const benefits = [
  {
    icon: Map,
    title: "Custom itinerary",
    body: "Shape the day around photography, family pacing, accessibility, or a deeper naturalist focus — within park access and seasonal realities.",
  },
  {
    icon: CalendarClock,
    title: "Flexible timing",
    body: "Private charters unlock earlier departures or extended field time where regulations and safety allow — discussed upfront with our team.",
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
  return (
    <>
      <section
        className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b border-brand-border bg-gradient-to-br from-blue-950 via-blue-900 to-gray-900 ${publicHeroUnderFixedNavClass}`}
      >
        <Container className="py-24 md:py-32 lg:py-36">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold/90">Private departures</p>
          <h1 className="mt-6 max-w-4xl font-serif text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl">
            The rainforest, chartered on your terms
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-blue-100/95 md:text-xl">
            For guests who want the Wet Tropics without the constraints of a fixed schedule — private vehicles,
            curated pacing, and the same operator discipline that underpins every Happy Wanderers departure.
          </p>
        </Container>
      </section>

      <section className="border-b border-brand-border bg-brand-surface-warm py-20 md:py-28">
        <Container className="max-w-3xl">
          <h2 className="font-serif text-2xl font-semibold text-brand-heading md:text-3xl">Editorial note</h2>
          <div className="mt-8 space-y-6 text-base leading-[1.75] text-brand-body md:text-lg">
            <p>
              Private touring is not about excess — it is about margin. Margin to wait for a cassowary crossing, to
              shorten a leg when heat builds, or to spend longer at a creek without watching the clock for a mixed group.
            </p>
            <p>
              We work within national park rules, road access, and seasonal closures — then build the best possible day
              inside those guardrails. Tell us who is travelling, what you hope to feel, and we will advise honestly on
              what is achievable.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-y border-brand-border bg-brand-surface-soft py-20 md:py-28">
        <Container>
          <h2 className="mx-auto max-w-2xl text-center font-serif text-3xl font-semibold text-brand-heading md:text-4xl">
            Why guests choose private
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-brand-body">
            The same rainforest — with logistics and narration tuned exclusively to your party.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm ring-1 ring-brand-heading/[0.03] transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent-soft text-brand-accent">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-6 font-serif text-lg font-semibold text-brand-heading">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-brand-body">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-brand-border bg-brand-surface py-20 md:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <div className="flex items-center gap-2 text-brand-primary">
                <Sparkles className="h-5 w-5 text-brand-gold" aria-hidden />
                <p className="text-xs font-semibold uppercase tracking-widest">Inspiration</p>
              </div>
              <h2 className="mt-4 font-serif text-3xl font-semibold text-brand-heading md:text-4xl">
                Example experience ideas
              </h2>
              <p className="mt-4 text-base leading-relaxed text-brand-body">
                Starting points for conversation — final routes are always confirmed with guides and access conditions.
              </p>
            </div>
            <ul className="space-y-4 text-base leading-relaxed text-brand-body">
              {ideas.map((idea) => (
                <li key={idea} className="flex gap-3 rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-gold" aria-hidden />
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-t border-brand-border bg-brand-accent py-20 md:py-24">
        <Container className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-white md:text-4xl">Start a private enquiry</h2>
          <p className="mt-5 text-lg leading-relaxed text-white/90">
            Share dates, party size, and what a perfect day feels like — we will reply with options, transparent
            constraints, and next steps. No automated enquiry engine required: your message reaches our operator team
            directly.
          </p>
          <Button asChild variant="primary" size="lg" className="mt-10">
            <Link href="/contact">Contact us</Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
