import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-green-700">
              {hasSessionToken ? "Thank you" : "Booking status pending"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            {hasSessionToken ? (
              <p>
                Your payment is processing.{" "}
                <strong>Confirmation is sent after our payment provider confirms</strong> — please
                check your inbox for your reference number and pickup details.
              </p>
            ) : (
              <p>
                We could not verify your checkout session from this page load. If you just completed
                payment, please wait a moment and check your inbox for confirmation.
              </p>
            )}
            {hasSessionToken ? (
              <p className="text-xs text-gray-500">
                Checkout session: <span className="font-mono">{sessionId}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                If you were not redirected from checkout, return to booking and try again.
              </p>
            )}
            <p className="text-xs text-gray-500">
              If you closed this window early, your booking may remain pending until the hold expires.
            </p>
            <Link href="/booking" className="inline-block text-sm font-medium text-blue-900 hover:underline">
              Back to booking
            </Link>
            <Link href="/tours" className="inline-block text-sm font-medium text-blue-900 hover:underline">
              Back to tours
            </Link>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
