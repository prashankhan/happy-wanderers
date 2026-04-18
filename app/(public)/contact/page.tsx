"use client";

import Link from "next/link";
import { LifeBuoy, ShieldCheck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { ContactForm } from "./contact-form";
import { PageHeader } from "@/components/layout/page-header";
/** Same scale as About / Voices section titles (`app/(public)/about/page.tsx`). */
const CONTACT_SECTION_TITLE =
  "font-serif text-3xl font-bold tracking-tight text-brand-heading md:text-4xl lg:text-5xl lg:leading-[1.12]";

export default function ContactPage() {
  return (
    <div className="bg-brand-surface">
      <PageHeader 
        title="Contact our team"
        description="We are a small, destination-led team based in Cairns & the Daintree region. Your message is read by humans who run the departures."
        breadcrumb={[{ label: "Contact" }]}
      />

      <Container className="py-24 md:py-32">
        <RevealOnView className="mx-auto max-w-5xl rounded-sm border border-brand-border bg-brand-surface-soft p-10 shadow-sm md:p-16">
          <div className="grid gap-16 md:grid-cols-2">
            <div className="flex gap-6">
              <ShieldCheck className="h-8 w-8 shrink-0 text-brand-primary" aria-hidden />
              <div>
                <p className="font-bold tracking-tight text-2xl text-brand-heading">Support assurance</p>
                <p className="mt-4 text-sm leading-[1.6] text-brand-body/70 font-medium">
                  We confirm pickup windows against live field capacity — ensuring the reply you receive matches the real-time operational state of our departures.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <LifeBuoy className="h-8 w-8 shrink-0 text-brand-primary" aria-hidden />
              <div>
                <p className="font-bold tracking-tight text-2xl text-brand-heading">Operator knowledge</p>
                <p className="mt-4 text-sm leading-[1.6] text-brand-body/70 font-medium">
                  Happy Wanderers is an active operator, not a reseller. Your message goes directly to the team who manages the vehicles and the guides in the field.
                </p>
              </div>
            </div>
          </div>
        </RevealOnView>

        <RevealOnView className="mx-auto mt-20 flex min-w-0 max-w-2xl flex-col space-y-8 lg:mt-24 lg:max-w-3xl lg:space-y-10">
          <div className="text-center">
            <h2 className={CONTACT_SECTION_TITLE}>Send a message</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-relaxed tracking-tight text-brand-body/70 md:text-lg">
              Required fields help us answer in one pass. We never sell your details — see our{" "}
              <Link
                href="/privacy"
                className="font-bold text-brand-primary underline underline-offset-4 decoration-brand-primary/30 hover:text-brand-primary-hover"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <div className="rounded-sm border border-brand-border bg-white p-8 shadow-lg shadow-brand-heading/5 ring-1 ring-brand-heading/5 md:p-10">
            <ContactForm centerSubmit />
          </div>
        </RevealOnView>
      </Container>
    </div>
  );
}
