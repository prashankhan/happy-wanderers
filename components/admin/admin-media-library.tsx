"use client";

import { useState } from "react";

import { AdminCombobox } from "@/components/admin/admin-combobox";
import { TourMediaSection } from "@/components/admin/tour-media-section";

export interface MediaLibraryTourOption {
  id: string;
  title: string;
}

export interface AdminMediaLibraryProps {
  tours: MediaLibraryTourOption[];
  isAdmin: boolean;
}

export function AdminMediaLibrary({ tours, isAdmin }: AdminMediaLibraryProps) {
  const [tourId, setTourId] = useState(tours[0]?.id ?? "");

  if (!tourId) {
    return <p className="text-sm text-brand-muted">No tours yet.</p>;
  }

  return (
    <div className="space-y-4">
      <label className="text-xs font-medium text-brand-muted">
        Tour
        <AdminCombobox
          className="mt-1 block max-w-md"
          value={tourId}
          onValueChange={setTourId}
          options={tours.map((tour) => ({ value: tour.id, label: tour.title }))}
        />
      </label>
      <TourMediaSection key={tourId} tourId={tourId} isAdmin={isAdmin} />
    </div>
  );
}
