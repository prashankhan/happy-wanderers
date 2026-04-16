"use client";

import { useState } from "react";

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
        <select
          className="mt-1 block max-w-md rounded-sm border border-brand-border px-3 py-2 text-sm"
          value={tourId}
          onChange={(e) => setTourId(e.target.value)}
        >
          {tours.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </label>
      <TourMediaSection key={tourId} tourId={tourId} isAdmin={isAdmin} />
    </div>
  );
}
