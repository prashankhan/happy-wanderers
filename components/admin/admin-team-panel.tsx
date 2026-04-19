"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { adminFieldClass } from "@/components/admin/form-field-styles";
import { Button } from "@/components/ui/button";
import { formatDateInTz } from "@/lib/utils/dates";

export interface TeamUserRow {
  id: string;
  email: string;
  role: "admin" | "staff";
  lastLoginAt: string | null;
  createdAt: string;
}

interface AdminTeamPanelProps {
  initialUsers: TeamUserRow[];
  businessTimezone: string;
}

export function AdminTeamPanel({ initialUsers, businessTimezone }: AdminTeamPanelProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        setMessage({
          type: "err",
          text: typeof data.message === "string" && data.message.length > 0 ? data.message : "Could not create user.",
        });
        return;
      }
      setEmail("");
      setPassword("");
      setRole("staff");
      setMessage({ type: "ok", text: "User created. They can sign in at /admin/login." });
      router.refresh();
    } catch {
      setMessage({ type: "err", text: "Network error. Try again." });
    } finally {
      setPending(false);
    }
  }

  const labelClass = "text-xs font-medium text-brand-muted";

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto rounded-sm border border-brand-border bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-brand-border bg-brand-surface text-xs font-bold uppercase tracking-normal text-brand-muted">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Last sign-in</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {initialUsers.map((u) => (
              <tr key={u.id} className="border-b border-brand-border/50">
                <td className="px-4 py-3 font-medium text-brand-heading">{u.email}</td>
                <td className="px-4 py-3 text-brand-body capitalize">{u.role}</td>
                <td className="px-4 py-3 text-brand-body">
                  {u.lastLoginAt
                    ? formatDateInTz(new Date(u.lastLoginAt), businessTimezone, "d MMM yyyy, h:mm a")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-brand-body">
                  {formatDateInTz(new Date(u.createdAt), businessTimezone, "d MMM yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {initialUsers.length === 0 && (
          <div className="p-8 text-center text-sm text-brand-muted">No users yet. Add one below.</div>
        )}
      </div>

      <div className="rounded-sm border border-brand-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-heading">Add team member</h2>
        <p className="mt-1 text-sm text-brand-muted">They will use this email and password at the admin login page.</p>

        <form onSubmit={(e) => void onSubmit(e)} className="mt-6 grid max-w-lg gap-4">
          {message ? (
            <p
              role="alert"
              className={
                message.type === "ok"
                  ? "rounded-sm border border-availability-open/30 bg-brand-surface-soft p-3 text-sm font-medium text-availability-open"
                  : "rounded-sm border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-600"
              }
            >
              {message.text}
            </p>
          ) : null}

          <label className={labelClass}>
            Email
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 ${adminFieldClass}`}
              disabled={pending}
            />
          </label>

          <label className={labelClass}>
            Password
            <input
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 ${adminFieldClass}`}
              disabled={pending}
              placeholder="At least 8 characters"
            />
          </label>

          <label className={labelClass}>
            Role
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "staff")}
              className={`mt-1 ${adminFieldClass}`}
              disabled={pending}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <div>
            <Button type="submit" variant="primary" size="sm" disabled={pending}>
              {pending ? "Creating…" : "Create user"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
