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
  return (
    <Link href={`/tours/${slug}`} className="group flex h-full flex-col focus:outline-none">
      <Card className="flex h-full flex-col overflow-hidden rounded-md border border-brand-border/50 bg-white p-0 shadow-sm transition-all duration-500 hover:shadow-xl hover:ring-1 hover:ring-brand-border/80">
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
            <div className="flex h-full items-center justify-center text-sm font-medium text-brand-muted">Gallery coming soon</div>
          )}
          
          {/* Subtle cinematic gradient so image frames nicely and bottom text reads perfectly */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
          
          {/* Bottom Left: Duration & capacity */}
           <div className="absolute bottom-4 left-4 z-10 flex items-center gap-5 text-white">
            {durationText ? (
              <div className="flex items-center gap-1.5 drop-shadow-md">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-semibold">{durationText}</span>
              </div>
            ) : null}
            {groupSizeText ? (
              <div className="flex items-center gap-1.5 drop-shadow-md">
                <Users className="h-4 w-4" />
                <span className="text-sm font-semibold">{groupSizeText}</span>
              </div>
            ) : null}
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col p-6 lg:p-7">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="flex-1 pt-0.5">
              {locationRegion ? (
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-muted">
                  <MapPin className="h-4 w-4" />
                  <span>{locationRegion}</span>
                </div>
              ) : null}
            </div>
          </div>

          <h3 className="font-serif text-2xl font-semibold leading-tight text-brand-heading transition-colors group-hover:text-brand-primary">
            {title}
          </h3>
          <p className="mt-3 flex-1 line-clamp-2 text-base leading-relaxed text-brand-body/90">
            {shortDescription}
          </p>
          
          <div className="mt-6 flex items-center justify-between border-t border-brand-border/40 pt-4">
            <span className="flex items-center text-base font-bold text-brand-primary">
              Explore tour
            </span>
            {priceFromText ? (
              <div className="shrink-0 text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Starts from</div>
                <div className="text-2xl font-black tracking-tight text-brand-heading">
                  {priceFromText.replace(/^(From\s*|from\s*)/i, "")}
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
