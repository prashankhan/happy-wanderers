import type { Metadata } from "next";
import Link from "next/link";
import { Clock, LifeBuoy, MapPin, Phone, ShieldCheck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach our team for bespoke departures, accessibility needs, or booking assistance.",
};

export default function ContactPage() {
  return (
    <section className="py-20 md:py-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Happy Wanderers</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            Contact our operator team
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 md:text-xl">
            We are a small, destination-led team based in <span className="font-medium text-gray-800">Cairns &amp; the Daintree region</span>.
            Whether you are finishing a scheduled booking, planning a private charter, or travelling with accessibility
            considerations — your message is read by humans who run the departures, not a ticket queue.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl rounded-3xl border border-gray-100 bg-gradient-to-br from-blue-950/5 via-white to-gray-50 p-8 shadow-inner ring-1 ring-gray-900/[0.04] md:p-12">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="flex gap-4">
              <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-blue-900" aria-hidden />
              <div>
                <p className="font-serif text-lg font-semibold text-gray-900">Support reassurance</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  We confirm pickup windows, infant capacity, and cutoffs against live availability — so the reply you
                  receive matches what the booking engine will honour. If something cannot be done safely, we will say
                  so plainly.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <LifeBuoy className="mt-1 h-6 w-6 shrink-0 text-blue-900" aria-hidden />
              <div>
                <p className="font-serif text-lg font-semibold text-gray-900">Operator introduction</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Happy Wanderers runs scheduled small-group tours and private rainforest charters with the same field
                  standards. Use this form for anything that does not fit a standard checkout — we will route it to
                  the right guide or logistics lead.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h2 className="font-serif text-2xl font-semibold text-gray-900">Before you write</h2>
            <div className="mt-8 space-y-6 rounded-2xl border border-gray-100 bg-gray-50/80 p-6 text-sm text-gray-700 shadow-sm">
              <div className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-900" aria-hidden />
                <div>
                  <p className="font-semibold text-gray-900">Expected response time</p>
                  <p className="mt-1 leading-relaxed">
                    We aim to reply within <span className="font-medium">one business day</span>. Urgent day-of issues
                    should use the phone number printed on your confirmation once a booking exists.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-blue-900" aria-hidden />
                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <p className="mt-1 leading-relaxed">
                    A direct operations line appears on confirmed itineraries. For new enquiries, email via the form
                    keeps a clear paper trail for both sides.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-900" aria-hidden />
                <div>
                  <p className="font-semibold text-gray-900">Service area summary</p>
                  <p className="mt-1 leading-relaxed">
                    Pickups and routes across the Cairns coast, northern beaches, Port Douglas access roads, and Daintree
                    rainforest corridors — exact matrix depends on the tour you select.
                  </p>
                </div>
              </div>
            </div>
            <Button asChild variant="secondary" className="mt-8">
              <Link href="/private-tours">Private tour enquiries</Link>
            </Button>
          </div>
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg ring-1 ring-gray-900/[0.04] lg:col-span-7 lg:p-10">
            <h2 className="font-serif text-2xl font-semibold text-gray-900">Send a message</h2>
            <p className="mt-2 text-sm text-gray-500">
              Required fields help us answer in one pass. We never sell your details — see our{" "}
              <Link href="/privacy" className="text-blue-900 underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
