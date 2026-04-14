"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Container } from "@/components/layout/container";

interface CtaSectionProps {
  imageSrc: string;
}

export function CtaSection({ imageSrc }: CtaSectionProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-24 md:py-32">
      <Container>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
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
              variants={itemVariants}
              className="font-serif text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
            >
              Reserve your rainforest day
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-lg leading-relaxed text-white/80 md:text-xl"
            >
              Choose a scheduled departure or speak with us about a private charter — then checkout securely with Stripe.
            </motion.p>
          </div>

          <motion.div 
            variants={itemVariants}
            className="relative z-10 flex w-full shrink-0 flex-col gap-4 sm:flex-row sm:w-auto"
          >
            <Link 
              href="/booking" 
              className="group inline-flex items-center justify-center rounded-sm bg-brand-primary px-10 py-5 text-2xl font-bold tracking-tight text-white transition-all hover:bg-brand-primary-hover hover:shadow-md active:scale-[0.98]"
            >
              Book a tour
            </Link>
            <Link 
              href="/private-tours" 
              className="group inline-flex items-center justify-center rounded-sm border border-white/30 bg-white/5 px-10 py-5 text-2xl font-bold tracking-tight text-white backdrop-blur-sm transition-all hover:bg-white/15 hover:border-white/50 active:scale-[0.98]"
            >
              Private tours
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
