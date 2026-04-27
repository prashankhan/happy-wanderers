"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { Button } from "@/components/ui/button";
import { HOME_MARKETING_PRIVATE_TOURS_SHOWCASE_PATH } from "@/lib/ui/home-marketing";
import { publicRevealEase, publicRevealItem, publicRevealParent, publicRevealViewport } from "@/lib/motion/public-reveal";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";
import { cn } from "@/lib/utils/cn";

/** Matches About “Connect with the field” (`about/page.tsx`). */
const CONNECT_SECTION_TITLE =
  "font-serif text-3xl font-bold tracking-tight text-brand-heading md:text-4xl lg:text-5xl lg:leading-[1.12]";

const SECTION_HEADING =
  "font-serif text-3xl font-bold tracking-tight text-brand-heading md:text-4xl lg:text-5xl lg:leading-[1.15]";

const experienceTiers = [
  {
    title: "Half day private touring",
    description:
      "A relaxed and personalised introduction to Cairns' surrounding landscapes. Ideal for those seeking a refined experience within a shorter timeframe, with flexibility to explore rainforest, coastline or elevated scenic routes.",
  },
  {
    title: "Full day private immersion",
    description:
      "A complete and unhurried exploration of the Cairns region. Travel deeper into rainforest environments, discover hidden locations and experience the diversity of the tropical north through a fully tailored private journey.",
  },
  {
    title: "Two day private odyssey",
    description:
      "An extended and exclusive touring experience allowing deeper exploration into the rainforest highlands and beyond. Designed for travellers who value time, comfort and meaningful discovery.",
  },
] as const;

const personalWayBullets = [
  "Fully private guided touring",
  "Flexible itineraries shaped to your interests",
  "Travel in comfort and privacy",
  "Unhurried, immersive experiences",
  "Access to locations beyond standard tour routes",
] as const;

