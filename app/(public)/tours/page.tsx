import type { Metadata } from "next";
import { listPublishedTours } from "@/lib/services/tours-public";
import { ToursListView } from "@/components/tours/tours-list-view";

export const metadata: Metadata = {
  title: "Tours",
  description: "Browse premium small-group rainforest tours with curated departures and transparent availability.",
};

export default async function ToursPage() {
  // This runs securely on the server
  const rows = await listPublishedTours({});

  // Pass the data to the client component for the premium UI
  return <ToursListView rows={rows} />;
}
