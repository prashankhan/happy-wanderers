import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we handled personal data for bookings and enquiries.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-brand-surface pb-24">
      <PageHeader 
        title="Privacy policy"
        description="A clear summary of how we handle personal data for departures, logistics, and enquiries."
        breadcrumb={[{ label: "Privacy" }]}
      />
      
      <Container className="mt-20">
        <article className="max-w-3xl space-y-10 text-lg leading-[1.8] text-brand-body/80 font-medium tracking-tight">
          <p>
            We collect the information required to operate bookings securely — names, contact details, passenger counts, and
            payment references processed exclusively by <span className="text-brand-heading font-bold italic underline decoration-brand-primary/30 underline-offset-4">Stripe</span>. Data is used solely to fulfil your tour, send transactional emails, and
            meet certified operator obligations.
          </p>
          <p>
            For questions, contact the operator using details published on the contact page. This page is a concise
            summary; align final copy with your legal counsel before production launch.
          </p>
          <div className="pt-8 border-t border-brand-border">
             <p className="text-sm font-bold uppercase tracking-widest text-brand-muted">Last updated: {new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</p>
          </div>
        </article>
      </Container>
    </div>
  );
}
