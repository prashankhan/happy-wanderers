import { asc, isNull } from "drizzle-orm";

import { AdminReportsPanel } from "@/components/admin/admin-reports-panel";
import { db } from "@/lib/db";
import { tours } from "@/lib/db/schema";

export default async function AdminReportsPage() {
  const tourRows = await db
    .select({ id: tours.id, title: tours.title })
    .from(tours)
    .where(isNull(tours.deletedAt))
    .orderBy(asc(tours.title));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-heading">Reports</h1>
      <p className="text-sm text-brand-muted">Passenger and revenue totals from booking snapshot fields.</p>
      <AdminReportsPanel tours={tourRows} />
    </div>
  );
}
