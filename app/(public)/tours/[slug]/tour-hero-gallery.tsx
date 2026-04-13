"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";

export interface TourHeroGalleryImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  isHero: boolean;
}

export function TourHeroGallery({ images, tourTitle }: { images: TourHeroGalleryImage[]; tourTitle: string }) {
  const ordered = [...images].sort((a, b) => Number(b.isHero) - Number(a.isHero));
  const [activeId, setActiveId] = useState(ordered[0]?.id ?? "");

  const active = ordered.find((i) => i.id === activeId) ?? ordered[0];
  if (!active) {
    return (
      <div className="flex min-h-[320px] items-center justify-center bg-gray-100 text-sm text-gray-500">
        Imagery soon
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[21/9] min-h-[220px] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-xl shadow-gray-900/10 ring-1 ring-black/5 md:min-h-[320px] md:rounded-3xl">
        <Image
          key={active.id}
          src={active.imageUrl}
          alt={active.altText ?? `${tourTitle} — gallery`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-950/70 via-blue-950/20 to-transparent" />
      </div>
      {ordered.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 [scrollbar-width:thin]">
          {ordered.map((img) => {
            const isOn = img.id === active.id;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveId(img.id)}
                className={cn(
                  "relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 bg-gray-100 shadow-md shadow-gray-900/10 transition duration-200 md:h-20 md:w-32",
                  isOn ? "border-blue-900 ring-2 ring-blue-900/20" : "border-transparent opacity-80 hover:opacity-100"
                )}
              >
                <Image
                  src={img.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="128px"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
