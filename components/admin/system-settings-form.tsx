"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export interface SystemSettingsFormValues {
  booking_reference_prefix: string;
  default_cutoff_hours: number;
  hold_expiry_minutes: number;
  currency_code: string;
  timezone: string;
  business_name: string | null;
  support_email: string | null;
  support_phone: string | null;
  resend_from_email: string | null;
  admin_alert_email: string | null;
}

interface SystemSettingsFormProps {
  initial: SystemSettingsFormValues;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none ring-blue-900/15 focus:border-blue-900/30 focus:ring-2";

export function SystemSettingsForm({ initial }: SystemSettingsFormProps) {
  const [values, setValues] = useState<SystemSettingsFormValues>(initial);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_reference_prefix: values.booking_reference_prefix,
          default_cutoff_hours: values.default_cutoff_hours,
          hold_expiry_minutes: values.hold_expiry_minutes,
          currency_code: values.currency_code,
          timezone: values.timezone,
          business_name: values.business_name || null,
          support_email: values.support_email || "",
          support_phone: values.support_phone || null,
          resend_from_email: values.resend_from_email || "",
          admin_alert_email: values.admin_alert_email || "",
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        settings?: SystemSettingsFormValues;
      };
      if (!res.ok || !data.success) {
        setMessage(data.message ?? "Save failed");
        return;
      }
      if (data.settings) {
        setValues({
          ...data.settings,
          business_name: data.settings.business_name ?? null,
          support_email: data.settings.support_email ?? null,
          support_phone: data.settings.support_phone ?? null,
          resend_from_email: data.settings.resend_from_email ?? null,
          admin_alert_email: data.settings.admin_alert_email ?? null,
        });
      }
      setMessage("Saved.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-gray-900">Booking defaults</h2>
        <p className="mt-1 text-sm text-gray-600">
          Reference prefix, payment hold length, and default cutoff (tours can override).
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            Booking reference prefix
            <input
              className={inputClass}
              value={values.booking_reference_prefix}
              onChange={(e) =>
                setValues((v) => ({ ...v, booking_reference_prefix: e.target.value.toUpperCase() }))
              }
              maxLength={16}
              required
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Default cutoff (hours before departure)
            <input
              type="number"
              className={inputClass}
              value={values.default_cutoff_hours}
              min={0}
              max={168}
              onChange={(e) =>
                setValues((v) => ({ ...v, default_cutoff_hours: Number(e.target.value) || 0 }))
              }
              required
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Pending hold expiry (minutes)
            <input
              type="number"
              className={inputClass}
              value={values.hold_expiry_minutes}
              min={1}
              max={1440}
              onChange={(e) =>
                setValues((v) => ({ ...v, hold_expiry_minutes: Number(e.target.value) || 1 }))
              }
              required
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Default currency (ISO)
            <input
              className={inputClass}
              value={values.currency_code}
              onChange={(e) =>
                setValues((v) => ({ ...v, currency_code: e.target.value.toUpperCase().slice(0, 3) }))
              }
              maxLength={3}
              required
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
            Timezone (IANA)
            <input
              className={inputClass}
              value={values.timezone}
              onChange={(e) => setValues((v) => ({ ...v, timezone: e.target.value }))}
              placeholder="Australia/Brisbane"
              required
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-gray-900">Business & contact</h2>
        <p className="mt-1 text-sm text-gray-600">Shown in emails and customer-facing copy where used.</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
            Business name
            <input
              className={inputClass}
              value={values.business_name ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, business_name: e.target.value || null }))}
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Support email
            <input
              type="email"
              className={inputClass}
              value={values.support_email ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, support_email: e.target.value || null }))}
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Support phone
            <input
              className={inputClass}
              value={values.support_phone ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, support_phone: e.target.value || null }))}
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
            Resend &quot;from&quot; address
            <input
              className={inputClass}
              value={values.resend_from_email ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, resend_from_email: e.target.value || null }))}
              placeholder={"Happy Wanderers <hello@yourdomain.com>"}
            />
            <span className="mt-1 block text-xs text-gray-500">
              Must use a domain verified in Resend. If set, this overrides the EMAIL_FROM / RESEND_FROM
              environment variables (recommended for production on Vercel).
            </span>
          </label>
          <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
            Admin alert email (new bookings, contact form)
            <input
              type="email"
              className={inputClass}
              value={values.admin_alert_email ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, admin_alert_email: e.target.value || null }))}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
        {message ? (
          <p className={`text-sm ${message === "Saved." ? "text-green-700" : "text-red-600"}`}>{message}</p>
        ) : null}
      </div>
    </form>
  );
}
