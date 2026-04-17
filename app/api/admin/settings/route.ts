import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { getSystemSettings, updateSystemSettings } from "@/lib/services/system-settings";
import { setAdminOperationContext } from "@/lib/sentry/context";

const optionalEmail = z.union([z.string().email(), z.literal(""), z.null()]).optional();
const optionalResendFrom = z.union([z.string().max(280), z.literal(""), z.null()]).optional();
const supportedCurrencies = new Set(
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("currency").map((code) => code.toUpperCase())
    : ["AUD", "USD", "EUR", "GBP", "NZD", "CAD", "SGD", "JPY"]
);
const optionalIsoCurrency = z
  .string()
  .trim()
  .length(3)
  .transform((value) => value.toUpperCase())
  .refine((value) => supportedCurrencies.has(value), "Currency must be a valid ISO code (e.g. AUD)")
  .optional();
const optionalIanaTimezone = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .refine((value) => {
    try {
      Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
      return true;
    } catch {
      return false;
    }
  }, "Timezone must be a valid IANA zone (e.g. Australia/Brisbane)")
  .optional();

const patchSchema = z.object({
  booking_reference_prefix: z.string().min(1).max(16).optional(),
  default_cutoff_hours: z.coerce.number().int().min(0).max(168).optional(),
  hold_expiry_minutes: z.coerce.number().int().min(1).max(1440).optional(),
  currency_code: optionalIsoCurrency,
  timezone: optionalIanaTimezone,
  business_name: z.string().max(200).nullable().optional(),
  support_email: optionalEmail,
  support_phone: z.string().max(40).nullable().optional(),
  resend_from_email: optionalResendFrom,
  admin_alert_email: optionalEmail,
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const row = await getSystemSettings();
    return NextResponse.json({
      success: true,
      settings: {
        booking_reference_prefix: row.bookingReferencePrefix,
        default_cutoff_hours: row.defaultCutoffHours,
        hold_expiry_minutes: row.holdExpiryMinutes,
        currency_code: row.currencyCode,
        timezone: row.timezone,
        business_name: row.businessName,
        support_email: row.supportEmail,
        support_phone: row.supportPhone,
        resend_from_email: row.resendFromEmail,
        admin_alert_email: row.adminAlertEmail,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load settings";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
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

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Validation failed";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }

  setAdminOperationContext({
    operation_type: "admin_system_settings_update",
    admin_user_id: session.user.id,
  });

  const d = parsed.data;
  const emptyToNull = (v: string | null | undefined) => (v === "" ? null : v);

  try {
    await updateSystemSettings({
      ...(d.booking_reference_prefix !== undefined
        ? { bookingReferencePrefix: d.booking_reference_prefix }
        : {}),
      ...(d.default_cutoff_hours !== undefined ? { defaultCutoffHours: d.default_cutoff_hours } : {}),
      ...(d.hold_expiry_minutes !== undefined ? { holdExpiryMinutes: d.hold_expiry_minutes } : {}),
      ...(d.currency_code !== undefined ? { currencyCode: d.currency_code.toUpperCase() } : {}),
      ...(d.timezone !== undefined ? { timezone: d.timezone } : {}),
      ...(d.business_name !== undefined ? { businessName: d.business_name } : {}),
      ...(d.support_email !== undefined ? { supportEmail: emptyToNull(d.support_email ?? null) } : {}),
      ...(d.support_phone !== undefined ? { supportPhone: emptyToNull(d.support_phone ?? null) } : {}),
      ...(d.resend_from_email !== undefined
        ? { resendFromEmail: emptyToNull(d.resend_from_email ?? null) }
        : {}),
      ...(d.admin_alert_email !== undefined
        ? { adminAlertEmail: emptyToNull(d.admin_alert_email ?? null) }
        : {}),
    });
    const row = await getSystemSettings();
    return NextResponse.json({
      success: true,
      settings: {
        booking_reference_prefix: row.bookingReferencePrefix,
        default_cutoff_hours: row.defaultCutoffHours,
        hold_expiry_minutes: row.holdExpiryMinutes,
        currency_code: row.currencyCode,
        timezone: row.timezone,
        business_name: row.businessName,
        support_email: row.supportEmail,
        support_phone: row.supportPhone,
        resend_from_email: row.resendFromEmail,
        admin_alert_email: row.adminAlertEmail,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
