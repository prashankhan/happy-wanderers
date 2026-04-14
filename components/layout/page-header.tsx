"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Container } from "@/components/layout/container";

interface PageHeaderProps {
  label: string;
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export function PageHeader({ label, title, description, breadcrumb }: PageHeaderProps) {
  return (
    <header className="bg-white border-b border-brand-border overflow-hidden">
      <Container className="py-16 md:py-24 lg:py-28 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          {/* Breadcrumbs */}
          {breadcrumb && (
            <nav className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-body/30">
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
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-primary">{label}</p>
          <h1 className="mt-8 font-serif text-5xl font-bold tracking-tighter text-brand-heading md:text-7xl lg:text-8xl lg:leading-[1.05]">
            {title}
          </h1>
          {description && (
            <p className="mt-10 max-w-2xl text-xl font-medium leading-relaxed tracking-tight text-brand-body/70 md:text-2xl">
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
