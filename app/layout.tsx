import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import "./globals.css";

import { brandFaviconPath } from "@/lib/branding";
import { AppProviders } from "@/components/providers/app-providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/** Headings only: italic Playfair faces (no upright romans loaded). */
const playfairDisplayItalic = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Happy Wanderers — Rainforest Tours",
    template: "%s — Happy Wanderers",
  },
  description:
    "Premium small-group rainforest tours with pickup-aware logistics, calm luxury service, and transparent availability.",
  openGraph: {
    type: "website",
    locale: "en_AU",
  },
  icons: {
    icon: [{ url: brandFaviconPath, type: "image/png" }],
    apple: [{ url: brandFaviconPath, type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${inter.variable} ${playfairDisplayItalic.variable}`}>
      <body className="min-h-screen font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
