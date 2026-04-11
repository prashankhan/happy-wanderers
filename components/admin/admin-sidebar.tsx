"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { brandLogoPath } from "@/lib/branding";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/tours", label: "Tours" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/manifests", label: "Manifests" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <Link href="/admin" className="mb-2 block outline-none ring-blue-900/20 focus-visible:ring-2">
          <Image
            src={brandLogoPath}
            alt="Happy Wanderers"
            width={160}
            height={45}
            className="h-7 w-auto max-w-[140px] object-contain object-left"
          />
        </Link>
        <p className="text-xs text-gray-500">Operator</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium",
                active ? "bg-gray-100 text-blue-900" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
