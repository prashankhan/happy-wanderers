"use client";

import { useEffect, useMemo, useState } from "react";

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
  "w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10";

export function SystemSettingsForm({ initial }: SystemSettingsFormProps) {
  const [values, setValues] = useState<SystemSettingsFormValues>(initial);
  const [savedValues, setSavedValues] = useState<SystemSettingsFormValues>(initial);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SystemSettingsFormValues, string>>>({});
  const timezoneOptions = getTimezoneOptions(values.timezone);
  const currencyOptions = getCurrencyOptions(values.currency_code);
  const [timezoneQuery, setTimezoneQuery] = useState(initial.timezone);
  const [timezoneOpen, setTimezoneOpen] = useState(false);
  const [timezoneActiveIndex, setTimezoneActiveIndex] = useState(0);
  const [currencyQuery, setCurrencyQuery] = useState(initial.currency_code);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currencyActiveIndex, setCurrencyActiveIndex] = useState(0);
  const filteredTimezones = useMemo(() => {
    const q = timezoneQuery.trim().toLowerCase();
    if (!q) return timezoneOptions.slice(0, 200);
    return timezoneOptions.filter((tz) => tz.toLowerCase().includes(q)).slice(0, 200);
  }, [timezoneOptions, timezoneQuery]);
  const filteredCurrencies = useMemo(() => {
    const q = currencyQuery.trim().toLowerCase();
    if (!q) return currencyOptions.slice(0, 120);
    return currencyOptions.filter((code) => code.toLowerCase().includes(q)).slice(0, 120);
  }, [currencyOptions, currencyQuery]);

  useEffect(() => {
    setTimezoneQuery(values.timezone);
  }, [values.timezone]);
  useEffect(() => {
    setCurrencyQuery(values.currency_code);
  }, [values.currency_code]);
  useEffect(() => {
    if (!timezoneOpen) return;
    const selectedIndex = filteredTimezones.findIndex((tz) => tz === values.timezone);
    setTimezoneActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [timezoneOpen, filteredTimezones, values.timezone]);
  useEffect(() => {
    if (!currencyOpen) return;
    const selectedIndex = filteredCurrencies.findIndex((code) => code === values.currency_code);
    setCurrencyActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [currencyOpen, filteredCurrencies, values.currency_code]);

  function selectCurrency(code: string) {
    setValues((v) => ({ ...v, currency_code: code }));
    setCurrencyQuery(code);
    setCurrencyOpen(false);
  }

  function selectTimezone(tz: string) {
    setValues((v) => ({ ...v, timezone: tz }));
    setTimezoneQuery(tz);
    setTimezoneOpen(false);
  }

  const isDirty = useMemo(
    () => JSON.stringify(normalizeSettings(values)) !== JSON.stringify(normalizeSettings(savedValues)),
    [values, savedValues]
  );

  useEffect(() => {
    if (!isDirty || pending) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, pending]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    setFieldErrors({});
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
        const errorMessage = data.message ?? "Save failed";
        setMessage(errorMessage);
        const field = getFieldFromApiMessage(errorMessage);
        if (field) {
          setFieldErrors((prev) => ({ ...prev, [field]: errorMessage }));
        }
        return;
      }
      if (data.settings) {
        const nextValues = {
          ...data.settings,
          business_name: data.settings.business_name ?? null,
          support_email: data.settings.support_email ?? null,
          support_phone: data.settings.support_phone ?? null,
          resend_from_email: data.settings.resend_from_email ?? null,
          admin_alert_email: data.settings.admin_alert_email ?? null,
        };
        setValues(nextValues);
        setSavedValues(nextValues);
      }
      setMessage("Saved.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-sm border border-brand-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-brand-heading">Booking defaults</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Reference prefix, payment hold length, and default cutoff (tours can override).
        </p>
        <div className="mt-6 grid gap-4 md:gap-6 md:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Booking reference prefix</label>
            <input
              className={inputClass}
              value={values.booking_reference_prefix}
              onChange={(e) =>
                setValues((v) => ({ ...v, booking_reference_prefix: e.target.value.toUpperCase() }))
              }
              maxLength={16}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Default cutoff (hours before departure)</label>
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
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Pending hold expiry (minutes)</label>
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
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Default currency (ISO)</label>
            <div className="relative">
              <input
                className={inputClass}
                value={currencyQuery}
                onChange={(e) => {
                  const next = e.target.value.toUpperCase().slice(0, 3);
                  setCurrencyQuery(next);
                  setValues((v) => ({ ...v, currency_code: next }));
                  setCurrencyOpen(true);
                }}
                onFocus={() => setCurrencyOpen(true)}
                onBlur={() => {
                  setTimeout(() => setCurrencyOpen(false), 120);
                }}
                onKeyDown={(e) => {
                  if (!currencyOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                    e.preventDefault();
                    setCurrencyOpen(true);
                    return;
                  }
                  if (!currencyOpen) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setCurrencyActiveIndex((i) => Math.min(i + 1, filteredCurrencies.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setCurrencyActiveIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const current = filteredCurrencies[currencyActiveIndex];
                    if (current) selectCurrency(current);
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    setCurrencyOpen(false);
                  }
                }}
                placeholder="Search currency code (e.g. AUD)"
                maxLength={3}
                required
                role="combobox"
                aria-expanded={currencyOpen}
                aria-controls="currency-listbox"
                aria-autocomplete="list"
                aria-haspopup="listbox"
                aria-activedescendant={
                  currencyOpen && filteredCurrencies[currencyActiveIndex]
                    ? getOptionId("currency", filteredCurrencies[currencyActiveIndex])
                    : undefined
                }
                aria-invalid={Boolean(fieldErrors.currency_code)}
                aria-describedby={fieldErrors.currency_code ? "settings-currency-error" : undefined}
              />
              {currencyOpen ? (
                <div
                  id="currency-listbox"
                  role="listbox"
                  className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-sm border border-brand-border bg-white shadow-lg"
                >
                  {filteredCurrencies.length > 0 ? (
                    filteredCurrencies.map((code, idx) => (
                      <button
                        key={code}
                        id={getOptionId("currency", code)}
                        type="button"
                        className={`block w-full px-3 py-2 text-left text-sm hover:bg-brand-surface ${
                          code === values.currency_code || idx === currencyActiveIndex
                            ? "bg-brand-surface-soft font-semibold text-brand-heading"
                            : "text-brand-body"
                        }`}
                        role="option"
                        aria-selected={code === values.currency_code}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectCurrency(code);
                        }}
                      >
                        {code}
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-brand-muted">No currency matches your search.</p>
                  )}
                </div>
              ) : null}
            </div>
            <span className="mt-1 block text-xs text-brand-muted">Search and select a 3-letter ISO currency code.</span>
            {fieldErrors.currency_code ? (
              <p id="settings-currency-error" className="mt-1 text-xs text-red-600">
                {fieldErrors.currency_code}
              </p>
            ) : null}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Timezone (IANA)</label>
            <div className="relative">
              <input
                className={inputClass}
                value={timezoneQuery}
                onChange={(e) => {
                  const next = e.target.value;
                  setTimezoneQuery(next);
                  setValues((v) => ({ ...v, timezone: next }));
                  setTimezoneOpen(true);
                }}
                onFocus={() => setTimezoneOpen(true)}
                onBlur={() => {
                  setTimeout(() => setTimezoneOpen(false), 120);
                }}
                onKeyDown={(e) => {
                  if (!timezoneOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                    e.preventDefault();
                    setTimezoneOpen(true);
                    return;
                  }
                  if (!timezoneOpen) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setTimezoneActiveIndex((i) => Math.min(i + 1, filteredTimezones.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setTimezoneActiveIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const current = filteredTimezones[timezoneActiveIndex];
                    if (current) selectTimezone(current);
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    setTimezoneOpen(false);
                  }
                }}
                placeholder="Search timezone (e.g. Australia/Brisbane)"
                required
                role="combobox"
                aria-expanded={timezoneOpen}
                aria-controls="timezone-listbox"
                aria-autocomplete="list"
                aria-haspopup="listbox"
                aria-activedescendant={
                  timezoneOpen && filteredTimezones[timezoneActiveIndex]
                    ? getOptionId("timezone", filteredTimezones[timezoneActiveIndex])
                    : undefined
                }
                aria-invalid={Boolean(fieldErrors.timezone)}
                aria-describedby={fieldErrors.timezone ? "settings-timezone-error" : undefined}
              />
              {timezoneOpen ? (
                <div
                  id="timezone-listbox"
                  role="listbox"
                  className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-sm border border-brand-border bg-white shadow-lg"
                >
                  {filteredTimezones.length > 0 ? (
                    filteredTimezones.map((tz, idx) => (
                      <button
                        key={tz}
                        id={getOptionId("timezone", tz)}
                        type="button"
                        className={`block w-full px-3 py-2 text-left text-sm hover:bg-brand-surface ${
                          tz === values.timezone || idx === timezoneActiveIndex
                            ? "bg-brand-surface-soft font-semibold text-brand-heading"
                            : "text-brand-body"
                        }`}
                        role="option"
                        aria-selected={tz === values.timezone}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectTimezone(tz);
                        }}
                      >
                        {tz}
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-brand-muted">No timezone matches your search.</p>
                  )}
                </div>
              ) : null}
            </div>
            <span className="mt-1 block text-xs text-brand-muted">
              Search and select a standard IANA timezone used for booking dates and emails.
            </span>
            {fieldErrors.timezone ? (
              <p id="settings-timezone-error" className="mt-1 text-xs text-red-600">
                {fieldErrors.timezone}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-brand-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-brand-heading">Business & contact</h2>
        <p className="mt-1 text-sm text-brand-muted">Shown in emails and customer-facing copy where used.</p>
        <div className="mt-6 grid gap-4 md:gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Business name</label>
            <input
              className={inputClass}
              value={values.business_name ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, business_name: e.target.value || null }))}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Support email</label>
            <input
              type="email"
              className={inputClass}
              value={values.support_email ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, support_email: e.target.value || null }))}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Support phone</label>
            <input
              className={inputClass}
              value={values.support_phone ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, support_phone: e.target.value || null }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Resend &quot;from&quot; address</label>
            <input
              className={inputClass}
              value={values.resend_from_email ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, resend_from_email: e.target.value || null }))}
              placeholder={"Happy Wanderers <hello@yourdomain.com>"}
            />
            <span className="mt-1 block text-xs text-brand-muted">
              Must use a domain verified in Resend. If set, this overrides the EMAIL_FROM / RESEND_FROM
              environment variables (recommended for production on Vercel).
            </span>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-normal text-brand-muted mb-2">Admin alert email (new bookings, contact form)</label>
            <input
              type="email"
              className={inputClass}
              value={values.admin_alert_email ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, admin_alert_email: e.target.value || null }))}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" size="sm" disabled={pending || !isDirty}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
        {message ? (
          <p className={`text-sm ${message === "Saved." ? "text-green-600" : "text-red-600"}`}>{message}</p>
        ) : null}
      </div>
    </form>
  );
}

