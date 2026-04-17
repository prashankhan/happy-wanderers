import { asc, isNull } from "drizzle-orm";

import { auth } from "@/auth";
import { AdminReportsPanel } from "@/components/admin/admin-reports-panel";
import { db } from "@/lib/db";
import { tours } from "@/lib/db/schema";
import { getSystemSettings } from "@/lib/services/system-settings";
import { DEFAULT_TZ } from "@/lib/utils/dates";

export default async function AdminReportsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-brand-heading">Reports</h1>
        <p className="text-sm text-brand-muted">Revenue and booking reports are restricted to administrators.</p>
        <div className="rounded-sm border border-brand-border bg-white p-8 text-sm text-brand-body shadow-sm">
          Your account does not have permission to access this section.
        </div>
      </div>
    );
  }

  const settings = await getSystemSettings();
  const businessTimezone = settings.timezone?.trim() || DEFAULT_TZ;

  const tourRows = await db
    .select({ id: tours.id, title: tours.title })
    .from(tours)
    .where(isNull(tours.deletedAt))
    .orderBy(asc(tours.title));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-heading">Reports</h1>
      <p className="text-sm text-brand-muted">Passenger and revenue totals from booking snapshot fields.</p>
      <AdminReportsPanel tours={tourRows} businessTimezone={businessTimezone} />
    </div>
  );
}
