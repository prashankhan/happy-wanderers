import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { isRateLimited } from "@/lib/utils/rate-limit";

function getAuthRequestIp(request: Request | undefined): string {
  const forwarded = request?.headers?.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request?.headers?.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
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

        const ip = getAuthRequestIp(request);
        const windowMs = 15 * 60 * 1000;

        // Bucket by source IP to slow broad probes.
        if (
          await isRateLimited(`admin-login-ip:${ip}`, {
            maxRequests: 30,
            windowMs,
          })
        ) {
          return null;
        }

        // Bucket by email+IP to lock out focused credential guessing.
        if (
          await isRateLimited(`admin-login-email-ip:${email}:${ip}`, {
            maxRequests: 5,
            windowMs,
          })
        ) {
          return null;
        }

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
