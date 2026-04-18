import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { PageHeader } from "@/components/layout/page-header";
import { legalH2Class, legalLinkClass } from "@/lib/ui/legal-page-styles";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: "Clarity on refunds, weather procedures, and booking changes.",
};

export default function CancellationPolicyPage() {
  return (
    <div className="bg-brand-surface pb-24">
      <PageHeader
        title="Cancellation policy"
        description="How changes, weather, and refunds are handled before and after you hold a departure date."
        breadcrumb={[{ label: "Cancellation Policy" }]}
      />

      <Container className="mt-20">
        <RevealOnView>
          <article className="mx-auto w-full max-w-prose text-center text-lg leading-[1.8] text-brand-body/80 font-medium tracking-tight">
            <div className="space-y-10 text-left">
              <section className="space-y-4">
                <h2 id="overview" className={legalH2Class}>
                  Overview
                </h2>
                <p>
                  This policy explains how cancellations, deferrals, and refunds work for Happy Wanderers scheduled
                  departures. It works alongside our{" "}
                  <Link href="/terms" className={legalLinkClass}>
                    Terms &amp; conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className={legalLinkClass}>
                    Privacy policy
                  </Link>
                  .
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="guest-changes" className={legalH2Class}>
                  Guest changes before travel
                </h2>
                <p>
                  Small-group logistics depend on accurate headcounts and pickup timing. If you need to change a date,
                  party size, or pickup, contact us as early as possible. We will confirm whether the change is possible
                  under remaining capacity and cutoff rules for that tour.
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="operator" className={legalH2Class}>
                  Operator cancellations &amp; weather
                </h2>
                <p>
                  We may postpone or cancel a departure when field conditions, safety, access restrictions, or minimum
                  numbers require it. When we cancel, we will offer a fair remedy (such as rescheduling or refund) in
                  line with the commercial snapshot stored at checkout and the rules that applied to your booking.
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="refunds" className={legalH2Class}>
                  Refunds &amp; Stripe
                </h2>
                <p>
                  Confirmed payments are processed through{" "}
                  <span className="text-brand-heading font-bold italic underline decoration-brand-primary/30 underline-offset-4">
                    Stripe
                  </span>
                  . Where a refund is due, timing may depend on Stripe and your card issuer — we initiate eligible
                  refunds from our side as soon as operational checks are complete.
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="no-show" className={legalH2Class}>
                  No-shows &amp; late arrivals
                </h2>
                <p>
                  If you miss a confirmed pickup window without prior agreement, the booking may be treated as a
                  no-show and fees may apply. Always refer to your confirmation for the exact pickup reference and time.
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="reference" className={legalH2Class}>
                  Your confirmation
                </h2>
                <p>
                  Always refer to your <strong className="text-brand-heading">official itinerary confirmation</strong>{" "}
                  for the booking reference used in support conversations. That document reflects the departure you
                  purchased.
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="contact" className={legalH2Class}>
                  Contact
                </h2>
                <p>
                  For change requests or policy questions,{" "}
                  <Link href="/contact" className={legalLinkClass}>
                    contact our team
                  </Link>{" "}
                  with your confirmation reference in the subject or message body.
                </p>
              </section>

              <section className="space-y-4 border-t border-brand-border pt-8 text-sm leading-relaxed text-brand-body/70">
                <p className="font-bold uppercase tracking-widest text-brand-muted">
                  Last updated: {new Date().toLocaleDateString("en-AU", { month: "long", year: "numeric" })}
                </p>
                <p>
                  Cut-off times and fee schedules may vary by tour or season. This page is a general guide — your
                  confirmation and any written agreement from our team take precedence where they differ.
                </p>
              </section>
            </div>
          </article>
        </RevealOnView>
      </Container>
    </div>
  );
}
