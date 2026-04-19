import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { setAdminOperationContext } from "@/lib/sentry/context";
import { zodErrorToApiMessage } from "@/lib/utils/zod-api-message";

const createSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
  role: z.enum(["admin", "staff"], { message: "Role must be admin or staff." }),
});

function isUniqueViolation(e: unknown): boolean {
  if (typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "23505")
    return true;
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes("duplicate key") || msg.includes("unique constraint");
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: zodErrorToApiMessage(parsed.error, "Check the form and try again.") },
      { status: 400 }
    );
  }

  setAdminOperationContext({
    operation_type: "admin_create_user",
    admin_user_id: session.user.id,
  });

  const passwordHash = await hash(parsed.data.password, 12);
  const now = new Date();

  try {
    await db.insert(adminUsers).values({
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      updatedAt: now,
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (isUniqueViolation(e)) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }
    console.error("[admin/users] insert failed", e);
    return NextResponse.json(
      { success: false, message: "Could not create user. Please try again." },
      { status: 500 }
    );
  }
}
