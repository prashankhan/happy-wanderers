"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Container } from "@/components/layout/container";
import { publicRevealEase } from "@/lib/motion/public-reveal";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export function PageHeader({ title, description, breadcrumb }: PageHeaderProps) {
  return (
    <header className="bg-brand-surface-soft border-b border-brand-border overflow-hidden">
      <Container className="relative py-14 md:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: publicRevealEase }}
          className="mx-auto max-w-5xl text-center"
        >
          {/* Breadcrumbs */}
          {breadcrumb && (
            <nav className="mb-8 flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-brand-body/45 md:mb-10">
              <Link href="/" className="transition-colors hover:text-brand-primary">
                Home
              </Link>
              {breadcrumb.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="opacity-35">·</span>
                  {item.href ? (
                    <Link href={item.href} className="transition-colors hover:text-brand-primary">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-brand-body/60">{item.label}</span>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* Page Narrative */}
          <h1 className="mx-auto max-w-[14ch] font-serif text-3xl font-semibold tracking-tight text-brand-heading md:text-5xl lg:text-6xl lg:leading-[1.1]">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mt-6 max-w-3xl text-base font-normal leading-relaxed text-brand-body/75 md:mt-8 md:text-xl">
              {description}
            </p>
          )}
        </motion.div>

        {/* Subtle architectural framing */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/35 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/20 to-transparent"
          aria-hidden
        />
      </Container>
    </header>
  );
}
