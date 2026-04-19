import { count, desc } from "drizzle-orm";
import { Suspense } from "react";

import { auth } from "@/auth";
import { AdminPageReveal } from "@/components/admin/admin-page-reveal";
import { Pagination } from "@/components/admin/pagination";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { getSystemSettings } from "@/lib/services/system-settings";
import { DEFAULT_TZ, formatDateInTz } from "@/lib/utils/dates";

const PAGE_SIZE = 25;

export default async function AdminContactMessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-brand-heading">Contact messages</h1>
        <p className="text-sm text-brand-muted">Contact submissions are restricted to administrators.</p>
        <div className="rounded-sm border border-brand-border bg-white p-8 text-sm text-brand-body shadow-sm">
          Your account does not have permission to access this section.
        </div>
      </div>
    );
  }

  const sp = await searchParams;
  const pageRaw = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;
  const pageCandidate = isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;

  const settings = await getSystemSettings();
  const businessTimezone = settings.timezone?.trim() || DEFAULT_TZ;

  const [countResult] = await db.select({ count: count() }).from(contactMessages);
  const totalCount = countResult?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const page = Math.min(pageCandidate, totalPages);
  const offset = (page - 1) * PAGE_SIZE;

  const rows = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  return (
    <AdminPageReveal>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-heading">Contact messages</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Submissions from the public contact form. Times are shown in your business timezone (
            {businessTimezone}).
          </p>
        </div>

        <div className="overflow-x-auto rounded-sm border border-brand-border bg-white shadow-sm">
          {rows.length > 0 && (
            <div className="border-b border-brand-border px-4 py-2 text-xs text-brand-muted">
              Showing {offset + 1}-{Math.min(offset + rows.length, totalCount)} of {totalCount} message
              {totalCount !== 1 ? "s" : ""}
            </div>
          )}
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-brand-border bg-brand-surface text-xs font-bold uppercase tracking-normal text-brand-muted">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Received</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Topic</th>
                <th className="min-w-[200px] px-4 py-3">Message</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-brand-border/50 align-top hover:bg-brand-surface-soft">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-brand-body">
                    {formatDateInTz(row.createdAt, businessTimezone, "d MMM yyyy, h:mm a")}
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-heading">{row.name}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${encodeURIComponent(row.email)}`}
                      className="text-brand-primary hover:underline break-all"
                    >
                      {row.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-brand-body">
                    {row.phone ? (
                      <a href={`tel:${row.phone.replace(/\s/g, "")}`} className="hover:underline">
                        {row.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="max-w-[140px] px-4 py-3 text-brand-body">{row.topic ?? "—"}</td>
                  <td className="max-w-md px-4 py-3">
                    <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-brand-body">{row.message}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="p-8 text-center text-sm text-brand-muted">No messages yet.</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center py-4">
            <Suspense fallback={<div className="h-8" aria-hidden />}>
              <Pagination currentPage={page} totalPages={totalPages} />
            </Suspense>
          </div>
        )}
      </div>
    </AdminPageReveal>
  );
}