const fallbackTimezones = [
  "Australia/Brisbane",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

function getTimezoneOptions(current: string): string[] {
  const supported =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : fallbackTimezones;
  const merged = supported.includes(current) ? supported : [current, ...supported];
  return Array.from(new Set(merged)).sort((a, b) => a.localeCompare(b));
}

const fallbackCurrencies = ["AUD", "USD", "EUR", "GBP", "NZD", "CAD", "SGD", "JPY"];

function getCurrencyOptions(current: string): string[] {
  const supported =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("currency").map((code) => code.toUpperCase())
      : fallbackCurrencies;
  const normalized = current.toUpperCase();
  const merged = supported.includes(normalized) ? supported : [normalized, ...supported];
  return Array.from(new Set(merged)).sort((a, b) => a.localeCompare(b));
}

function getFieldFromApiMessage(message: string): keyof SystemSettingsFormValues | null {
  const m = message.toLowerCase();
  if (m.includes("timezone")) return "timezone";
  if (m.includes("currency")) return "currency_code";
  if (m.includes("support email")) return "support_email";
  if (m.includes("admin alert")) return "admin_alert_email";
  if (m.includes("resend")) return "resend_from_email";
  return null;
}

function normalizeSettings(values: SystemSettingsFormValues): SystemSettingsFormValues {
  return {
    ...values,
    booking_reference_prefix: values.booking_reference_prefix.trim(),
    currency_code: values.currency_code.trim().toUpperCase(),
    timezone: values.timezone.trim(),
    business_name: values.business_name?.trim() || null,
    support_email: values.support_email?.trim() || null,
    support_phone: values.support_phone?.trim() || null,
    resend_from_email: values.resend_from_email?.trim() || null,
    admin_alert_email: values.admin_alert_email?.trim() || null,
  };
}

function getOptionId(prefix: "currency" | "timezone", value: string): string {
  return `${prefix}-option-${value.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}
