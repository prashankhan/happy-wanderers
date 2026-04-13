import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Mail, MapPin } from "lucide-react";

import { Container } from "@/components/layout/container";
import { brandLogoPath } from "@/lib/branding";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-border bg-brand-surface-soft py-20 md:py-24">
      <Container className="grid gap-14 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-4">
          <Image
            src={brandLogoPath}
            alt="Happy Wanderers"
            width={180}
            height={50}
            className="h-9 w-auto max-w-[160px] object-contain object-left"
          />
          <p className="max-w-md text-sm leading-relaxed text-brand-body">
            Premium rainforest experiences across{" "}
            <span className="font-medium text-brand-heading">Cairns, Port Douglas &amp; the Daintree</span> — scheduled
            departures, private charters, and transparent live availability.
          </p>
          <div className="flex flex-wrap gap-3 text-xs font-medium text-brand-body">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 shadow-sm">
              <BadgeCheck className="h-3.5 w-3.5 text-availability-open" aria-hidden />
              Secure booking
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 shadow-sm">
              <MapPin className="h-3.5 w-3.5 text-brand-accent" aria-hidden />
              Local operators
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 shadow-sm">
              <BadgeCheck className="h-3.5 w-3.5 text-brand-gold" aria-hidden />
              Instant confirmation
            </span>
          </div>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-3">
          <div className="space-y-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-heading">Explore</p>
            <ul className="space-y-3 text-brand-muted">
              <li>
                <Link href="/tours" className="transition hover:text-brand-accent hover:underline">
                  Tours
                </Link>
              </li>
              <li>
                <Link href="/availability" className="transition hover:text-brand-accent hover:underline">
                  Availability
                </Link>
              </li>
              <li>
                <Link href="/private-tours" className="transition hover:text-brand-accent hover:underline">
                  Private tours
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition hover:text-brand-accent hover:underline">
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-heading">Policies</p>
            <ul className="space-y-3 text-brand-muted">
              <li>
                <Link href="/privacy" className="transition hover:text-brand-accent hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-brand-accent hover:underline">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/cancellation-policy" className="transition hover:text-brand-accent hover:underline">
                  Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-heading">Contact</p>
            <ul className="space-y-3 text-brand-muted">
              <li>
                <Link href="/contact" className="transition hover:text-brand-accent hover:underline">
                  Contact form
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-sm lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-heading">Quick contact</p>
          <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-brand-body">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" aria-hidden />
            <span>
              Bespoke departures, accessibility, and day-of coordination — reach us via the{" "}
              <Link href="/contact" className="font-medium text-brand-accent underline-offset-2 hover:underline">
                contact form
              </Link>
              . We read every message.
            </span>
          </p>
        </div>
      </Container>

      <Container className="mt-16 border-t border-brand-border pt-8">
        <p className="text-center text-xs leading-relaxed text-brand-muted">
          © {year} Happy Wanderers · Rainforest tours · Cairns &amp; Daintree region · ABN on request.
        </p>
      </Container>
    </footer>
  );
}
