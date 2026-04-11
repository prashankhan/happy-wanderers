import type { Metadata } from "next";

import { Container } from "@/components/layout/container";

import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach our team for bespoke departures, accessibility needs, or booking assistance.",
};

export default function ContactPage() {
  return (
    <section className="py-20">
      <Container className="max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold text-gray-900 md:text-5xl">Contact</h1>
        <p className="mt-4 text-gray-600">
          We read every message. For urgent day-of coordination, please call the number on your confirmation once
          issued.
        </p>
        <div className="mt-10">
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
