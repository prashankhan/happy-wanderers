import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { systemJobsLog } from "@/lib/db/schema";
import { expirePendingBookings } from "@/lib/services/bookings";
import { captureJobFailure } from "@/lib/sentry/capture";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const started = Date.now();
  Sentry.getCurrentScope().setContext("background_job", {
    job_name: "expire_pending_bookings_cron",
    path: "/api/cron/expire-pending",
  });
  Sentry.getCurrentScope().setTag("job_name", "expire_pending_bookings_cron");

  let n = 0;
  try {
    n = await expirePendingBookings();
  } catch (err) {
    const elapsed = Date.now() - started;
    captureJobFailure(err, {
      job_name: "expire_pending_bookings",
      job_execution_time_ms: elapsed,
    });
    await db.insert(systemJobsLog).values({
      jobName: "expire_pending_bookings",
      runAt: new Date(),
      recordsProcessed: 0,
      status: "failed",
      errorMessage: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ success: false, message: "Expire job failed" }, { status: 500 });
  }

  Sentry.getCurrentScope().setContext("background_job", {
    job_name: "expire_pending_bookings_cron",
    job_execution_time_ms: Date.now() - started,
    records_expired: n,
  });
  await db.insert(systemJobsLog).values({
    jobName: "expire_pending_bookings",
    runAt: new Date(),
    recordsProcessed: n,
    status: "success",
  });

  return NextResponse.json({ success: true, expired: n });
}
