"use client";

import { motion } from "framer-motion";
import { MapPin, Users, Shield, Sunrise } from "lucide-react";

import { Container } from "@/components/layout/container";
import { publicRevealItem, publicRevealParentTight, publicRevealViewport } from "@/lib/motion/public-reveal";

const credibility = [
  { line1: "Local expert", line2: "guides", icon: MapPin },
  { line1: "Small-group", line2: "experiences", icon: Users },
  { line1: "Flexible booking", line2: "policies", icon: Shield },
  { line1: "Real-time", line2: "availability", icon: Sunrise },
];

export function CredibilityBar() {
  return (
    <section className="border-b border-brand-border bg-brand-surface-soft py-16 md:py-24">
      <Container>
        <motion.div
          variants={publicRevealParentTight}
          initial="hidden"
          whileInView="show"
          viewport={publicRevealViewport}
          className="flex flex-col items-center gap-12 md:flex-row md:flex-wrap md:items-start md:justify-between lg:justify-between"
        >
          {credibility.map(({ line1, line2, icon: Icon }) => (
            <motion.div
              key={line1}
              variants={publicRevealItem}
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
