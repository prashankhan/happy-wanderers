import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { PageHeader } from "@/components/layout/page-header";
import { legalH2Class, legalLinkClass } from "@/lib/ui/legal-page-styles";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we handle personal data for bookings and enquiries.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-brand-surface pb-24">
      <PageHeader
        title="Privacy policy"
        description="How we collect, use, and protect personal information when you plan a departure with Happy Wanderers."
        breadcrumb={[{ label: "Privacy" }]}
      />

      <Container className="mt-20">
        <RevealOnView>
          <article className="mx-auto w-full max-w-prose text-center text-lg leading-[1.8] text-brand-body/80 font-medium tracking-tight">
            <div className="space-y-10 text-left">
              <section className="space-y-4">
                <h2 id="scope" className={legalH2Class}>
                  Who this applies to
                </h2>
                <p>
                  This policy describes how Happy Wanderers (“we”, “us”) handles personal information for guests,
                  enquirers, and visitors to this website. It should be read together with our{" "}
                  <Link href="/terms" className={legalLinkClass}>
                    Terms &amp; conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/cancellation-policy" className={legalLinkClass}>
                    Cancellation policy
                  </Link>
                  .
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="collect" className={legalH2Class}>
                  What we collect
                </h2>
                <p>Depending on how you interact with us, we may process:</p>
                <ul className="list-disc space-y-2 pl-5 text-brand-body/85">
                  <li>Identity and contact details (name, email, phone) when you enquire or book.</li>
                  <li>Party composition (adults, children, infants) and pickup selections required for logistics.</li>
                  <li>Messages you send via our contact form or email.</li>
                  <li>
                    Payment references and checkout metadata through our payment provider,{" "}
                    <span className="text-brand-heading font-bold italic underline decoration-brand-primary/30 underline-offset-4">
                      Stripe
                    </span>
                    . We do not store full card numbers on our servers.
                  </li>
                  <li>Basic technical data (such as IP address) for security, abuse prevention, and rate limiting.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 id="use" className={legalH2Class}>
                  How we use information
                </h2>
                <p>We use personal information to:</p>
                <ul className="list-disc space-y-2 pl-5 text-brand-body/85">
                  <li>Operate, confirm, and amend scheduled departures.</li>
                  <li>Send operational messages (confirmations, changes, safety notices) related to your booking.</li>
                  <li>Respond to enquiries and improve our service.</li>
                  <li>Meet legal, safety, and insurance obligations for small-group field operations.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 id="stripe" className={legalH2Class}>
                  Payments (Stripe)
                </h2>
                <p>
                  Card payments are processed by Stripe under their own terms and privacy notice. We receive limited
                  payment outcome data (for example, success or failure, and references) so we can reconcile bookings.
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="retention" className={legalH2Class}>
                  Retention
                </h2>
                <p>
                  We keep booking and contact records for as long as needed to run the business, meet accounting and tax
                  rules, resolve disputes, and support repeat guests. Retention periods may vary by record type.
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="rights" className={legalH2Class}>
                  Access &amp; questions
                </h2>
                <p>
                  You may ask for access to, or correction of, the personal information we hold about you. For privacy
                  requests,{" "}
                  <Link href="/contact" className={legalLinkClass}>
                    contact us
                  </Link>{" "}
                  and we will respond within a reasonable time.
                </p>
              </section>

              <section className="space-y-4">
                <h2 id="changes" className={legalH2Class}>
                  Changes to this policy
                </h2>
                <p>
                  We may update this page from time to time. Material changes will be reflected here with an updated
                  “Last updated” date. Continued use of the site after changes constitutes notice of the update where
                  permitted by law.
                </p>
              </section>

              <section className="space-y-4 border-t border-brand-border pt-8 text-sm leading-relaxed text-brand-body/70">
                <p className="font-bold uppercase tracking-widest text-brand-muted">
                  Last updated: {new Date().toLocaleDateString("en-AU", { month: "long", year: "numeric" })}
                </p>
                <p>
                  This document is provided as a practical summary for guests. It is not tailored legal advice — obtain
                  review from qualified counsel before relying on it as your sole compliance instrument.
                </p>
              </section>
            </div>
          </article>
        </RevealOnView>
      </Container>
    </div>
  );
}
