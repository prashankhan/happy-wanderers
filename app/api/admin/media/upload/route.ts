import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { uploadTourImage } from "@/lib/services/admin-media";
import { setAdminOperationContext } from "@/lib/sentry/context";

const allowedMime = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxBytes = 12 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role === "admin" ? "admin" : "staff";

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid form data" }, { status: 400 });
  }

  const tourId = form.get("tour_id")?.toString() ?? "";
  const file = form.get("file");
  if (!tourId || !(file instanceof File)) {
    return NextResponse.json({ success: false, message: "tour_id and file required" }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "admin_media_upload",
    admin_user_id: session.user.id,
    tour_id: tourId,
  });

  if (file.size > maxBytes) {
    return NextResponse.json({ success: false, message: "File too large" }, { status: 400 });
  }

  const mimeType = file.type || "application/octet-stream";
  if (!allowedMime.has(mimeType)) {
    return NextResponse.json({ success: false, message: "Unsupported image type" }, { status: 400 });
  }

  const altText = form.get("alt_text")?.toString() ?? null;
  const caption = form.get("caption")?.toString() ?? null;
  const isHero = form.get("is_hero")?.toString() === "true" || form.get("is_hero")?.toString() === "1";

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await uploadTourImage({
    tourId,
    buffer,
    fileName: file.name || "upload",
    mimeType,
    fileSize: file.size,
    altText: altText || null,
    caption: caption || null,
    isHero,
    role,
  });

  if (!result.ok) {
    const status = result.message.includes("Only admins") ? 403 : 400;
    return NextResponse.json({ success: false, message: result.message }, { status });
  }

  return NextResponse.json({ success: true, id: result.id, image_url: result.imageUrl });
}
