import type { Metadata } from "next";
import { Suspense } from "react";

import { BookingLoading } from "./booking-loading";
import { BookingPageContent } from "./booking-page-content";

export const metadata: Metadata = {
  title: "Book",
  description: "Complete your rainforest tour booking with live availability and secure Stripe checkout.",
};

export default function BookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<BookingLoading />}>
      <BookingPageContent searchParams={searchParams} />
    </Suspense>
  );
}
