"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { publicRevealItem, publicRevealParent, publicRevealViewport } from "@/lib/motion/public-reveal";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";

interface CtaSectionProps {
  imageSrc: string;
}

export function CtaSection({ imageSrc }: CtaSectionProps) {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <motion.div
          variants={publicRevealParent}
          initial="hidden"
          whileInView="show"
          viewport={publicRevealViewport}
          className="relative flex flex-col items-start justify-between gap-12 overflow-hidden rounded-md bg-brand-heading px-8 py-16 text-white shadow-2xl ring-1 ring-white/10 md:flex-row md:items-center md:px-14 lg:py-24"
        >
          {/* Immersive background overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-cover opacity-30 blur-sm scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-heading/80 via-brand-heading/70 to-brand-accent/60" />
          </div>

          <div className="relative z-10 max-w-xl space-y-6">
            <motion.h2
              variants={publicRevealItem}
              className="font-serif text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
            >
              Reserve your rainforest day
            </motion.h2>
            <motion.p
              variants={publicRevealItem}
              className="text-lg leading-relaxed text-white/80 md:text-xl"
            >
              Pick a departure that suits you, then checkout securely with Stripe. Prefer to chat first? We reply
              personally — no automated scripts.
            </motion.p>
          </div>

          <motion.div
            variants={publicRevealItem}
            className="relative z-10 flex w-full shrink-0 flex-col gap-4 sm:flex-row sm:w-auto"
          >
            <Button asChild variant="primary" className={primaryTourCtaClassName}>
              <Link href="/booking">Book a tour</Link>
            </Button>
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center rounded-sm border border-white/30 bg-white/5 px-8 py-3 text-base font-bold tracking-tight text-white backdrop-blur-sm transition-all hover:bg-white/15 hover:border-white/50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-heading md:py-3.5 md:text-lg"
            >
              Contact us
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
