import type { MetadataRoute } from "next";
import { and, asc, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { tours } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let slugs: { slug: string; updatedAt: Date }[] = [];
  try {
    slugs = await db
      .select({ slug: tours.slug, updatedAt: tours.updatedAt })
      .from(tours)
      .where(and(eq(tours.status, "published"), isNull(tours.deletedAt)))
      .orderBy(asc(tours.slug));
  } catch {
    /* DB unavailable at build — fall back to static routes */
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/tours",
    "/availability",
    "/private-tours",
    "/about",
    "/booking",
    "/contact",
    "/privacy",
    "/terms",
    "/cancellation-policy",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const tourRoutes: MetadataRoute.Sitemap = slugs.map((t) => ({
    url: `${base}/tours/${t.slug}`,
    lastModified: t.updatedAt,
  }));

  return [...staticRoutes, ...tourRoutes];
}
