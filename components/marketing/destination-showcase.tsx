"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Container } from "@/components/layout/container";

interface DestinationShowcaseProps {
  imageSrc: string;
}

export function DestinationShowcase({ imageSrc }: DestinationShowcaseProps) {
  // Stagger variants for the text content
  const contentVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative overflow-hidden border-y border-brand-border bg-gradient-to-b from-brand-surface via-brand-surface-soft to-brand-surface py-24 md:py-32">
      <Container className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
        {/* Visual Column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: -30 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="absolute bottom-8 left-8 right-8"
          >
            <p className="text-sm font-medium leading-relaxed text-white/90 md:text-base lg:max-w-[90%]">
              Where two World Heritage areas breathe together — reef air on the breeze and ancient canopy overhead.
            </p>
          </motion.div>
        </motion.div>

        {/* Content Column */}
        <motion.div
          variants={contentVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="flex flex-col space-y-8"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <p className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
              Destination
            </p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-heading md:text-4xl lg:text-5xl lg:leading-[1.15]">
              North Queensland, told through the forest floor
            </h2>
          </motion.div>

          <motion.div variants={itemVariants} className="max-w-prose space-y-6 text-base leading-[1.8] text-brand-body/90 md:text-lg">
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

          <motion.div variants={itemVariants} className="pt-4">
            <Link 
              href="/tours" 
              className="inline-flex items-center justify-center rounded-sm bg-brand-primary px-14 py-5 text-2xl font-bold tracking-tight text-white transition-all hover:bg-brand-primary-hover hover:shadow-md active:scale-[0.98]"
            >
              Explore our journeys
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
