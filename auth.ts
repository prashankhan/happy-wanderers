import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 20;

function rateLimitKey(email: string, ip: string | null) {
  return `${email.toLowerCase()}|${ip ?? "unknown"}`;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count += 1;
  return true;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString() ?? "";
        if (!email || !password) return null;

        const forwarded = request?.headers?.get("x-forwarded-for");
        const ip = forwarded?.split(",")[0]?.trim() ?? request?.headers?.get("x-real-ip");
        const key = rateLimitKey(email, ip ?? null);
        if (!checkRateLimit(key)) return null;

        const rows = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
        const user = rows[0];
        if (!user) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        await db
          .update(adminUsers)
          .set({
            lastLoginAt: new Date(),
            lastLoginIp: ip ?? null,
            updatedAt: new Date(),
          })
          .where(eq(adminUsers.id, user.id));

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        const r = token.role;
        session.user.role = r === "admin" || r === "staff" ? r : "staff";
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
});
