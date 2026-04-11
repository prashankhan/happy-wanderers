/**
 * Sentry environment + release helpers (server, edge, and build-time safe).
 */

export function getSentryEnvironment(): string {
  if (process.env.SENTRY_ENVIRONMENT) return process.env.SENTRY_ENVIRONMENT;
  const vercel = process.env.VERCEL_ENV;
  if (vercel === "production" || vercel === "preview" || vercel === "development") return vercel;
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

export function getSentryRelease(): string | undefined {
  return (
    process.env.SENTRY_RELEASE ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_SENTRY_RELEASE ||
    undefined
  );
}
