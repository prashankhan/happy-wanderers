import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { sendContactAlert } from "@/lib/email/send";
import { getRequestIp, isRateLimited } from "@/lib/utils/rate-limit";
import { zodErrorToApiMessage } from "@/lib/utils/zod-api-message";

const emptyToNull = (v: unknown) => {
  if (v == null) return null;
  if (typeof v !== "string") return v;
  const t = v.trim();
  return t.length === 0 ? null : t;
};

const bodySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.preprocess(emptyToNull, z.string().nullable().optional()),
  topic: z.preprocess(emptyToNull, z.string().nullable().optional()),
  message: z.string().trim().min(5, "Please enter at least 5 characters in your message."),
});

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  if (
    await isRateLimited(`public-contact:${ip}`, {
      maxRequests: 6,
      windowMs: 15 * 60 * 1000,
    })
  ) {
    return NextResponse.json(
      { success: false, message: "Too many contact requests. Please wait and try again." },
      { status: 429 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: zodErrorToApiMessage(parsed.error, "Please check the form and try again.") },
      { status: 400 }
    );
  }

  try {
    await db.insert(contactMessages).values({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      topic: parsed.data.topic ?? null,
      message: parsed.data.message,
    });

    await sendContactAlert(parsed.data);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to submit your message right now. Please try again." },
      { status: 500 }
    );
  }
}
