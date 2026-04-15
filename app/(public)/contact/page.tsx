"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Clock, LifeBuoy, MapPin, Phone, ShieldCheck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ContactForm } from "./contact-form";
import { PageHeader } from "@/components/layout/page-header";

export default function ContactPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } },
  };

  return (
    <div className="bg-brand-surface">
      <PageHeader 
        title="Contact our team"
        description="We are a small, destination-led team based in Cairns & the Daintree region. Your message is read by humans who run the departures."
        breadcrumb={[{ label: "Contact" }]}
      />

      <Container className="py-24 md:py-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mx-auto max-w-5xl rounded-md border border-brand-border/40 bg-brand-surface-soft p-10 md:p-16"
        >
          <div className="grid gap-16 md:grid-cols-2">
            <div className="flex gap-6">
              <ShieldCheck className="h-8 w-8 shrink-0 text-brand-primary" aria-hidden />
              <div>
                <p className="font-bold tracking-tight text-2xl text-brand-heading">Support assurance</p>
                <p className="mt-4 text-sm leading-[1.6] text-brand-body/70 font-medium">
                  We confirm pickup windows against live field capacity — ensuring the reply you receive matches the real-time operational state of our departures.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <LifeBuoy className="h-8 w-8 shrink-0 text-brand-primary" aria-hidden />
              <div>
                <p className="font-bold tracking-tight text-2xl text-brand-heading">Operator knowledge</p>
                <p className="mt-4 text-sm leading-[1.6] text-brand-body/70 font-medium">
                  Happy Wanderers is an active operator, not a reseller. Your message goes directly to the team who manages the vehicles and the guides in the field.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-32 grid gap-20 lg:grid-cols-12 lg:gap-32"
        >
          <motion.div variants={itemVariants} className="lg:col-span-12 lg:mb-12 xl:col-span-5 xl:mb-0">
            <h2 className="font-serif text-5xl font-bold tracking-tight text-brand-heading md:text-6xl italic">Before you write</h2>
            <div className="mt-12 space-y-10 rounded-md border border-brand-border/60 bg-white p-10 shadow-sm">
              <div className="flex gap-5">
                <Clock className="h-6 w-6 shrink-0 text-brand-primary" aria-hidden />
                <div>
                  <p className="font-bold tracking-tight text-xl text-brand-heading">Field response time</p>
                  <p className="mt-3 text-base leading-relaxed text-brand-body/80">
                    We aims to reply within <span className="font-bold text-brand-heading tracking-tight">one business day</span>. Our team is often in areas of low connectivity during daylight hours.
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <Phone className="h-6 w-6 shrink-0 text-brand-primary" aria-hidden />
                <div>
                  <p className="font-bold tracking-tight text-xl text-brand-heading">Booking numbers</p>
                  <p className="mt-3 text-base leading-relaxed text-brand-body/80">
                    A direct operations line is provided to all confirmed guests. For new enquiries, we recommend the form for clear audit trails.
                  </p>
                </div>
              </div>
            </div>
            
            <Link 
              href="/private-tours"
              className="mt-10 inline-flex items-center justify-center rounded-md border border-brand-border bg-white px-10 py-3.5 text-xl font-bold tracking-tight text-brand-heading transition-all hover:bg-brand-surface-soft active:scale-[0.98]"
            >
              Private tour enquiries
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-md border border-brand-border bg-white p-8 shadow-xl lg:col-span-12 xl:col-span-7 xl:p-14">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-brand-heading">Send a message</h2>
            <p className="mt-4 text-base text-brand-body/60 font-medium tracking-tight">
              Required fields help us answer in one pass. We never sell your details — see our{" "}
              <Link href="/privacy" className="font-bold text-brand-primary underline underline-offset-4 decoration-brand-primary/30 hover:text-brand-primary-hover">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="mt-12">
              <ContactForm />
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
}
