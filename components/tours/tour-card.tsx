import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface TourCardProps {
  title: string;
  slug: string;
  shortDescription: string;
  durationText: string;
  groupSizeText: string;
  priceFromText?: string | null;
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
  heroImage,
  isFeatured,
}: TourCardProps) {
  return (
    <Card interactive className="overflow-hidden p-0">
      <div className="relative aspect-[4/3] bg-gray-200">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={`${title} — tour image`}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">Gallery coming soon</div>
        )}
        {isFeatured ? (
          <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-white">
            Featured
          </span>
        ) : null}
      </div>
      <CardHeader className="px-6 pt-6">
        <CardTitle className="font-serif">{title}</CardTitle>
        <CardDescription>{shortDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>{durationText}</span>
          <span>{groupSizeText}</span>
        </div>
        {priceFromText ? (
          <p className="text-sm font-medium text-orange-500">{priceFromText}</p>
        ) : null}
        <Button asChild variant="primary" className="w-full sm:w-auto">
          <Link href={`/tours/${slug}`}>View tour</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
