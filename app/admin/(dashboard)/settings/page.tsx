import { auth } from "@/auth";
import { SystemSettingsForm } from "@/components/admin/system-settings-form";
import { getSystemSettings } from "@/lib/services/system-settings";

export default async function AdminSettingsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-brand-heading">Settings</h1>
        <p className="text-sm text-brand-muted">System configuration is restricted to administrators.</p>
        <div className="rounded-sm border border-brand-border bg-white p-8 text-sm text-brand-body shadow-sm">
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
        <h1 className="text-2xl font-bold text-brand-heading">Settings</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Manage booking defaults, currency, timezone, and contact details for your business.
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
