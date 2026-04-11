import { NextResponse } from "next/server";

/**
 * Throws a test error when `SENTRY_DEBUG_SECRET` matches the `x-sentry-debug-secret` header.
 * Disabled in production unless the secret env var is set.
 */
export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.SENTRY_DEBUG_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, message: "Sentry test route disabled" }, { status: 404 });
  }

  const header = request.headers.get("x-sentry-debug-secret");
  if (header !== secret) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  throw new Error("Sentry test exception (safe verification)");
}
