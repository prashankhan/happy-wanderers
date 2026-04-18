"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { publicRevealEase, publicRevealItem, publicRevealParent, publicRevealViewport } from "@/lib/motion/public-reveal";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";

interface DestinationShowcaseProps {
  imageSrc: string;
}

export function DestinationShowcase({ imageSrc }: DestinationShowcaseProps) {
  return (
    <section className="relative overflow-hidden border-y border-brand-border bg-gradient-to-b from-brand-surface via-brand-surface-soft to-brand-surface py-24 md:py-32">
      <Container className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
        {/* Visual Column */}
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={publicRevealViewport}
          transition={{ duration: 0.72, ease: publicRevealEase }}
          className="group relative aspect-[4/5] max-h-[640px] overflow-hidden rounded-md bg-brand-border ring-1 ring-brand-heading/5"
        >
          <Image
            src={imageSrc}
            alt="North Queensland rainforest canopy"
            fill
            className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
            sizes="(max-width:1024px) 100vw, 50vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-80" />
          
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={publicRevealViewport}
            transition={{ duration: 0.58, ease: publicRevealEase, delay: 0.35 }}
            className="absolute bottom-8 left-8 right-8"
          >
            <p className="text-sm font-medium leading-relaxed text-white/90 md:text-base lg:max-w-[90%]">
              Where two World Heritage areas breathe together — reef air on the breeze and ancient canopy overhead.
            </p>
          </motion.div>
        </motion.div>

        {/* Content Column */}
        <motion.div
          variants={publicRevealParent}
          initial="hidden"
          whileInView="show"
          viewport={publicRevealViewport}
          className="flex flex-col space-y-8"
        >
          <motion.div variants={publicRevealItem} className="space-y-4">
            <p className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
              Destination
            </p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-heading md:text-4xl lg:text-5xl lg:leading-[1.15]">
              North Queensland, told through the forest floor
            </h2>
          </motion.div>

          <motion.div variants={publicRevealItem} className="max-w-prose space-y-6 text-base leading-[1.8] text-brand-body/90 md:text-lg">
            <p>
              The Wet Tropics is not a theme park — it is a climate archive written in leaves, roots, and seasonal
              sound. We design departures around light angles, creek behaviour, and the rhythms of wildlife, so your
              day feels authored by the landscape — not rushed through it.
            </p>
            <p>
              From Cairns pickups to Daintree access corridors, our guides carry deep place knowledge and the calm
              authority guests expect from a luxury field operation.
            </p>
          </motion.div>

          <motion.div variants={publicRevealItem} className="pt-4">
            <Button asChild variant="primary" className={primaryTourCtaClassName}>
              <Link href="/tours">Explore our journeys</Link>
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
