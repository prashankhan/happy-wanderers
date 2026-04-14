"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Container } from "@/components/layout/container";
import { brandLogoPath } from "@/lib/branding";
import { cn } from "@/lib/utils/cn";

const SCROLL_THRESHOLD_PX = 12;

/**
 * Logo fits inside the bar: never exceed row height (`max-h-24` / `lg:max-h-28`).
 * Use `h-auto` + `max-h-*` + `max-w-*` so `next/image` cannot expand like a square poster.
 */
const LOGO_FULL_CLASS =
  "h-auto max-h-24 w-auto max-w-[min(240px,calc(100vw-6.5rem))] object-contain object-left sm:max-w-[min(300px,calc(100vw-7rem))] lg:max-h-28 lg:max-w-[min(480px,42vw)]";
const links = [
  { href: "/", label: "Home" },
  { href: "/tours", label: "Tours" },
  { href: "/availability", label: "Availability" },
  { href: "/private-tours", label: "Private tours" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const policyLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/cancellation-policy", label: "Cancellation Policy" },
];

function isNavLinkActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Drawer-only: staggered fade + slide after the sheet opens (`tailwindcss-animate`). */
const DRAWER_ENTER =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-2 motion-safe:fill-mode-both motion-safe:duration-300 motion-safe:ease-out";

const DRAWER_MAIN_LINK_STAGGER = [
  "motion-safe:delay-0",
  "motion-safe:delay-75",
  "motion-safe:delay-100",
  "motion-safe:delay-150",
  "motion-safe:delay-200",
  "motion-safe:delay-[250ms]",
] as const;

const DRAWER_POLICY_STAGGER = [
  "motion-safe:delay-[220ms]",
  "motion-safe:delay-[260ms]",
  "motion-safe:delay-[300ms]",
] as const;

/** Book CTA: primary brand orange, exact typography styling as the rest of the site but custom nav padding. */
const navBookTourClassName =
  "bg-brand-primary text-white hover:bg-brand-primary-hover focus-visible:ring-brand-primary";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHome = pathname === "/";
  const overHero = isHome && !isScrolled;

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "top-0 z-40 w-full transition-[background-color,border-color,box-shadow] duration-300 ease-out",
        isHome ? "fixed border-b" : "sticky bg-brand-surface border-b border-brand-border shadow-sm",
        isHome && isScrolled ? "border-brand-border bg-brand-surface shadow-sm" : isHome ? "border-transparent bg-transparent" : ""
      )}
    >
      <Container className="flex h-24 items-center justify-between gap-4 transition-[height,gap] duration-300 ease-out lg:h-36">
        <Link
          href="/"
          className="flex min-w-0 max-w-[min(100%,calc(100%-3.5rem))] shrink-0 items-center gap-2 rounded-md outline-none ring-brand-accent/20 transition-transform duration-300 ease-out focus-visible:ring-2 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] lg:max-w-[55%]"
        >
          <Image
            src={brandLogoPath}
            alt="Happy Wanderers"
            width={768}
            height={216}
            sizes="(max-width: 1023px) 240px, 480px"
            className={cn(
              "w-auto object-contain object-left transition-[max-height,max-width] duration-300 ease-out",
              LOGO_FULL_CLASS,
              overHero && "drop-shadow-md"
            )}
            priority
          />
        </Link>
        <nav
          className="hidden items-center gap-5 font-sans text-2xl font-bold tracking-tight lg:flex lg:gap-7"
          aria-label="Main"
        >
          {links.map((l) => {
            const isActive = isNavLinkActive(l.href, pathname);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap transition-[color,transform] duration-200 ease-out motion-safe:hover:-translate-y-px motion-safe:active:scale-[0.98] cursor-pointer",
                  overHero
                    ? isActive
                      ? "text-brand-primary hover:text-brand-primary"
                      : "text-white/80 hover:text-brand-primary"
                    : isActive
                      ? "text-brand-primary hover:text-brand-primary"
                      : "text-brand-heading hover:text-brand-primary"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            asChild
            variant="primary"
            size="sm"
            className={cn(
              "hidden h-auto min-h-0 rounded-sm border-0 px-10 py-3.5 font-sans text-2xl font-bold tracking-tight shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:shadow-md motion-safe:active:scale-[0.98] sm:inline-flex",
              navBookTourClassName
            )}
          >
            <Link href="/booking">Book a tour</Link>
          </Button>
          <Dialog open={open} onOpenChange={setOpen} modal>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className={cn(
                  "lg:hidden h-11 w-11 shrink-0 rounded-sm border p-0 transition-[background-color,border-color,color,transform] duration-200 ease-out motion-safe:active:scale-95",
                  overHero &&
                  "border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white focus-visible:ring-white/40"
                )}
                aria-label="Open menu"
              >
                <Menu className="size-6 shrink-0" aria-hidden />
                <span className="sr-only">Menu</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col">
              <p
                className={cn(
                  "mb-4 text-xs font-semibold uppercase tracking-widest text-brand-muted",
                  DRAWER_ENTER,
                  "motion-safe:delay-0 motion-safe:duration-200"
                )}
              >
                Menu
              </p>
              <nav className="flex flex-1 flex-col gap-0.5 font-sans" aria-label="Mobile">
                {links.map((l, index) => {
                  const isActive = isNavLinkActive(l.href, pathname);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        DRAWER_ENTER,
                        DRAWER_MAIN_LINK_STAGGER[index] ?? "motion-safe:delay-200",
                        "rounded-xl px-3 py-3 font-sans text-xl font-bold tracking-tight transition-[background-color,color,transform] duration-200 ease-out motion-safe:active:scale-[0.99]",
                        isActive
                          ? "bg-brand-accent-soft text-brand-gold hover:bg-brand-accent-soft"
                          : "text-brand-heading hover:bg-brand-accent-soft hover:text-brand-gold active:bg-brand-accent-soft"
                      )}
                    >
                      {l.label}
                    </Link>
                  );
                })}
                <div
                  className={cn(
                    "my-4 border-t border-brand-border",
                    DRAWER_ENTER,
                    "motion-safe:delay-[180ms] motion-safe:duration-200"
                  )}
                />
                <p
                  className={cn(
                    "mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-brand-muted",
                    DRAWER_ENTER,
                    "motion-safe:delay-[200ms] motion-safe:duration-200"
                  )}
                >
                  Policies
                </p>
                {policyLinks.map((l, index) => {
                  const isActive = isNavLinkActive(l.href, pathname);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        DRAWER_ENTER,
                        DRAWER_POLICY_STAGGER[index] ?? "motion-safe:delay-[300ms]",
                        "rounded-xl px-3 py-3 font-sans text-xl font-bold tracking-tight transition-[background-color,color,transform] duration-200 ease-out motion-safe:active:scale-[0.99]",
                        isActive
                          ? "bg-brand-accent-soft text-brand-gold hover:bg-brand-accent-soft"
                          : "text-brand-heading hover:bg-brand-accent-soft hover:text-brand-gold active:bg-brand-accent-soft"
                      )}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </nav>
              <Button
                asChild
                variant="primary"
                className={cn(
                  "mt-6 h-auto min-h-0 w-full shrink-0 rounded-md border-0 px-5 py-2 font-sans text-xl font-bold tracking-tight shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:shadow-md motion-safe:active:scale-[0.98]",
                  navBookTourClassName,
                  DRAWER_ENTER,
                  "motion-safe:delay-[340ms]"
                )}
                onClick={() => setOpen(false)}
              >
                <Link href="/booking">Book a tour</Link>
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </Container>
    </header>
  );
}
