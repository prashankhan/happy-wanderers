import { put } from "@vercel/blob";
import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { captureMediaUploadFailure } from "@/lib/sentry/capture";
import { tourImages, tours } from "@/lib/db/schema";
import { nanoid } from "nanoid";

function extensionFromMime(mime: string): string {
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "bin";
}

export async function listTourImages(tourId: string) {
  return db
    .select()
    .from(tourImages)
    .where(and(eq(tourImages.tourId, tourId), isNull(tourImages.deletedAt)))
    .orderBy(asc(tourImages.sortOrder), asc(tourImages.createdAt));
}

export async function uploadTourImage(input: {
  tourId: string;
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  fileSize: number;
  altText: string | null;
  caption: string | null;
  isHero: boolean;
  role: "admin" | "staff";
}): Promise<{ ok: true; id: string; imageUrl: string } | { ok: false; message: string }> {
  if (input.isHero && input.role !== "admin") {
    return { ok: false, message: "Only admins can set hero images" };
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return { ok: false, message: "BLOB_READ_WRITE_TOKEN is not configured" };
  }

  const tourRows = await db
    .select({ id: tours.id, slug: tours.slug })
    .from(tours)
    .where(and(eq(tours.id, input.tourId), isNull(tours.deletedAt)))
    .limit(1);
  const tour = tourRows[0];
  if (!tour) return { ok: false, message: "Tour not found" };

  const ext = extensionFromMime(input.mimeType);
  const storagePath = `tours/${tour.slug}/gallery/${nanoid()}.${ext}`;

  try {
    const blob = await put(storagePath, input.buffer, {
      access: "public",
      token,
      contentType: input.mimeType,
    });

    const imageUrl = blob.url;

    const [row] = await db
      .insert(tourImages)
      .values({
        tourId: input.tourId,
        imageUrl,
        storagePath,
        fileName: input.fileName,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        altText: input.altText,
        caption: input.caption,
        sortOrder: 0,
        isHero: false,
      })
      .returning({ id: tourImages.id });

    const id = row!.id;

    if (input.isHero) {
      await setHeroImageInternal(input.tourId, id);
    } else {
      const maxRow = await db
        .select({ max: sql<number>`coalesce(max(${tourImages.sortOrder}), -1)` })
        .from(tourImages)
        .where(and(eq(tourImages.tourId, input.tourId), isNull(tourImages.deletedAt)));
      const nextOrder = (maxRow[0]?.max ?? -1) + 1;
      await db.update(tourImages).set({ sortOrder: nextOrder }).where(eq(tourImages.id, id));
    }

    return { ok: true, id, imageUrl };
  } catch (err) {
    captureMediaUploadFailure(err, { tour_id: input.tourId, operation_type: "media_upload" });
    return { ok: false, message: "Image upload failed" };
  }
}

async function setHeroImageInternal(tourId: string, imageId: string) {
  // Neon HTTP driver does not support transactions in this runtime.
  await db
    .update(tourImages)
    .set({ isHero: false })
    .where(and(eq(tourImages.tourId, tourId), isNull(tourImages.deletedAt)));

  await db
    .update(tourImages)
    .set({ isHero: true, sortOrder: 0 })
    .where(and(eq(tourImages.id, imageId), eq(tourImages.tourId, tourId), isNull(tourImages.deletedAt)));
}

export async function reorderTourImages(input: {
  tourId: string;
  imageIds: string[];
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const existing = await db
    .select({ id: tourImages.id })
    .from(tourImages)
    .where(and(eq(tourImages.tourId, input.tourId), isNull(tourImages.deletedAt)));

  const allowed = new Set(existing.map((r) => r.id));
  if (input.imageIds.length !== allowed.size) {
    return { ok: false, message: "image_ids must include every active image for this tour" };
  }
  for (const id of input.imageIds) {
    if (!allowed.has(id)) return { ok: false, message: "Invalid image id for this tour" };
  }

  let order = 0;
  for (const id of input.imageIds) {
    await db.update(tourImages).set({ sortOrder: order }).where(eq(tourImages.id, id));
    order += 1;
  }

  return { ok: true };
}

export async function setTourHeroImage(input: {
  tourId: string;
  imageId: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const rows = await db
    .select()
    .from(tourImages)
    .where(
      and(
        eq(tourImages.id, input.imageId),
        eq(tourImages.tourId, input.tourId),
        isNull(tourImages.deletedAt)
      )
    )
    .limit(1);
  if (!rows[0]) return { ok: false, message: "Image not found" };

  await setHeroImageInternal(input.tourId, input.imageId);
  return { ok: true };
}

export async function softDeleteTourImage(input: {
  tourId: string;
  imageId: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const rows = await db
    .select()
    .from(tourImages)
    .where(
      and(
        eq(tourImages.id, input.imageId),
        eq(tourImages.tourId, input.tourId),
        isNull(tourImages.deletedAt)
      )
    )
    .limit(1);
  if (!rows[0]) return { ok: false, message: "Image not found" };

  await db
    .update(tourImages)
    .set({ deletedAt: new Date(), isHero: false })
    .where(eq(tourImages.id, input.imageId));

  return { ok: true };
}
