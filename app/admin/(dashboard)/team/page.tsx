import { asc } from "drizzle-orm";

import { auth } from "@/auth";
import { AdminPageReveal } from "@/components/admin/admin-page-reveal";
import { AdminTeamPanel } from "@/components/admin/admin-team-panel";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { getSystemSettings } from "@/lib/services/system-settings";
import { DEFAULT_TZ } from "@/lib/utils/dates";

export default async function AdminTeamPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-brand-heading">Team</h1>
        <p className="text-sm text-brand-muted">Managing dashboard users is restricted to administrators.</p>
        <div className="rounded-sm border border-brand-border bg-white p-8 text-sm text-brand-body shadow-sm">
          Your account does not have permission to access this section.
        </div>
      </div>
    );
  }

  const settings = await getSystemSettings();
  const businessTimezone = settings.timezone?.trim() || DEFAULT_TZ;

  const rows = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      role: adminUsers.role,
      lastLoginAt: adminUsers.lastLoginAt,
      createdAt: adminUsers.createdAt,
    })
    .from(adminUsers)
    .orderBy(asc(adminUsers.email));

  const users = rows.map((r) => ({
    id: r.id,
    email: r.email,
    role: r.role as "admin" | "staff",
    lastLoginAt: r.lastLoginAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <AdminPageReveal>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-heading">Team</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Create admin or staff accounts for the dashboard. Staff can run day-to-day operations; admins can also
            change settings, pricing, and sensitive areas. Passwords are stored hashed and never shown again.
          </p>
        </div>
        <AdminTeamPanel initialUsers={users} businessTimezone={businessTimezone} />
      </div>
    </AdminPageReveal>
  );
}
