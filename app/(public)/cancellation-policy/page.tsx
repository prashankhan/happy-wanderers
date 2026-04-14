import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: "Clarity on refunds, weather procedures, and booking changes.",
};

export default function CancellationPolicyPage() {
  return (
    <div className="bg-brand-surface pb-24">
      <PageHeader 
        label="Legal"
        title="Cancellation policy"
        description="Transparent rules for weather events, scheduling shifts, and passenger changes."
        breadcrumb={[{ label: "Cancellation Policy" }]}
      />
      
      <Container className="mt-20">
        <article className="max-w-3xl space-y-10 text-lg leading-[1.8] text-brand-body/80 font-medium tracking-tight">
          <p>
            Cancellations, weather procedures, and refund windows are managed directly by our operator team. Confirmed bookings may be
            cancelled or refunded in line with <span className="text-brand-heading font-bold italic underline decoration-brand-primary/30 underline-offset-4">Stripe</span> events and automated workflows.
          </p>
          <p>
             Always refer to your <strong>official itinerary confirmation</strong> for the specific reference ID used in all support conversations. We prioritise flexibility where field conditions allow, but firm cutoffs apply to ensure departure standards for all guests.
          </p>
          <div className="pt-8 border-t border-brand-border">
             <p className="text-sm font-bold uppercase tracking-widest text-brand-muted">Last updated: {new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</p>
          </div>
        </article>
      </Container>
    </div>
  );
}
