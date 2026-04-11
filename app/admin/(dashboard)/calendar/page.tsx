import { asc, isNull } from "drizzle-orm";

import { auth } from "@/auth";
import { AdminCalendar } from "@/components/admin/admin-calendar";
import { db } from "@/lib/db";
import { tours } from "@/lib/db/schema";

export default async function AdminCalendarPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const tourRows = await db
    .select({ id: tours.id, title: tours.title })
    .from(tours)
    .where(isNull(tours.deletedAt))
    .orderBy(asc(tours.displayOrder), asc(tours.title));

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl font-semibold">Availability calendar</h1>
      <p className="text-sm text-gray-600">
        Month grid wired to availability APIs. Admins can create, edit, and clear overrides per date.
      </p>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <AdminCalendar tours={tourRows} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
