import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface TourCardProps {
  title: string;
  slug: string;
  shortDescription: string;
  durationText: string;
  groupSizeText: string;
  priceFromText?: string | null;
  locationRegion?: string | null;
  heroImage?: string | null;
  isFeatured?: boolean;
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
  isFeatured,
}: TourCardProps) {
  return (
    <Card interactive className="group overflow-hidden p-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={`${title} — tour image`}
            fill
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
            sizes="(max-width:768px) 100vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">Gallery coming soon</div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        {isFeatured ? (
          <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-white shadow-md">
            Featured
          </span>
        ) : null}
      </div>
      <CardHeader className="px-6 pt-6">
        <CardTitle className="font-serif">{title}</CardTitle>
        <CardDescription className="leading-relaxed">{shortDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <div className="grid gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-blue-900/70" aria-hidden />
            <span>{durationText}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-blue-900/70" aria-hidden />
            <span>{groupSizeText}</span>
          </div>
          {locationRegion ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-blue-900/70" aria-hidden />
              <span>{locationRegion}</span>
            </div>
          ) : null}
        </div>
        {priceFromText ? (
          <p className="text-sm font-semibold tracking-wide text-orange-600">{priceFromText}</p>
        ) : null}
        <Button asChild variant="primary" className="w-full sm:w-auto">
          <Link href={`/tours/${slug}`}>View tour</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
