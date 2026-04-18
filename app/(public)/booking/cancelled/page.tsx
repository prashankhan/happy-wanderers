import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  robots: { index: false, follow: false },
};

export default async function BookingCancelledPage() {
  return (
    <section className="py-24">
      <Container className="max-w-xl">
        <RevealOnView>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-brand-heading">Checkout cancelled</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-brand-body">
              <p>
                No charge was completed. Your pending hold may expire — you can restart booking anytime.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="primary">
                  <Link href="/booking">Try again</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/contact">Contact support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </RevealOnView>
      </Container>
    </section>
  );
}
