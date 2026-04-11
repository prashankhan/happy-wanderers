import * as Sentry from "@sentry/nextjs";

import { sentryBeforeSend } from "./lib/sentry/before-send";
import { getSentryEnvironment, getSentryRelease } from "./lib/sentry/env";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: getSentryEnvironment(),
  release: getSentryRelease(),
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  beforeSend: sentryBeforeSend,
  ignoreErrors: [
    /^ResizeObserver loop/i,
    /^AbortError: The user aborted a request/i,
  ],
});
