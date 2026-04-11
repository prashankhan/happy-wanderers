import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";

export default async function AdminDashboardPage() {
  const today = new Date().toISOString().slice(0, 10);

  const confirmedToday = await db
    .select({ c: sql<number>`count(*)` })
    .from(bookings)
    .where(
      and(eq(bookings.status, "confirmed"), sql`${bookings.bookingDate}::text = ${today}`)
    );

  const pending = await db
    .select({ c: sql<number>`count(*)` })
    .from(bookings)
    .where(eq(bookings.status, "pending"));

  const revenue = await db
    .select({ sum: sql<string>`coalesce(sum(${bookings.totalPriceSnapshot}), 0)` })
    .from(bookings)
    .where(
      and(eq(bookings.status, "confirmed"), gte(bookings.bookingDate, `${today.slice(0, 7)}-01`))
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-600">Operational snapshot — confirmed bookings and live holds.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Today confirmed</p>
          <p className="mt-2 text-3xl font-semibold">{Number(confirmedToday[0]?.c ?? 0)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Pending holds</p>
          <p className="mt-2 text-3xl font-semibold">{Number(pending[0]?.c ?? 0)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Month revenue (confirmed)</p>
          <p className="mt-2 text-3xl font-semibold">${revenue[0]?.sum ?? "0"}</p>
        </div>
      </div>
    </div>
  );
}
