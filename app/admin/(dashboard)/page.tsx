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
        <h1 className="text-2xl font-bold text-brand-heading">Dashboard</h1>
        <p className="mt-1 text-sm text-brand-muted">Operational snapshot — confirmed bookings and live holds.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-sm border border-brand-border bg-white p-4 md:p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-normal text-brand-muted">Today confirmed</p>
          <p className="mt-2 text-2xl md:text-3xl font-bold text-brand-heading">{Number(confirmedToday[0]?.c ?? 0)}</p>
        </div>
        <div className="rounded-sm border border-brand-border bg-white p-4 md:p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-normal text-brand-muted">Pending holds</p>
          <p className="mt-2 text-2xl md:text-3xl font-bold text-brand-heading">{Number(pending[0]?.c ?? 0)}</p>
        </div>
        <div className="rounded-sm border border-brand-border bg-white p-4 md:p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-normal text-brand-muted">Month revenue (confirmed)</p>
          <p className="mt-2 text-2xl md:text-3xl font-bold text-brand-heading">${revenue[0]?.sum ?? "0"}</p>
        </div>
      </div>
    </div>
  );
}
