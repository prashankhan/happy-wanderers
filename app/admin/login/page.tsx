"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";

const loginLabelClass =
  "mb-2 block text-base font-bold uppercase tracking-normal text-brand-muted";

const loginFieldClass =
  "w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition placeholder:text-brand-body/35 focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid credentials");
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <section className="bg-brand-surface-soft/30 text-brand-heading">
      <div className="flex min-h-screen items-center justify-center px-6 py-10">
        <Card className="w-full max-w-md rounded-sm border-brand-border shadow-lg shadow-brand-heading/5 ring-1 ring-brand-heading/5">
          <CardHeader className="mb-2 space-y-2">
            <CardTitle className="text-3xl md:text-4xl">Admin sign in</CardTitle>
            <CardDescription>Use your staff credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4 md:space-y-5">
              <label htmlFor="admin-email" className={loginLabelClass}>
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                className={loginFieldClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label htmlFor="admin-password" className={loginLabelClass}>
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                className={loginFieldClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error ? (
                <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                variant="primary"
                className={`${primaryTourCtaClassName} w-full`}
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>

              <p className="pt-1 text-center text-sm text-brand-body">
                Looking for tours?{" "}
                <Link href="/" className="font-semibold text-brand-primary underline-offset-2 hover:underline">
                  Visit public website
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
