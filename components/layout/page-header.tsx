"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Container } from "@/components/layout/container";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export function PageHeader({ title, description, breadcrumb }: PageHeaderProps) {
  return (
    <header className="bg-white border-b border-brand-border overflow-hidden">
      <Container className="py-16 md:py-24 lg:py-28 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto text-center"
        >
          {/* Breadcrumbs */}
          {breadcrumb && (
            <nav className="mb-12 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-[0.25em] text-brand-body/40">
              <Link href="/" className="transition hover:text-brand-primary">Home</Link>
              {breadcrumb.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="opacity-50">/</span>
                  {item.href ? (
                    <Link href={item.href} className="transition hover:text-brand-primary">
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
          <h1 className="font-serif text-5xl font-bold tracking-tighter text-brand-heading md:text-6xl lg:text-7xl lg:leading-[1.1]">
            {title}
          </h1>
          {description && (
            <p className="mt-12 mx-auto max-w-3xl text-xl font-medium leading-relaxed tracking-tight text-brand-body/70 md:text-3xl">
              {description}
            </p>
          )}
        </motion.div>
        
        {/* Subtle architectural background detail */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-surface-soft/50 to-transparent pointer-events-none" />
      </Container>
    </header>
  );
}
