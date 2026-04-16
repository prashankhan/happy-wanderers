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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-heading">Availability calendar</h1>
      <p className="text-sm text-brand-muted">
        Month view of capacity and cutoff per tour. Admins can set <strong>one-off changes for a single date</strong>{" "}
        (e.g. close a day or change capacity)—not your everyday schedule, which comes from each tour&apos;s weekday
        rules and defaults.
      </p>
      <div className="rounded-sm border border-brand-border bg-white p-6 shadow-sm">
        <AdminCalendar tours={tourRows} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
