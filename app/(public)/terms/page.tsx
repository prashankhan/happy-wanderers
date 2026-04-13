import type { Metadata } from "next";

import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms and conditions for using this website and booking platform.",
};

export default function TermsPage() {
  return (
    <section className="py-20 md:py-28">
      <Container className="max-w-3xl">
        <article className="space-y-8 text-base leading-relaxed text-gray-700">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
            Terms &amp; conditions
          </h1>
          <p>
            By using this site you agree to provide accurate booking information and to comply with safety briefings on
            the day of travel. Availability and pricing shown at checkout creation are authoritative for that session;
            confirmed bookings store immutable snapshots.
          </p>
          <p>Replace this draft with counsel-reviewed terms prior to launch.</p>
        </article>
      </Container>
    </section>
  );
}
