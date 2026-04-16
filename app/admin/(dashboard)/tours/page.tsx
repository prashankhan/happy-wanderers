import Link from "next/link";
import { asc, isNull } from "drizzle-orm";

import { auth } from "@/auth";
import { CreateTourButton } from "@/components/admin/create-tour-button";
import { StatusBadge, FeaturedBadge } from "@/components/admin/status-badge";
import { db } from "@/lib/db";
import { tours } from "@/lib/db/schema";

export default async function AdminToursPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const rows = await db.select().from(tours).where(isNull(tours.deletedAt)).orderBy(asc(tours.displayOrder));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-heading">Tours</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Add new tours as drafts, then edit content, departures, pricing, and publishing.
          </p>
        </div>
        {isAdmin ? <CreateTourButton /> : null}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-sm border border-dashed border-brand-border bg-white p-8 md:p-12 text-center">
          <p className="text-sm text-brand-muted">No tours yet.</p>
          {isAdmin ? (
            <p className="mt-2 text-sm text-brand-muted">
              Use <strong>New tour</strong> above to create a draft and configure it in the editor.
            </p>
          ) : (
            <p className="mt-2 text-sm text-brand-muted">Ask an admin to create the first tour.</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-brand-border bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-brand-border bg-brand-surface text-xs font-bold uppercase tracking-normal text-brand-muted">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-brand-border/50 hover:bg-brand-surface-soft">
                  <td className="px-4 py-3 font-medium text-brand-heading">{t.title}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3"><FeaturedBadge featured={t.isFeatured} /></td>
                  <td className="px-4 py-3 text-brand-body">{t.defaultCapacity}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/tours/${t.id}`} className="text-brand-primary hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
