"use client";

import { motion, Variants } from "framer-motion";
import { MapPin, Users, Shield, Sunrise } from "lucide-react";
import { Container } from "@/components/layout/container";

const credibility = [
  { line1: "Local expert", line2: "guides", icon: MapPin },
  { line1: "Small-group", line2: "experiences", icon: Users },
  { line1: "Flexible booking", line2: "policies", icon: Shield },
  { line1: "Real-time", line2: "availability", icon: Sunrise },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 60, damping: 15 },
  },
};

export function CredibilityBar() {
  return (
    <section className="border-b border-brand-border bg-brand-surface-soft py-16 md:py-24">
      <Container>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="flex flex-wrap items-start justify-center gap-x-12 gap-y-12 md:justify-between lg:gap-x-16"
        >
          {credibility.map(({ line1, line2, icon: Icon }) => (
            <motion.div
              key={line1}
              variants={itemVariants}
              className="flex max-w-[240px] flex-col items-center gap-5 text-center"
            >
              <Icon className="h-12 w-12 text-brand-primary" aria-hidden />
              <span className="text-2xl font-semibold tracking-tight text-brand-heading">
                {line1}<br />{line2}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
