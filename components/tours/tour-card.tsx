import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export interface TourCardProps {
  title: string;
  slug: string;
  shortDescription: string;
  durationText: string;
  groupSizeText: string;
  priceFromText?: string | null;
  locationRegion?: string | null;
  heroImage?: string | null;
  isFeatured?: boolean; // Kept via interface but effectively unused per UI reqs
}

export function TourCard({
  title,
  slug,
  shortDescription,
  durationText,
  groupSizeText,
  priceFromText,
  locationRegion,
  heroImage,
}: TourCardProps) {
  const normalizedPrice = priceFromText?.replace(/^(From\s*|from\s*)/i, "").trim() ?? null;
  const locationLabel = locationRegion?.replace(/\s*&\s*/g, " · ");

  return (
    <Link href={`/tours/${slug}`} className="group flex h-full flex-col focus:outline-none">
      <Card className="flex h-full flex-col overflow-hidden rounded-md border border-brand-border/60 bg-white p-0 shadow-[0_6px_16px_-14px_rgba(12,22,44,0.24)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-16px_rgba(12,22,44,0.3)] hover:ring-1 hover:ring-brand-border/80">
        <div className="relative aspect-[4/3] overflow-hidden bg-brand-surface-soft">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={`${title} — tour image`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width:768px) 100vw, 33vw"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium text-brand-muted">
              Gallery coming soon
            </div>
          )}

          {/* Subtle cinematic gradient so image frames nicely and bottom text reads perfectly */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />

          {/* Bottom Left: Duration & capacity */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 text-white">
            {durationText ? (
              <div className="flex items-center gap-1.5 rounded-sm bg-black/20 px-2 py-1 backdrop-blur-[1px] drop-shadow-md">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">{durationText}</span>
              </div>
            ) : null}
            {groupSizeText ? (
              <div className="flex items-center gap-1.5 rounded-sm bg-black/20 px-2 py-1 backdrop-blur-[1px] drop-shadow-md">
                <Users className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">{groupSizeText}</span>
              </div>
            ) : null}
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col p-6">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div className="flex-1 pt-0.5">
              {locationRegion ? (
                <div className="inline-flex max-w-full items-center gap-1.5 rounded-sm border border-brand-border/60 bg-brand-surface-soft/70 px-2.5 py-1 text-[11px] font-semibold tracking-[0.03em] text-brand-muted">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{locationLabel}</span>
                </div>
              ) : null}
            </div>
          </div>

          <h3 className="line-clamp-2 min-h-[3.6rem] font-serif text-[2rem] font-semibold leading-[1.08] tracking-tight text-brand-heading transition-colors group-hover:text-brand-primary">
            {title}
          </h3>
          <p className="mt-3 min-h-[3.2rem] max-h-[3.2rem] flex-1 overflow-hidden text-[1.04rem] leading-[1.6rem] text-brand-body/88 line-clamp-2">
            {shortDescription}
          </p>

          <div className="mt-6 flex items-end justify-between border-t border-brand-border/40 pt-4">
            <span className="inline-flex items-center rounded-sm border border-brand-primary/20 bg-brand-primary/5 px-2.5 py-1 text-sm font-semibold text-brand-primary transition-colors group-hover:border-brand-primary/35 group-hover:bg-brand-primary/10">
              Explore tour
            </span>
            {normalizedPrice ? (
              <div className="shrink-0 text-right leading-tight">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted">
                  Starts from
                </div>
                <div className="mt-1 text-[2rem] font-black tracking-tight text-brand-heading">
                  {normalizedPrice}
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
