import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { sendContactAlert } from "@/lib/email/send";

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  topic: z.string().optional().nullable(),
  message: z.string().min(5),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Validation failed" }, { status: 400 });
  }

  await db.insert(contactMessages).values({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    topic: parsed.data.topic ?? null,
    message: parsed.data.message,
  });

  await sendContactAlert(parsed.data);

  return NextResponse.json({ success: true });
}
