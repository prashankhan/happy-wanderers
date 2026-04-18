import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { rateLimitBuckets } from "@/lib/db/schema";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryBuckets = new Map<string, RateLimitEntry>();

export function getRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  if (realIp) return realIp;
  return "unknown";
}

function isRateLimitedMemory(key: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const existing = memoryBuckets.get(key);
  if (!existing || now > existing.resetAt) {
    memoryBuckets.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return false;
  }

  if (existing.count >= config.maxRequests) return true;

  existing.count += 1;
  return false;
}

async function isRateLimitedDatabase(key: string, config: RateLimitConfig): Promise<boolean> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + config.windowMs);

  return db.transaction(async (tx) => {
    const rows = await tx.select().from(rateLimitBuckets).where(eq(rateLimitBuckets.bucketKey, key)).limit(1);
    const existing = rows[0];

    if (!existing) {
      await tx.insert(rateLimitBuckets).values({
        bucketKey: key,
        hitCount: 1,
        windowEnd,
      });
      return false;
    }

    if (existing.windowEnd.getTime() <= now.getTime()) {
      await tx
        .update(rateLimitBuckets)
        .set({
          hitCount: 1,
          windowEnd,
        })
        .where(eq(rateLimitBuckets.bucketKey, key));
      return false;
    }

    if (existing.hitCount >= config.maxRequests) return true;

    await tx
      .update(rateLimitBuckets)
      .set({
        hitCount: existing.hitCount + 1,
      })
      .where(eq(rateLimitBuckets.bucketKey, key));
    return false;
  });
}

/**
 * Returns true when the key is over the limit for the current window.
 * Uses Postgres (`rate_limit_buckets`) so limits hold across serverless instances.
 * Falls back to in-process memory if the database transaction fails (e.g. migration not applied yet).
 */
export async function isRateLimited(key: string, config: RateLimitConfig): Promise<boolean> {
  try {
    return await isRateLimitedDatabase(key, config);
  } catch (err) {
    console.error("[rate-limit] database path failed; using in-memory fallback", err);
    return isRateLimitedMemory(key, config);
  }
}
