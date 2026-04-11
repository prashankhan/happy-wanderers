import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { brandLogoPath } from "@/lib/branding";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-100 py-16">
      <Container className="grid gap-10 md:grid-cols-3">
        <div className="space-y-3">
          <Image
            src={brandLogoPath}
            alt="Happy Wanderers"
            width={180}
            height={50}
            className="h-8 w-auto max-w-[140px] object-contain object-left"
          />
          <p className="text-sm text-gray-600">
            Premium small-group rainforest experiences from Cairns and surrounds.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-medium text-gray-900">Explore</p>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link href="/tours" className="hover:text-blue-900">
                Tours
              </Link>
            </li>
            <li>
              <Link href="/availability" className="hover:text-blue-900">
                Availability
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-900">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-medium text-gray-900">Policies</p>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link href="/privacy" className="hover:text-blue-900">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-blue-900">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/cancellation-policy" className="hover:text-blue-900">
                Cancellation policy
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
