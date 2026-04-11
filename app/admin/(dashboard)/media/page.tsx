import { asc, isNull } from "drizzle-orm";

import { auth } from "@/auth";
import { AdminMediaLibrary } from "@/components/admin/admin-media-library";
import { db } from "@/lib/db";
import { tours } from "@/lib/db/schema";

export default async function AdminMediaPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const tourRows = await db
    .select({ id: tours.id, title: tours.title })
    .from(tours)
    .where(isNull(tours.deletedAt))
    .orderBy(asc(tours.displayOrder), asc(tours.title));

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl font-semibold">Media library</h1>
      <p className="text-sm text-gray-600">
        Vercel Blob paths follow <code className="rounded bg-gray-100 px-1">tours/{"{slug}"}/gallery/</code>. Staff can
        upload; delete, reorder, and hero are admin-only.
      </p>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <AdminMediaLibrary tours={tourRows} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
