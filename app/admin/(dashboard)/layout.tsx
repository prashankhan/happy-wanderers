import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const dynamic = "force-dynamic";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-brand-surface overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 h-full overflow-y-auto p-6 pt-20 lg:p-8 lg:pt-8">{children}</main>
    </div>
  );
}
