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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-heading">Media library</h1>
      <p className="text-sm text-brand-muted">
        Vercel Blob paths follow <code className="rounded bg-brand-surface px-1 py-0.5 text-xs font-mono text-brand-primary">tours/{"{slug}"}/gallery/</code>. Staff can
        upload; delete, reorder, and hero are admin-only.
      </p>
      <div className="rounded-sm border border-brand-border bg-white p-6 shadow-sm">
        <AdminMediaLibrary tours={tourRows} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
