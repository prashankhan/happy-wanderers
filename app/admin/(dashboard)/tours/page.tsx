import Link from "next/link";
import { asc, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { tours } from "@/lib/db/schema";

export default async function AdminToursPage() {
  const rows = await db.select().from(tours).where(isNull(tours.deletedAt)).orderBy(asc(tours.displayOrder));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Tours</h1>
          <p className="text-sm text-gray-600">Create, publish, and configure departures.</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
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
              <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                <td className="px-4 py-3 text-gray-600">{t.status}</td>
                <td className="px-4 py-3 text-gray-600">{t.isFeatured ? "Yes" : "—"}</td>
                <td className="px-4 py-3 text-gray-600">{t.defaultCapacity}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/tours/${t.id}`} className="text-blue-900 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
