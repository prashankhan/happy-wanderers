import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { brandLogoPath } from "@/lib/branding";

const links = [
  { href: "/tours", label: "Tours" },
  { href: "/availability", label: "Availability" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/80 backdrop-blur">
      <Container className="flex h-20 items-center justify-between gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md outline-none ring-blue-900/20 focus-visible:ring-2"
        >
          <Image
            src={brandLogoPath}
            alt="Happy Wanderers"
            width={320}
            height={90}
            className="h-12 w-auto max-w-[240px] object-contain object-left sm:h-14 sm:max-w-[280px] md:h-16 md:max-w-[320px]"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-700 transition hover:text-blue-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="primary" size="sm" className="hidden sm:inline-flex">
            <Link href="/tours">Book a tour</Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="md:hidden">
            <Link href="/tours">Tours</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
