import type { Metadata } from "next";

import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Cancellation policy",
  description: "Operator cancellation and refund policy summary.",
};

export default function CancellationPolicyPage() {
  return (
    <section className="py-20">
      <Container className="prose prose-gray max-w-3xl">
        <h1 className="font-serif text-4xl font-semibold text-gray-900">Cancellation policy</h1>
        <p>
          Cancellations, weather procedures, and refund windows are defined by the operator. Confirmed bookings may be
          cancelled or refunded in line with Stripe events and admin workflows — always refer to your confirmation
          email for the reference used in support conversations.
        </p>
        <p>Replace with your final operator policy text before production.</p>
      </Container>
    </section>
  );
}
