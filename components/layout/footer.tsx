import Link from "next/link";
import { Container } from "@/components/layout/container";

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
    { label: "Book a tour", href: "/booking", highlight: true },
    { label: "Our Philosophy", href: "/about" },
  ];

  const legal = [
    { label: "Cancellation Policy", href: "/cancellation-policy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ];

  return (
    <footer className="bg-brand-heading text-white selection:bg-brand-primary/30">
      {/* Top Section: Architectural Columns */}
      <Container className="py-24 md:py-32">
        <div className="grid gap-x-20 gap-y-16 lg:grid-cols-12">
          
          {/* Column 1: Destinations */}
          <div className="lg:col-span-4 space-y-8">
            <p className="text-base font-bold uppercase tracking-normal text-white/40">Destinations</p>
            <nav className="flex flex-col gap-3">
              {destinations.map((item) => (
                <Link 
                  key={item.label}
                  href={item.href}
                  className="group block text-2xl font-bold tracking-tight transition-all hover:text-brand-primary cursor-pointer"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 2: Explore */}
          <div className="lg:col-span-4 space-y-8">
            <p className="text-base font-bold uppercase tracking-normal text-white/40">Explore</p>
            <nav className="flex flex-col gap-3">
              {explore.map((item) => (
                <Link 
                  key={item.label}
                  href={item.href}
                  className={`group block text-2xl font-bold tracking-tight transition-all hover:text-brand-primary cursor-pointer ${item.highlight ? 'text-brand-primary' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Legal */}
          <div className="lg:col-span-4 space-y-8">
            <p className="text-base font-bold uppercase tracking-normal text-white/40">Legal</p>
            <nav className="flex flex-col gap-3">
              {legal.map((item) => (
                <Link 
                  key={item.label}
                  href={item.href}
                  className="group block text-2xl font-bold tracking-tight transition-all hover:text-brand-primary cursor-pointer"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

        </div>
      </Container>

      {/* Brand Sign-off background element */}
      <div className="relative overflow-hidden pointer-events-none select-none">
         <p className="text-[15vw] font-bold leading-none tracking-tighter text-white/[0.02] absolute -bottom-[4vw] left-0 w-full text-center whitespace-nowrap">
            HAPPY WANDERERS
         </p>
      </div>

      {/* Final Stripe */}
      <div className="border-t border-white/5 bg-black/10 py-10">
        <Container className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-sm font-bold tracking-normal text-white/30 uppercase text-center md:text-left">
             © {year} Happy Wanderers. Cairns & Daintree Region.
          </p>
          <p className="text-sm font-bold tracking-normal text-white/30 uppercase text-center md:text-right">
            Developed by{" "}
            <a 
              href="https://chanmax.io" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white/50 transition-colors hover:text-brand-primary cursor-pointer"
            >
              Chanmax
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}
