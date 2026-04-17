interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

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

export function isRateLimited(key: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || now > existing.resetAt) {
    buckets.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return false;
  }

  if (existing.count >= config.maxRequests) {
    return true;
  }

  existing.count += 1;
  return false;
}
