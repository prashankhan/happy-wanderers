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
      <div className="relative aspect-[16/9] min-h-[200px] w-full overflow-hidden rounded-sm bg-brand-surface shadow-xl shadow-brand-heading/10 ring-1 ring-brand-heading/10 md:min-h-[400px] md:aspect-[21/9]">
        <Image
          key={active.id}
          src={active.imageUrl}
          alt={active.altText ?? `${tourTitle} — gallery`}
          fill
          priority
          className="object-cover brightness-90 saturate-[0.85]"
          sizes="100vw"
        />
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
                  "relative h-16 w-24 shrink-0 overflow-hidden rounded-sm border-2 bg-brand-surface shadow-sm shadow-brand-heading/10 transition duration-200 md:h-20 md:w-32",
                  isOn ? "border-brand-primary ring-2 ring-brand-primary/20" : "border-transparent opacity-70 hover:opacity-100"
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
