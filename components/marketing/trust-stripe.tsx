"use client";

import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { Container } from "@/components/layout/container";

const TRUST_CHIPS = [
  "Secure booking",
  "Local operators",
  "Instant confirmation",
  "Real-time availability"
];

export function TrustStripe() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative overflow-hidden border-y border-brand-border bg-brand-surface-soft py-14 md:py-16">
      <Container>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-16 md:grid-cols-3 md:gap-x-20"
        >
          {/* Step 1 */}
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white font-bold text-xl">
              1
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-brand-heading">
              Choose your path
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-brand-body/90">
              Browse our curated Signature Departures or request a bespoke Private Charter.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white font-bold text-xl">
              2
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-brand-heading">
              Secure your date
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-brand-body/90">
              Check real-time availability and checkout securely with instant confirmation.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white font-bold text-xl">
              3
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-brand-heading">
              Wander with us
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-brand-body/90">
              Meet your senior naturalist guide and experience the rainforest as it was meant to be told.
            </p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
