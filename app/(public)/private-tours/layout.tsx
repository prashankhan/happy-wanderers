import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private tours",
  description:
    "Exclusive guided private touring in Cairns — half day, full day and two-day bespoke journeys through rainforest, hinterland and coast, with flexible itineraries and door-to-door convenience.",
};

export default function PrivateToursLayout({ children }: { children: React.ReactNode }) {
  return children;
}