export default function PrivateToursPage() {
  return (
    <div className="bg-brand-surface">
      <PageHeader
        title="Exclusive guided experiences"
        description="Discover Cairns through bespoke private touring designed entirely around you. Happy Wanderers offers refined, personalised journeys through rainforest, hinterland and coastal landscapes — delivered in comfort, privacy and at your pace."
        breadcrumb={[{ label: "Private tours" }]}
      />

      <section className="relative overflow-hidden bg-brand-surface py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30" aria-hidden>
          <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-brand-accent/5 blur-[120px]" />
          <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-brand-primary/5 blur-[120px]" />
        </div>
        <Container>
          <motion.div
            variants={publicRevealParent}
            initial="hidden"
            whileInView="show"
            viewport={publicRevealViewport}
            className="relative mx-auto max-w-3xl text-center"
          >
            <motion.p
              variants={publicRevealItem}
              className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary"
            >
              Happy Wanderers
            </motion.p>
            <motion.h2 variants={publicRevealItem} className={cn("mt-4", SECTION_HEADING)}>
              Welcome to Cairns
            </motion.h2>
            <motion.div variants={publicRevealItem} className="mt-10 space-y-8">
              <p className="text-lg font-medium leading-[1.7] text-brand-body/95 md:text-xl lg:text-2xl">
                Happy Wanderers delivers private touring for travellers seeking something beyond the ordinary. Each
                experience is thoughtfully tailored, allowing you to explore without the constraints of fixed schedules
                or group itineraries.
              </p>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-brand-body/80 md:text-lg">
                Your day unfolds naturally, guided by local knowledge and shaped around your interests.
              </p>
            </motion.div>
            <motion.div variants={publicRevealItem} className="mt-12 flex justify-center">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-brand-border to-transparent" />
            </motion.div>
          </motion.div>
        </Container>
      </section>

      <section className="relative overflow-hidden border-t border-brand-border bg-gradient-to-b from-brand-surface via-brand-surface-soft to-brand-surface py-24 md:py-32">
        <Container className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={publicRevealViewport}
            transition={{ duration: 0.72, ease: publicRevealEase }}
            className="group relative aspect-[4/5] max-h-[640px] overflow-hidden rounded-md bg-brand-border ring-1 ring-brand-heading/5"
          >
            <Image
              src={HOME_MARKETING_PRIVATE_TOURS_SHOWCASE_PATH}
              alt="Looking up the moss-covered trunk of a giant tree in North Queensland rainforest"
              fill
              className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
              sizes="(max-width:1024px) 100vw, 50vw"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-80" />
          </motion.div>

          <motion.div
            variants={publicRevealParent}
            initial="hidden"
            whileInView="show"
            viewport={publicRevealViewport}
            className="flex flex-col space-y-8 lg:-ml-6"
          >
            <motion.div variants={publicRevealItem} className="space-y-4">
              <p className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                Private touring
              </p>
              <h2 className={SECTION_HEADING}>Rainforest, hinterland and coast</h2>
            </motion.div>

            <motion.div
              variants={publicRevealItem}
              className="max-w-prose space-y-6 text-base leading-[1.8] text-brand-body/90 md:text-lg"
            >
              <p>
                From rainforest waterfalls and elevated lookouts to quiet coastal roads and highland villages, every
                journey reveals the region with depth, comfort and authenticity.
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

      <section className="border-t border-brand-border bg-brand-surface py-24 md:py-32">
        <Container>
          <motion.div
            variants={publicRevealParent}
            initial="hidden"
            whileInView="show"
            viewport={publicRevealViewport}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.h2 variants={publicRevealItem} className={SECTION_HEADING}>
              Private touring experiences
            </motion.h2>
          </motion.div>

          <motion.div
            variants={publicRevealParent}
            initial="hidden"
            whileInView="show"
            viewport={publicRevealViewport}
            className="mx-auto mt-16 grid max-w-6xl gap-8 md:grid-cols-3"
          >
            {experienceTiers.map((tier) => (
              <motion.article
                key={tier.title}
                variants={publicRevealItem}
                className="flex h-full flex-col rounded-md border border-brand-border bg-brand-surface-soft p-8 text-left shadow-sm md:p-10"
              >
                <h3 className="font-serif text-xl font-bold tracking-tight text-brand-heading md:text-2xl">
                  {tier.title}
                </h3>
                <p className="mt-5 flex-1 text-sm leading-relaxed text-brand-body/90 md:text-base md:leading-relaxed">
                  {tier.description}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </Container>
      </section>

      <section className="border-t border-brand-border bg-brand-surface-soft py-24 md:py-32">
        <Container>
          <motion.div
            variants={publicRevealParent}
            initial="hidden"
            whileInView="show"
            viewport={publicRevealViewport}
            className="mx-auto w-full max-w-5xl"
          >
            <motion.h2 variants={publicRevealItem} className={cn("mx-auto max-w-3xl text-center", SECTION_HEADING)}>
              A more personal way to experience Cairns
            </motion.h2>
            <motion.p
              variants={publicRevealItem}
              className="mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-brand-body/90 md:text-lg"
            >
              Private touring offers a level of comfort, flexibility and connection that group tours cannot match. Every
              detail is centred around you.
            </motion.p>
            <motion.ul
              variants={publicRevealItem}
              className="mx-auto mt-10 flex max-w-5xl list-none flex-wrap justify-center gap-x-6 gap-y-3 px-2 text-sm leading-snug text-brand-body md:gap-x-8 md:gap-y-3.5 md:text-base md:leading-snug"
            >
              {personalWayBullets.map((line) => (
                <li key={line} className="inline-flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" aria-hidden />
                  <span className="text-left">{line}</span>
                </li>
              ))}
            </motion.ul>
            <motion.p
              variants={publicRevealItem}
              className="mx-auto mt-10 text-center text-base font-medium text-brand-heading md:text-lg"
            >
              Door-to-door convenience from your accommodation
            </motion.p>
          </motion.div>
        </Container>
      </section>

      <section className="border-t border-brand-border bg-brand-surface py-24 md:py-32">
        <Container className="mx-auto max-w-5xl text-center">
          <RevealOnView>
            <div className="space-y-6 md:space-y-8">
              <h2 className={cn(CONNECT_SECTION_TITLE, "italic tracking-tight")}>Plan a private day with our team</h2>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-brand-body/80 md:text-xl">
                Share your dates, group size, and how you like to move through the landscape. We reply personally —
                with the same capacity-aware, field-honest briefings we use on scheduled departures. Mention
                &ldquo;private charter&rdquo; or &ldquo;bespoke day&rdquo; in your message so we route it to the field team
                first.
              </p>
              <div className="flex justify-center pt-2 md:pt-4">
                <Button
                  asChild
                  variant="primary"
                  className={cn(
                    primaryTourCtaClassName,
                    "rounded-sm shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:shadow-md"
                  )}
                >
                  <Link href="/contact">Send a message</Link>
                </Button>
              </div>
            </div>
          </RevealOnView>
        </Container>
      </section>
    </div>
  );
}
