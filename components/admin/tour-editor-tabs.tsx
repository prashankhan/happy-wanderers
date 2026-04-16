"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AddPricingRuleModal } from "@/components/admin/add-pricing-rule-modal";
import { Toast, useToast } from "@/components/admin/toast";
import { TourMediaSection } from "@/components/admin/tour-media-section";
import { Button } from "@/components/ui/button";

/** Matches `getUTCDay()` / availability engine: 0 = Sunday … 6 = Saturday */
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface SerializedTour {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  durationText: string;
  durationMinutes: number;
  groupSizeText: string;
  defaultCapacity: number;
  priceFromText: string | null;
  locationRegion: string;
  inclusions: string[] | null;
  exclusions: string[] | null;
  whatToBring: string[] | null;
  pickupNotes: string | null;
  cancellationPolicy: string | null;
  heroBadge: string | null;
  bookingCutoffHours: number;
  bookingEnabled: boolean;
  isActive: boolean;
  status: string;
  isFeatured: boolean;
  displayOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface PricingRuleRow {
  id: string;
  tourId: string;
  label: string;
  adultPrice: string;
  childPrice: string;
  infantPrice: string;
  infantPricingType: string;
  currencyCode: string;
  validFrom: string | null;
  validUntil: string | null;
  priority: number;
  isActive: boolean;
}

interface AvailabilityRuleRow {
  id: string | null;
  weekday: number;
  default_capacity: number | null;
  is_active: boolean;
}

export interface TourEditorTabsProps {
  tour: SerializedTour;
  role: "admin" | "staff";
  initialPricingRules?: PricingRuleRow[];
}

export function TourEditorTabs({ tour, role, initialPricingRules }: TourEditorTabsProps) {
  const router = useRouter();
  const isAdmin = role === "admin";
  const { toast, showToast, hideToast } = useToast();
  const [pending, setPending] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  const [content, setContent] = useState({
    title: tour.title,
    slug: tour.slug,
    short_description: tour.shortDescription,
    description: tour.description,
    duration_text: tour.durationText,
    duration_minutes: tour.durationMinutes,
    group_size_text: tour.groupSizeText,
    default_capacity: tour.defaultCapacity,
    price_from_text: tour.priceFromText ?? "",
    location_region: tour.locationRegion,
    pickup_notes: tour.pickupNotes ?? "",
    cancellation_policy: tour.cancellationPolicy ?? "",
    hero_badge: tour.heroBadge ?? "",
    booking_cutoff_hours: tour.bookingCutoffHours,
    booking_enabled: tour.bookingEnabled,
    is_active: tour.isActive,
    status: tour.status as "draft" | "published" | "archived",
    is_featured: tour.isFeatured,
    display_order: tour.displayOrder,
    seo_title: tour.seoTitle ?? "",
    seo_description: tour.seoDescription ?? "",
    inclusions: (tour.inclusions ?? []).join("\n"),
    exclusions: (tour.exclusions ?? []).join("\n"),
    what_to_bring: (tour.whatToBring ?? []).join("\n"),
  });

  const [rules, setRules] = useState<AvailabilityRuleRow[] | null>(null);
  const [pricing, setPricing] = useState<PricingRuleRow[]>(initialPricingRules ?? []);

  const loadRules = useCallback(async () => {
    const res = await fetch(`/api/admin/tours/${tour.id}/availability-rules`);
    if (!res.ok) return;
    const data = (await res.json()) as { rules: AvailabilityRuleRow[] };
    setRules(data.rules);
  }, [tour.id]);

  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  const loadPricing = useCallback(async () => {
    if (!isAdmin) return;
    const res = await fetch(`/api/admin/pricing?tour_id=${encodeURIComponent(tour.id)}`);
    if (!res.ok) return;
    const data = (await res.json()) as PricingRuleRow[];
    setPricing(data);
  }, [isAdmin, tour.id]);

  useEffect(() => {
    if (initialPricingRules === undefined && isAdmin) void loadPricing();
  }, [initialPricingRules, isAdmin, loadPricing]);

  async function saveContent() {
    if (!isAdmin) return;
    setPending(true);
    try {
      const body = {
        title: content.title,
        slug: content.slug,
        short_description: content.short_description,
        description: content.description,
        duration_text: content.duration_text,
        duration_minutes: content.duration_minutes,
        group_size_text: content.group_size_text,
        default_capacity: content.default_capacity,
        price_from_text: content.price_from_text || null,
        location_region: content.location_region,
        pickup_notes: content.pickup_notes || null,
        cancellation_policy: content.cancellation_policy || null,
        hero_badge: content.hero_badge || null,
        booking_cutoff_hours: content.booking_cutoff_hours,
        booking_enabled: content.booking_enabled,
        is_active: content.is_active,
        status: content.status,
        is_featured: content.is_featured,
        display_order: content.display_order,
        seo_title: content.seo_title || null,
        seo_description: content.seo_description || null,
        inclusions: content.inclusions
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        exclusions: content.exclusions
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        what_to_bring: content.what_to_bring
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await fetch(`/api/admin/tours/${tour.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok) {
        showToast(data.message ?? "Save failed", "error");
        return;
      }
      showToast("Content saved successfully");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function saveAvailability() {
    if (!isAdmin || !rules) return;
    setPending(true);
    try {
      const res = await fetch(`/api/admin/tours/${tour.id}/availability-rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok) {
        showToast(data.message ?? "Save failed", "error");
        return;
      }
      showToast("Availability rules saved");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function updateRule(id: string, patch: Partial<PricingRuleRow>) {
    if (!isAdmin) return;
    setPending(true);
    try {
      const res = await fetch("/api/admin/pricing/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          ...(patch.label !== undefined ? { label: patch.label } : {}),
          ...(patch.adultPrice !== undefined ? { adult_price: patch.adultPrice } : {}),
          ...(patch.childPrice !== undefined ? { child_price: patch.childPrice } : {}),
          ...(patch.infantPrice !== undefined ? { infant_price: patch.infantPrice } : {}),
          ...(patch.infantPricingType !== undefined ? { infant_pricing_type: patch.infantPricingType } : {}),
          ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
          ...(patch.isActive !== undefined ? { is_active: patch.isActive } : {}),
        }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok) {
        showToast(data.message ?? "Failed to update", "error");
        return;
      }
      showToast("Pricing rule updated");
      await loadPricing();
    } finally {
      setPending(false);
    }
  }

  async function deleteRule(id: string) {
    if (!isAdmin) return;
    if (!confirm("Delete this pricing rule?")) return;
    setPending(true);
    try {
      await fetch(`/api/admin/pricing/delete?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      showToast("Pricing rule deleted");
      await loadPricing();
    } finally {
      setPending(false);
    }
  }

  return (
    <Tabs.Root defaultValue="content" className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <Tabs.List className="flex gap-1 overflow-x-auto border-b border-brand-border pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {["content", "pricing", "availability", "media", "settings"].map((tab) => (
          <Tabs.Trigger
            key={tab}
            value={tab}
            className="rounded-sm px-3 py-2 text-sm text-brand-body data-[state=active]:bg-brand-surface data-[state=active]:font-semibold data-[state=active]:text-brand-heading"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="content" className="space-y-4 rounded-sm border border-brand-border bg-white p-6">
        {!isAdmin ? (
          <p className="text-sm text-brand-body">Staff have view-only access to tour content.</p>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-medium text-brand-muted">
            Title
            <input
              className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
              value={content.title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setContent((c) => ({
                  ...c,
                  title: newTitle,
                  slug: slugManuallyEdited ? c.slug : generateSlug(newTitle),
                }));
              }}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted">
            Slug
            <input
              className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
              value={content.slug}
              onChange={(e) => {
                setSlugManuallyEdited(true);
                setContent((c) => ({ ...c, slug: e.target.value }));
              }}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted md:col-span-2">
            Short description
            <textarea
              className="mt-1 min-h-[64px] w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
              value={content.short_description}
              onChange={(e) => setContent((c) => ({ ...c, short_description: e.target.value }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted md:col-span-2">
            Description
            <textarea
              className="mt-1 min-h-[120px] w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
              value={content.description}
              onChange={(e) => setContent((c) => ({ ...c, description: e.target.value }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted">
            Duration text
            <input
              className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
              value={content.duration_text}
              onChange={(e) => setContent((c) => ({ ...c, duration_text: e.target.value }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted">
            Duration (minutes)
            <input
              type="number"
              className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
              value={content.duration_minutes}
              onChange={(e) => setContent((c) => ({ ...c, duration_minutes: Number(e.target.value) }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted">
            Group size text
            <input
              className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
              value={content.group_size_text}
              onChange={(e) => setContent((c) => ({ ...c, group_size_text: e.target.value }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted">
            Default capacity
            <input
              type="number"
              className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
              value={content.default_capacity}
              onChange={(e) => setContent((c) => ({ ...c, default_capacity: Number(e.target.value) }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted">
            Price from text
            <input
              className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
              value={content.price_from_text}
              onChange={(e) => setContent((c) => ({ ...c, price_from_text: e.target.value }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted">
            Region
            <input
              className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
              value={content.location_region}
              onChange={(e) => setContent((c) => ({ ...c, location_region: e.target.value }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted md:col-span-2">
            Inclusions (one per line)
            <textarea
              className="mt-1 min-h-[80px] w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
              value={content.inclusions}
              onChange={(e) => setContent((c) => ({ ...c, inclusions: e.target.value }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted md:col-span-2">
            Exclusions (one per line)
            <textarea
              className="mt-1 min-h-[80px] w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
              value={content.exclusions}
              onChange={(e) => setContent((c) => ({ ...c, exclusions: e.target.value }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted md:col-span-2">
            What to bring (one per line)
            <textarea
              className="mt-1 min-h-[80px] w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
              value={content.what_to_bring}
              onChange={(e) => setContent((c) => ({ ...c, what_to_bring: e.target.value }))}
              disabled={!isAdmin || pending}
            />
          </label>
        </div>
        {isAdmin ? (
          <Button type="button" onClick={() => void saveContent()} disabled={pending}>
            Save content
          </Button>
        ) : null}
      </Tabs.Content>

      <Tabs.Content value="pricing" className="space-y-4 rounded-sm border border-brand-border bg-white p-6">
        {!isAdmin ? (
          <p className="text-sm text-brand-body">Pricing is visible to admins only.</p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-brand-body">Pricing rules for checkout and manual bookings.</p>
              <AddPricingRuleModal
                tourId={tour.id}
                onCreated={loadPricing}
                pending={pending}
                onPendingChange={setPending}
              />
            </div>
            <ul className="space-y-4">
              {pricing.map((r) => (
                <li key={r.id} className="rounded-sm border border-brand-border p-4">
                  <div className="grid gap-2 md:grid-cols-3">
                    <label className="text-xs font-medium text-brand-muted">
                      Label
                      <input
                        className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                        defaultValue={r.label}
                        onBlur={(e) => {
                          if (e.target.value !== r.label) void updateRule(r.id, { label: e.target.value });
                        }}
                      />
                    </label>
                    <label className="text-xs font-medium text-brand-muted">
                      Adult price
                      <input
                        className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                        defaultValue={r.adultPrice}
                        onBlur={(e) => {
                          if (e.target.value !== r.adultPrice) void updateRule(r.id, { adultPrice: e.target.value });
                        }}
                      />
                    </label>
                    <label className="text-xs font-medium text-brand-muted">
                      Child price
                      <input
                        className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                        defaultValue={r.childPrice}
                        onBlur={(e) => {
                          if (e.target.value !== r.childPrice) void updateRule(r.id, { childPrice: e.target.value });
                        }}
                      />
                    </label>
                    <label className="text-xs font-medium text-brand-muted">
                      Infant pricing type
                      <select
                        className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                        defaultValue={r.infantPricingType}
                        onChange={(e) => void updateRule(r.id, { infantPricingType: e.target.value })}
                      >
                        <option value="free">Free</option>
                        <option value="fixed">Fixed</option>
                        <option value="not_allowed">Not allowed</option>
                      </select>
                    </label>
                    <label className="text-xs font-medium text-brand-muted">
                      Priority
                      <input
                        type="number"
                        className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                        defaultValue={r.priority}
                        onBlur={(e) => void updateRule(r.id, { priority: Number(e.target.value) })}
                      />
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-brand-muted">
                      <input
                        type="checkbox"
                        defaultChecked={r.isActive}
                        onChange={(e) => void updateRule(r.id, { isActive: e.target.checked })}
                      />
                      Active
                    </label>
                  </div>
                  <Button type="button" variant="danger" size="sm" className="mt-2" onClick={() => void deleteRule(r.id)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Tabs.Content>

      <Tabs.Content value="availability" className="space-y-4 rounded-sm border border-brand-border bg-white p-6">
        {!rules ? (
          <p className="text-sm text-brand-muted">Loading rules…</p>
        ) : (
          <>
            <p className="text-sm text-brand-body">
              Rows follow engine weekdays (0 = Sunday through 6 = Saturday). Set capacity or leave empty to use tour
              default.
            </p>
            <div className="space-y-3">
              {rules.map((r, idx) => (
                <div key={r.weekday} className="flex flex-wrap items-center gap-3 rounded-sm border border-brand-border p-3">
                  <span className="w-12 text-sm font-medium">{WEEKDAYS[r.weekday] ?? r.weekday}</span>
                  <label className="text-xs text-brand-muted">
                    Capacity
                    <input
                      type="number"
                      min={1}
                      className="mt-1 w-24 rounded border border-brand-border px-2 py-1 text-sm"
                      value={r.default_capacity ?? ""}
                      placeholder="default"
                      onChange={(e) => {
                        const v = e.target.value;
                        const next = [...rules];
                        next[idx] = {
                          ...r,
                          default_capacity: v ? Number(v) : null,
                        };
                        setRules(next);
                      }}
                      disabled={!isAdmin || pending}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-brand-muted">
                    <input
                      type="checkbox"
                      checked={r.is_active}
                      onChange={(e) => {
                        const next = [...rules];
                        next[idx] = { ...r, is_active: e.target.checked };
                        setRules(next);
                      }}
                      disabled={!isAdmin || pending}
                    />
                    Active
                  </label>
                </div>
              ))}
            </div>
            {isAdmin ? (
              <Button type="button" onClick={() => void saveAvailability()} disabled={pending}>
                Save weekday rules
              </Button>
            ) : (
              <p className="text-xs text-brand-muted">Staff view only.</p>
            )}
          </>
        )}
      </Tabs.Content>

      <Tabs.Content value="media" className="rounded-sm border border-brand-border bg-white p-6">
        <TourMediaSection tourId={tour.id} isAdmin={isAdmin} />
      </Tabs.Content>

      <Tabs.Content value="settings" className="space-y-6 rounded-sm border border-brand-border bg-white p-6">
        {!isAdmin ? (
          <p className="text-sm text-brand-body">Settings are admin-only.</p>
        ) : (
          <>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-brand-heading">Toggles</h3>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm text-brand-body">
                  <input
                    type="checkbox"
                    checked={content.booking_enabled}
                    onChange={(e) => setContent((c) => ({ ...c, booking_enabled: e.target.checked }))}
                    disabled={pending}
                  />
                  Booking enabled
                </label>
                <label className="flex items-center gap-2 text-sm text-brand-body">
                  <input
                    type="checkbox"
                    checked={content.is_active}
                    onChange={(e) => setContent((c) => ({ ...c, is_active: e.target.checked }))}
                    disabled={pending}
                  />
                  Tour active
                </label>
                <label className="flex items-center gap-2 text-sm text-brand-body">
                  <input
                    type="checkbox"
                    checked={content.is_featured}
                    onChange={(e) => setContent((c) => ({ ...c, is_featured: e.target.checked }))}
                    disabled={pending}
                  />
                  Featured
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-brand-heading">Publishing</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-xs font-medium text-brand-muted">
                  Status
                  <select
                    className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                    value={content.status}
                    onChange={(e) =>
                      setContent((c) => ({ ...c, status: e.target.value as "draft" | "published" | "archived" }))
                    }
                    disabled={pending}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <label className="text-xs font-medium text-brand-muted">
                  Display order
                  <input
                    type="number"
                    className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                    value={content.display_order}
                    onChange={(e) => setContent((c) => ({ ...c, display_order: Number(e.target.value) }))}
                    disabled={pending}
                  />
                </label>
                <label className="text-xs font-medium text-brand-muted">
                  Booking cutoff (hours)
                  <input
                    type="number"
                    className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                    value={content.booking_cutoff_hours}
                    onChange={(e) => setContent((c) => ({ ...c, booking_cutoff_hours: Number(e.target.value) }))}
                    disabled={pending}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-brand-heading">SEO</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-xs font-medium text-brand-muted">
                  SEO title
                  <input
                    className="mt-1 w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                    value={content.seo_title}
                    onChange={(e) => setContent((c) => ({ ...c, seo_title: e.target.value }))}
                    disabled={pending}
                  />
                </label>
                <label className="text-xs font-medium text-brand-muted">
                  SEO description
                  <textarea
                    className="mt-1 min-h-[80px] w-full rounded-sm border border-brand-border px-3 py-2 text-sm"
                    value={content.seo_description}
                    onChange={(e) => setContent((c) => ({ ...c, seo_description: e.target.value }))}
                    disabled={pending}
                  />
                </label>
              </div>
            </div>

            <Button type="button" onClick={() => void saveContent()} disabled={pending}>
              Save settings
            </Button>
          </>
        )}
      </Tabs.Content>
    </Tabs.Root>
  );
}
