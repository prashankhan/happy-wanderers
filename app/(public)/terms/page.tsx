import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { PageHeader } from "@/components/layout/page-header";
import { legalH2Class, legalLinkClass } from "@/lib/ui/legal-page-styles";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Standard terms and conditions for our rainforest departures and booking platform.",
};

export default function TermsPage() {
  return (
    <div className="bg-brand-surface pb-24">
      <PageHeader
        title="Terms & conditions"
        description="The rules that apply when you browse this site, hold a date, or travel with us in the field."
        breadcrumb={[{ label: "Terms" }]}
      />

      <Container className="mt-20">
        <RevealOnView>
          <article className="mx-auto w-full max-w-prose text-center text-lg leading-[1.8] text-brand-body/80 font-medium tracking-tight">
            <div className="space-y-10 text-left">
              <section className="space-y-4">
                <h2 id="agreement" className={legalH2Class}>
                  Agreement
                </h2>
                <p>
                  By using this website or completing a booking, you agree to these terms, our{" "}
                  <Link href="/privacy" className={legalLinkClass}>
                    Privacy policy
                  </Link>
                  , and our{" "}
                  <Link href="/cancellation-policy" className={legalLinkClass}>
                    Cancellation policy
                  </Link>
                  .
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="accuracy" className={legalH2Class}>
                  Accurate information
                </h2>
                <p>
                  You agree to provide accurate guest names, contact details, party sizes, and pickup selections. We
                  size vehicles, guides, and departure windows from the information you supply — errors can affect
                  availability for other guests.
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="bookings" className={legalH2Class}>
                  Bookings &amp; pricing snapshots
                </h2>
                <p>
                  Availability and pricing shown at checkout are authoritative for that session. A confirmed booking
                  stores an{" "}
                  <span className="text-brand-heading font-bold italic underline decoration-brand-primary/30 underline-offset-4">
                    immutable snapshot
                  </span>{" "}
                  of the commercial terms accepted at payment, including passenger counts and pickup context, so both
                  parties share the same operational record.
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="changes" className={legalH2Class}>
                  Changes &amp; cancellations
                </h2>
                <p>
                  Guest- and operator-led changes (including weather or capacity decisions) are governed by our{" "}
                  <Link href="/cancellation-policy" className={legalLinkClass}>
                    Cancellation policy
                  </Link>
                  . Where those rules allow fees or forfeits, you authorise us to process them in line with our payment
                  provider&apos;s capabilities.
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="conduct" className={legalH2Class}>
                  Safety &amp; conduct
                </h2>
                <p>
                  You agree to follow guide instructions, vehicle rules, and park or land-manager requirements. We may
                  refuse service or adjust an itinerary where safety, law, or conservation rules require it.
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="liability" className={legalH2Class}>
                  Liability (summary)
                </h2>
                <p>
                  To the extent permitted by Australian law, we limit liability for issues arising from factors outside
                  our reasonable control (including weather, road closures, third-party operators, or guest
                  non-compliance with safety briefings). Nothing in these terms excludes non-waivable consumer
                  guarantees.
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="contact" className={legalH2Class}>
                  Contact
                </h2>
                <p>
                  Questions about these terms?{" "}
                  <Link href="/contact" className={legalLinkClass}>
                    Reach our team
                  </Link>{" "}
                  or review your confirmation email for operational contact paths.
                </p>
              </section>

              <section className="space-y-4 border-t border-brand-border pt-8 text-sm leading-relaxed text-brand-body/70">
                <p className="font-bold uppercase tracking-widest text-brand-muted">
                  Last updated: {new Date().toLocaleDateString("en-AU", { month: "long", year: "numeric" })}
                </p>
                <p>
                  These terms are a practical guest-facing summary. Have them reviewed by qualified counsel for your
                  jurisdiction and product before treating them as exhaustive.
                </p>
              </section>
            </div>
          </article>
        </RevealOnView>
      </Container>
    </div>
  );
}
