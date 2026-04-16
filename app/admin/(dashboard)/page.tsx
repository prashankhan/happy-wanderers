import { and, eq, gte, sql } from "drizzle-orm";
import { format, subDays } from "date-fns";

import { AdminDashboardCharts } from "@/components/admin/admin-dashboard-charts";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";

export default async function AdminDashboardPage() {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const monthStartStr = `${todayStr.slice(0, 7)}-01`;

  const confirmedToday = await db
    .select({ c: sql<number>`count(*)` })
    .from(bookings)
    .where(
      and(eq(bookings.status, "confirmed"), sql`${bookings.bookingDate}::text = ${todayStr}`)
    );

  const pending = await db
    .select({ c: sql<number>`count(*)` })
    .from(bookings)
    .where(eq(bookings.status, "pending"));

  const monthRevenue = await db
    .select({ sum: sql<string>`coalesce(sum(${bookings.totalPriceSnapshot}), 0)` })
    .from(bookings)
    .where(
      and(eq(bookings.status, "confirmed"), gte(bookings.bookingDate, monthStartStr))
    );

  const chartData = await Promise.all(
    Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      return dateStr;
    }).map(async (dateStr) => {
      const result = await db
        .select({
          bookings: sql<number>`count(*)`,
          revenue: sql<string>`coalesce(sum(${bookings.totalPriceSnapshot}), 0)`,
        })
        .from(bookings)
        .where(
          and(eq(bookings.status, "confirmed"), sql`${bookings.bookingDate}::text = ${dateStr}`)
        );

      return {
        date: dateStr,
        label: format(new Date(dateStr), "EEE"),
        bookings: Number(result[0]?.bookings ?? 0),
        revenue: Number(result[0]?.revenue ?? 0),
      };
    })
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
          <p className="mt-2 text-2xl md:text-3xl font-bold text-brand-heading">${monthRevenue[0]?.sum ?? "0"}</p>
        </div>
      </div>

      <AdminDashboardCharts data={chartData} />
    </div>
  );
}
