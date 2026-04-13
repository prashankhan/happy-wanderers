import type { Metadata } from "next";

import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Cancellation policy",
  description: "Operator cancellation and refund policy summary.",
};

export default function CancellationPolicyPage() {
  return (
    <section className="py-20 md:py-28">
      <Container className="max-w-3xl">
        <article className="space-y-8 text-base leading-relaxed text-gray-700">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
            Cancellation policy
          </h1>
          <p>
            Cancellations, weather procedures, and refund windows are defined by the operator. Confirmed bookings may be
            cancelled or refunded in line with Stripe events and admin workflows — always refer to your confirmation
            email for the reference used in support conversations.
          </p>
          <p>Replace with your final operator policy text before production.</p>
        </article>
      </Container>
    </section>
  );
}
