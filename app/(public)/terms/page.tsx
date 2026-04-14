import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Standard terms and conditions for our rainforest departures and booking platform.",
};

export default function TermsPage() {
  return (
    <div className="bg-brand-surface pb-24">
      <PageHeader 
        label="Legal"
        title="Terms & conditions"
        description="The foundation of our service—accuracy in booking, safety in the field, and operator discipline."
        breadcrumb={[{ label: "Terms" }]}
      />
      
      <Container className="mt-20">
        <article className="max-w-3xl space-y-10 text-lg leading-[1.8] text-brand-body/80 font-medium tracking-tight">
          <p>
            By using this site you agree to provide accurate booking information and to comply with all safety briefings on
             the day of travel. Availability and pricing shown at checkout creation are authoritative for that session;
            confirmed bookings store <span className="text-brand-heading font-bold italic underline decoration-brand-primary/30 underline-offset-4">immutable snapshots</span> of the agreement.
          </p>
          <p>
            Please note that as a small-group specialist, our field logistics are tailored to specific passenger counts. Changes 
            should be requested early to ensure we can meet our service standards.
          </p>
          <div className="pt-8 border-t border-brand-border">
             <p className="text-sm font-bold uppercase tracking-widest text-brand-muted">Last updated: {new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</p>
          </div>
        </article>
      </Container>
    </div>
  );
}
