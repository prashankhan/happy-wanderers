import { auth } from "@/auth";
import { SystemSettingsForm } from "@/components/admin/system-settings-form";
import { getSystemSettings } from "@/lib/services/system-settings";

export default async function AdminSettingsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <h1 className="font-serif text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-600">System configuration is restricted to administrators.</p>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
          Your account does not have permission to change global settings. Contact an admin if something needs
          updating.
        </div>
      </div>
    );
  }

  const row = await getSystemSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-600">
          Global booking defaults, currency, timezone, and contact details stored in{" "}
          <code className="rounded bg-gray-100 px-1 text-xs">system_settings</code>.
        </p>
      </div>
      <SystemSettingsForm
        initial={{
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
        }}
      />
    </div>
  );
}
