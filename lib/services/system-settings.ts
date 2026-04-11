import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { systemSettings } from "@/lib/db/schema";

let cached: typeof systemSettings.$inferSelect | null = null;
let cachedAt = 0;
const TTL_MS = 60_000;

export async function getSystemSettings() {
  const now = Date.now();
  if (cached && now - cachedAt < TTL_MS) return cached;

  const rows = await db.select().from(systemSettings).limit(1);
  const row = rows[0];
  if (!row) {
    throw new Error("system_settings row missing — run db seed");
  }
  cached = row;
  cachedAt = now;
  return row;
}

export function invalidateSystemSettingsCache() {
  cached = null;
  cachedAt = 0;
}

export async function updateSystemSettings(
  patch: Partial<{
    bookingReferencePrefix: string;
    defaultCutoffHours: number;
    holdExpiryMinutes: number;
    currencyCode: string;
    timezone: string;
    businessName: string | null;
    supportEmail: string | null;
    supportPhone: string | null;
    resendFromEmail: string | null;
    adminAlertEmail: string | null;
  }>
) {
  const rows = await db.select().from(systemSettings).limit(1);
  const row = rows[0];
  if (!row) throw new Error("system_settings missing");
  await db
    .update(systemSettings)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(systemSettings.id, row.id));
  invalidateSystemSettingsCache();
}
