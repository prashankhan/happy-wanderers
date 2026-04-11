import type { Session } from "next-auth";

export function requireAdmin(session: Session | null): session is Session & {
  user: { role: "admin" };
} {
  return Boolean(session?.user?.role === "admin");
}

export function isStaff(session: Session | null): boolean {
  return session?.user?.role === "staff" || session?.user?.role === "admin";
}
