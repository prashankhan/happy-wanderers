import { asc, isNull } from "drizzle-orm";

import { AdminManifestPanel } from "@/components/admin/admin-manifest-panel";
import { db } from "@/lib/db";
import { tours } from "@/lib/db/schema";

export default async function AdminManifestsPage() {
  const tourRows = await db
    .select({ id: tours.id, title: tours.title })
    .from(tours)
    .where(isNull(tours.deletedAt))
    .orderBy(asc(tours.title));

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl font-semibold">Manifests</h1>
      <p className="text-sm text-gray-600">Confirmed bookings only, using snapshots — printable driver sheet.</p>
      <AdminManifestPanel tours={tourRows} />
    </div>
  );
}
