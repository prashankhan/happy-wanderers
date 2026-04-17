import { asc, isNull } from "drizzle-orm";

import { AdminManifestPanel } from "@/components/admin/admin-manifest-panel";
import { db } from "@/lib/db";
import { tours } from "@/lib/db/schema";
import { getSystemSettings } from "@/lib/services/system-settings";
import { DEFAULT_TZ } from "@/lib/utils/dates";

export default async function AdminManifestsPage() {
  const settings = await getSystemSettings();
  const businessTimezone = settings.timezone?.trim() || DEFAULT_TZ;

  const tourRows = await db
    .select({ id: tours.id, title: tours.title })
    .from(tours)
    .where(isNull(tours.deletedAt))
    .orderBy(asc(tours.title));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-heading">Manifests</h1>
      <p className="text-sm text-brand-muted">Confirmed bookings only, using snapshots — printable driver sheet.</p>
      <AdminManifestPanel tours={tourRows} businessTimezone={businessTimezone} />
    </div>
  );
}
