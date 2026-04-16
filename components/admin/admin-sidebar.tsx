"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/tours", label: "Tours", icon: ToursIcon },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/admin/bookings", label: "Bookings", icon: BookingsIcon },
  { href: "/admin/manifests", label: "Manifests", icon: ManifestsIcon },
  { href: "/admin/reports", label: "Reports", icon: ReportsIcon },
  { href: "/admin/media", label: "Media", icon: MediaIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="11 17 6 12 11 7" />
      <polyline points="18 17 13 12 18 7" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="13 17 18 12 13 7" />
      <polyline points="6 17 11 12 6 7" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  );
}

function ToursIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18V6l9-4 9 4v12" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BookingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ManifestsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function MediaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-50 rounded-sm border border-brand-border bg-white p-2 shadow-md lg:hidden"
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:border-r lg:border-brand-border lg:bg-slate-50",
          collapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        <div className="relative flex h-[72px] items-center justify-between border-b border-brand-border px-4">
          <div className={cn("flex items-center", collapsed && "w-full justify-center")}>
            {collapsed ? (
              <p className="text-base font-bold text-brand-heading">HW</p>
            ) : (
              <div>
                <p className="text-xs font-bold uppercase tracking-normal text-brand-muted">Operator</p>
                <p className="text-base font-semibold text-brand-heading">Happy Wanderers</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "rounded-sm p-1.5 text-brand-muted hover:bg-brand-surface hover:text-brand-heading transition-colors",
              collapsed && "absolute right-0 top-0"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ExpandIcon /> : <CollapseIcon />}
          </button>
        </div>
        <nav className={cn("flex-1 space-y-1 py-4", collapsed ? "px-2" : "px-3")}>
          {items.map((item) => {
            const Icon = item.icon;
            const isExactMatch = pathname === item.href;
            const isSubMatch = item.href !== "/admin" && pathname.startsWith(`${item.href}/`);
            const active = isExactMatch || isSubMatch;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  active
                    ? "bg-brand-primary text-white"
                    : "text-brand-body hover:bg-brand-surface"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className={cn("border-t border-brand-border py-4", collapsed ? "px-2" : "px-3")}>
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/admin/login" })}
            className={cn(
              "flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-brand-body hover:bg-brand-surface transition-colors",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogoutIcon />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-brand-border bg-slate-50 transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-brand-muted">Operator</p>
            <p className="mt-0.5 text-base font-semibold text-brand-heading">Happy Wanderers</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => {
            const Icon = item.icon;
            const isExactMatch = pathname === item.href;
            const isSubMatch = item.href !== "/admin" && pathname.startsWith(`${item.href}/`);
            const active = isExactMatch || isSubMatch;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-primary text-white"
                    : "text-brand-body hover:bg-brand-surface"
                )}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-brand-border px-3 py-4">
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-brand-body hover:bg-brand-surface transition-colors"
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
