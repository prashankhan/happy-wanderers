"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, LifeBuoy, MapPin, Phone, ShieldCheck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ContactForm } from "./contact-form";
import { PageHeader } from "@/components/layout/page-header";

export default function ContactPage() {
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } },
  };

  return (
    <div className="bg-brand-surface">
      <PageHeader 
        label="Happy Wanderers"
        title="Contact our team"
        description="We are a small, destination-led team based in Cairns & the Daintree region. Your message is read by humans who run the departures."
        breadcrumb={[{ label: "Contact" }]}
      />

      <Container className="py-20 md:py-28">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto max-w-5xl rounded-md border border-brand-border bg-brand-surface-soft p-8 md:p-14"
        >
          <div className="grid gap-12 md:grid-cols-2">
            <div className="flex gap-5">
              <ShieldCheck className="h-7 w-7 shrink-0 text-brand-primary" aria-hidden />
              <div>
                <p className="font-bold tracking-tight text-xl text-brand-heading">Support Reassurance</p>
                <p className="mt-3 text-sm leading-relaxed text-brand-body/80">
                  We confirm pickup windows and cutoffs against live availability — so the reply you
                  receive matches what the booking engine will honour.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <LifeBuoy className="h-7 w-7 shrink-0 text-brand-primary" aria-hidden />
              <div>
                <p className="font-bold tracking-tight text-xl text-brand-heading">Operator Introduction</p>
                <p className="mt-3 text-sm leading-relaxed text-brand-body/80">
                  Happy Wanderers runs scheduled small-group tours and private rainforest charters with the same field
                  standards. We will route your message to the right guide.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-24 grid gap-16 lg:grid-cols-12 lg:gap-24"
        >
          <motion.div variants={itemVariants} className="lg:col-span-12 lg:mb-12 xl:col-span-5 xl:mb-0">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-brand-heading">Before you write</h2>
            <div className="mt-10 space-y-8 rounded-md border border-brand-border bg-white p-8 shadow-sm">
              <div className="flex gap-4">
                <Clock className="h-6 w-6 shrink-0 text-brand-primary" aria-hidden />
                <div>
                  <p className="font-bold tracking-tight text-brand-heading">Expected Response Time</p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-body">
                    We aim to reply within <span className="font-bold text-brand-heading">one business day</span>. Urgent day-of issues
                    should use the phone number printed on your confirmation.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Phone className="h-6 w-6 shrink-0 text-brand-primary" aria-hidden />
                <div>
                  <p className="font-bold tracking-tight text-brand-heading">Phone Support</p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-body">
                    A direct operations line appears on confirmed itineraries. For new enquiries, email via the form
                    keeps a clear paper trail for both sides.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin className="h-6 w-6 shrink-0 text-brand-primary" aria-hidden />
                <div>
                  <p className="font-bold tracking-tight text-brand-heading">Service Area summary</p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-body">
                    Routes across the Cairns coast, northern beaches, Port Douglas, and Daintree
                    rainforest corridors.
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
