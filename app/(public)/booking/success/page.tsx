import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Booking received",
  robots: { index: false, follow: false },
};

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : undefined;
  const hasSessionToken = Boolean(sessionId && sessionId.startsWith("cs_"));

  return (
    <section className="py-24">
      <Container className="max-w-xl">
        <RevealOnView>
          <Card>
            <CardHeader>
              <CardTitle
                className={cn(
                  "font-serif text-2xl",
                  hasSessionToken ? "text-availability-open" : "text-brand-heading"
                )}
              >
                {hasSessionToken ? "Thank you" : "Booking status pending"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-brand-body">
              {hasSessionToken ? (
                <p>
                  Your payment is processing.{" "}
                  <strong className="text-brand-heading">
                    Confirmation is sent after our payment provider confirms
                  </strong>{" "}
                  — please check your inbox for your reference number and pickup details.
                </p>
              ) : (
                <p>
                  We could not verify your checkout session from this page load. If you just completed
                  payment, please wait a moment and check your inbox for confirmation.
                </p>
              )}
              {hasSessionToken ? (
                <p className="text-xs text-brand-muted">
                  Checkout session: <span className="font-mono text-brand-body">{sessionId}</span>
                </p>
              ) : (
                <p className="text-xs text-brand-muted">
                  If you were not redirected from checkout, return to booking and try again.
                </p>
              )}
              <p className="text-xs text-brand-muted">
                If you closed this window early, your booking may remain pending until the hold expires.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                <Link
                  href="/booking"
                  className="text-sm font-semibold text-brand-primary transition hover:underline"
                >
                  Back to booking
                </Link>
                <Link
                  href="/tours"
                  className="text-sm font-semibold text-brand-primary transition hover:underline"
                >
                  Back to tours
                </Link>
              </div>
            </CardContent>
          </Card>
        </RevealOnView>
      </Container>
    </section>
  );
}
