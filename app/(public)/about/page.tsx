import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Globe2, HeartHandshake, MapPin, Shield } from "lucide-react";

import { TestimonialStrip } from "@/components/marketing/testimonials";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { publicHeroUnderFixedNavClass } from "@/lib/layout/public-nav-offset";

export const metadata: Metadata = {
  title: "About",
  description:
    "Happy Wanderers — premium small-group and private rainforest tours from Cairns & the Daintree. Operator story, philosophy, and service area.",
};

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
    <>
      <section
        className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b border-gray-200 bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 ${publicHeroUnderFixedNavClass}`}
      >
        <Container className="py-24 md:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-200/90">About Happy Wanderers</p>
          <h1 className="mt-6 max-w-4xl font-serif text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl">
            A rainforest operator built on calm logistics and generous field craft
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-blue-100/95 md:text-xl">
            We are not a marketplace — we are a focused team running scheduled and private departures across Cairns and
            the Daintree with transparent availability and Stripe-secured checkout.
          </p>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container className="max-w-3xl">
          <h2 className="font-serif text-2xl font-semibold text-gray-900 md:text-3xl">Our story</h2>
          <div className="mt-8 space-y-6 text-base leading-[1.75] text-gray-600 md:text-lg">
            <p>
              Happy Wanderers began with a simple frustration: too many rainforest days felt rushed, over-scripted, or
              disconnected from the ecology guests had travelled to see. We built an operator model around senior
              guides, small vehicles, and software that respects capacity and cutoffs in real time — so the morning of
              travel feels composed, not improvised.
            </p>
            <p>
              Today we host guests from across Australia and the world who want premium pacing without pretence — where
              &ldquo;luxury&rdquo; means silence on the trail, honest briefings, and pickups that arrive when we say they will.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-y border-gray-200 bg-gray-50/90 py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-semibold text-gray-900 md:text-4xl">Local expertise</h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-600">
              Our guides live inside the rhythms of the Wet Tropics — weather windows, creek behaviour, and the ethics
              of wildlife approach. That expertise is not performative; it shows up in route choice, rest timing, and
              the stories we choose to tell.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container>
          <h2 className="mx-auto max-w-2xl text-center font-serif text-3xl font-semibold text-gray-900 md:text-4xl">
            Experience philosophy
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-center text-lg leading-relaxed text-gray-600">
            We believe the Daintree rewards restraint — fewer words at the lookout, more attention at the creek line,
            and logistics so smooth you forget they exist.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-100 bg-white p-8 text-left shadow-sm ring-1 ring-gray-900/[0.03]"
              >
                <Icon className="h-8 w-8 text-blue-900/80" aria-hidden />
                <h3 className="mt-5 font-serif text-xl font-semibold text-gray-900">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-gray-200 bg-white py-20 md:py-28">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-gray-900 md:text-4xl">Why travellers choose us</h2>
            <ul className="mt-8 space-y-4 text-base leading-relaxed text-gray-600">
              <li className="flex gap-3">
                <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                <span>Live availability and cutoffs tied to real pickup times — not brochure estimates.</span>
              </li>
              <li className="flex gap-3">
                <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                <span>Immutable booking snapshots after confirmation — what you booked is what the guide sees.</span>
              </li>
              <li className="flex gap-3">
                <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                <span>Private charters when you need the forest on your own terms — same operator standards.</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-gray-100 bg-gray-50/80 p-10 shadow-inner ring-1 ring-gray-900/[0.04]">
            <div className="flex items-center gap-2 text-blue-900">
              <MapPin className="h-6 w-6" aria-hidden />
              <h3 className="font-serif text-xl font-semibold text-gray-900">Service area</h3>
            </div>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              Scheduled and private departures operate across the <strong className="font-medium text-gray-800">Cairns</strong>{" "}
              coast, <strong className="font-medium text-gray-800">Port Douglas</strong> access routes, and the{" "}
              <strong className="font-medium text-gray-800">Daintree</strong> rainforest corridor — exact pickup matrix
              depends on the tour you select.
            </p>
            <Button asChild variant="primary" className="mt-8">
              <Link href="/tours">View tours</Link>
            </Button>
          </div>
        </Container>
      </section>

      <TestimonialStrip
        heading="From the field"
        intro="Verified guest quotes will replace these placeholders as we collect post-departure feedback."
      />

      <section className="border-t border-gray-200 bg-blue-950 py-20 md:py-24">
        <Container className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-white md:text-4xl">Speak with the team</h2>
          <p className="mt-5 text-lg leading-relaxed text-blue-100/95">
            Planning a milestone trip, a private charter, or a multi-day combination? Send us a note — we respond
            personally and will never hand you to a call centre script.
          </p>
          <Button asChild variant="secondary" size="lg" className="mt-10 bg-white text-blue-900 hover:bg-gray-100">
            <Link href="/contact">Contact</Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
