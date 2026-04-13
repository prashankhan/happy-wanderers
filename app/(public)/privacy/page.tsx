import type { Metadata } from "next";

import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How we handle personal data for bookings and enquiries.",
};

export default function PrivacyPage() {
  return (
    <section className="py-20 md:py-28">
      <Container className="max-w-3xl">
        <article className="space-y-8 text-base leading-relaxed text-gray-700">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">Privacy policy</h1>
          <p>
            We collect the information required to operate bookings — names, contact details, passenger counts, and
            payment references processed by Stripe. Data is used to fulfil your tour, send transactional emails, and
            meet operator obligations.
          </p>
          <p>
            For questions, contact the operator using details published on the contact page. This page is a concise
            summary; align final copy with your legal counsel before production launch.
          </p>
        </article>
      </Container>
    </section>
  );
}
