import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <section className="bg-brand-surface-soft/30 py-16 md:py-24">
      <Container className="max-w-xl">
        <Card className="rounded-sm border-brand-border shadow-lg shadow-brand-heading/5 ring-1 ring-brand-heading/5">
          <CardHeader className="mb-2 space-y-2">
            <CardTitle
              className={cn(
                "font-serif text-3xl md:text-4xl",
                hasSessionToken ? "text-availability-open" : "text-brand-heading"
              )}
            >
              {hasSessionToken ? "Thank you" : "Booking status pending"}
            </CardTitle>
            <CardDescription>
              {hasSessionToken
                ? "Your checkout was received successfully."
                : "We could not validate checkout details from this page load."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-5 text-sm text-brand-body">
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
                We could not verify your checkout session from this page load. If you just completed payment,
                please wait a moment and check your inbox for confirmation.
              </p>
            )}
            {!hasSessionToken ? (
              <p className="text-xs text-brand-muted">
                If you were not redirected from checkout, return to booking and try again.
              </p>
            ) : null}
            <p className="text-xs text-brand-muted">
              If you closed this window early, your booking may remain pending until the hold expires.
            </p>
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
              <Button asChild variant="primary" className="h-12 w-full px-8 text-base font-bold tracking-tighter">
                <Link href="/booking">Back to booking</Link>
              </Button>
              <Button asChild variant="secondary" className="w-full text-base font-bold tracking-tighter">
                <Link href="/tours">Back to tours</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
