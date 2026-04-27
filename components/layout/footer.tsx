import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils/cn";

/** Match desktop main nav link scale (`components/layout/navbar.tsx`). */
const footerNavLinkClass =
  "group block font-sans text-lg font-bold tracking-tighter transition-colors duration-200 ease-out hover:text-brand-primary md:text-xl cursor-pointer";

export function Footer() {
  const year = new Date().getFullYear();

  const destinations = [
    { label: "Cairns", href: "/tours?location=cairns" },
    { label: "Port Douglas", href: "/tours?location=port-douglas" },
    { label: "Daintree", href: "/tours?location=daintree" },
    { label: "Rainforest", href: "/tours?category=rainforest" },
  ];

  const explore = [
    { label: "Signature Departures", href: "/tours" },
    { label: "Book a tour", href: "/booking" },
    { label: "Our Philosophy", href: "/about" },
  ];

  const legal = [
    { label: "Cancellation Policy", href: "/cancellation-policy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ];

  return (
    <footer className="relative overflow-hidden text-white selection:bg-brand-primary/30">
      <Image
        src="/images/marketing/happywanderers-foooter.jpeg"
        alt=""
        fill
        className="z-0 object-cover object-center"
        sizes="100vw"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-brand-heading/95"
        aria-hidden
      />
      <div className="relative z-[2]">
        {/* Top Section: Architectural Columns */}
        <Container className="py-24 md:py-32">
          <div className="grid gap-x-20 gap-y-16 lg:grid-cols-12">
            {/* Column 1: Destinations */}
            <div className="space-y-8 lg:col-span-4">
              <p className="text-base font-bold uppercase tracking-normal text-white/40">Destinations</p>
              <nav className="flex flex-col gap-3">
                {destinations.map((item) => (
                  <Link key={item.label} href={item.href} className={cn(footerNavLinkClass, "text-white")}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Column 2: Explore */}
            <div className="space-y-8 lg:col-span-4">
              <p className="text-base font-bold uppercase tracking-normal text-white/40">Explore</p>
              <nav className="flex flex-col gap-3">
                {explore.map((item) => (
                  <Link key={item.label} href={item.href} className={cn(footerNavLinkClass, "text-white")}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Column 3: Legal */}
            <div className="space-y-8 lg:col-span-4">
              <p className="text-base font-bold uppercase tracking-normal text-white/40">Legal</p>
              <nav className="flex flex-col gap-3">
                {legal.map((item) => (
                  <Link key={item.label} href={item.href} className={cn(footerNavLinkClass, "text-white")}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </Container>

        {/* Brand Sign-off background element */}
        <div className="pointer-events-none relative select-none overflow-hidden">
          <p className="absolute -bottom-[4vw] left-0 w-full whitespace-nowrap text-center text-[15vw] font-bold leading-none tracking-tighter text-white/[0.02]">
            HAPPY WANDERERS
          </p>
        </div>

        {/* Final Stripe */}
        <div className="border-t border-white/5 bg-brand-heading py-10">
          <Container className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p className="text-center text-sm font-bold uppercase tracking-normal text-white/30 md:text-left">
              © {year} Happy Wanderers. Cairns & Daintree Region.
            </p>
            <p className="text-center text-sm font-bold uppercase tracking-normal text-white/30 md:text-right">
              Developed by{" "}
              <a
                href="https://chanmax.io"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-white/50 transition-colors hover:text-brand-primary"
              >
                Chanmax
              </a>
            </p>
          </Container>
        </div>
      </div>
    </footer>
  );
}
