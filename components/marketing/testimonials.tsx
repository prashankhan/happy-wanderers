import { Quote } from "lucide-react";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils/cn";

/** Placeholder structure — swap for CMS / DB when available. */
export interface TestimonialItem {
  id: string;
  quote: string;
  attribution: string;
  context?: string;
}

const PLACEHOLDER_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "1",
    quote:
      "Placeholder — verified guest quotes will appear here. Until then, ask our team for recent departure notes.",
    attribution: "Guest feedback",
    context: "Coming soon",
  },
  {
    id: "2",
    quote:
      "We are building a testimonial library from confirmed departures. Same-day pacing, pickup clarity, and guide tone matter most to us.",
    attribution: "Operator note",
    context: "Editorial preview",
  },
  {
    id: "3",
    quote:
      "Luxury, for us, is silence on the trail when it counts — and confidence in the logistics before you leave the hotel.",
    attribution: "Happy Wanderers",
    context: "Experience promise",
  },
];

export interface TestimonialStripProps {
  heading?: string;
  intro?: string | null;
  items?: TestimonialItem[];
  variant?: "default" | "compact";
  className?: string;
}

export function TestimonialStrip({
  heading = "What guests say",
  intro = "Verified stories from the rainforest — our testimonial wall is in progress.",
  items = PLACEHOLDER_TESTIMONIALS,
  variant = "default",
  className,
}: TestimonialStripProps) {
  const isCompact = variant === "compact";

  const inner = (
    <>
      {!isCompact ? (
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-brand-heading md:text-4xl">{heading}</h2>
          {intro ? <p className="mt-4 text-lg leading-relaxed text-brand-body">{intro}</p> : null}
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-semibold text-brand-heading">{heading}</h2>
          {intro ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-body">{intro}</p> : null}
        </div>
      )}
      <div
        className={cn(
          "grid gap-8",
          items.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {items.map((t) => (
          <figure
            key={t.id}
            className="flex h-full flex-col rounded-2xl border border-brand-border bg-gradient-to-b from-brand-surface-soft to-brand-surface p-8 shadow-sm ring-1 ring-brand-heading/[0.03] transition duration-300 hover:shadow-md"
          >
            <Quote className="h-8 w-8 text-brand-gold/80" aria-hidden />
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-brand-body md:text-base">
              <p className="italic">&ldquo;{t.quote}&rdquo;</p>
            </blockquote>
            <figcaption className="mt-6 border-t border-brand-border pt-4 text-sm">
              <span className="font-semibold text-brand-heading">{t.attribution}</span>
              {t.context ? (
                <span className="mt-1 block text-xs font-medium uppercase tracking-wide text-brand-muted">
                  {t.context}
                </span>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );

  if (isCompact) {
    return (
      <section className={cn("py-16", className)}>
        <div className="max-w-4xl">{inner}</div>
      </section>
    );
  }

  return (
    <section className={cn("border-t border-brand-border bg-brand-surface-warm py-24 md:py-28", className)}>
      <Container>{inner}</Container>
    </section>
  );
}
