"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AdminCombobox } from "@/components/admin/admin-combobox";
import { AdminStringListField } from "@/components/admin/admin-string-list-field";
import { AddPricingRuleModal } from "@/components/admin/add-pricing-rule-modal";
import { TourDeparturesEditor } from "@/components/admin/tour-departures-editor";
import { adminFieldBaseClass, adminFieldClass, adminTextareaClass } from "@/components/admin/form-field-styles";
import { Toast, useToast } from "@/components/admin/toast";
import { TourMediaSection } from "@/components/admin/tour-media-section";
import { Button } from "@/components/ui/button";
import { normalizeMaxGuestsScope, type MaxGuestsScope } from "@/lib/types/pricing-constraints";
import { PRICING_GUESTS_ORDER_TOAST, pricingGuestsOrderDetail } from "@/lib/ui/pricing-guest-limit-copy";
import { cn } from "@/lib/utils/cn";

const MAX_GUESTS_SCOPE_OPTIONS: { value: MaxGuestsScope; label: string }[] = [
  { value: "entire_party", label: "Whole party (adults + children + infants)" },
  { value: "adults_and_children_only", label: "Adults & children only (infants extra)" },
  { value: "adults_only", label: "Adults only (children & infants extra)" },
];

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
  pricingMode: "per_person" | "package";
  includedAdults: number;
  packageBasePrice: string;
  extraAdultPrice: string;
  extraChildPrice: string;
  infantPrice: string;
  infantPricingType: string;
  minGuests: number;
  maxGuests: number;
  maxGuestsScope: MaxGuestsScope;
  maxInfants: number | null;
  currencyCode: string;
  validFrom: string | null;
  validUntil: string | null;
  priority: number;
  isActive: boolean;
}

/** `max_infants` is meaningless when infants are not allowed; align UI + dirty checks with that invariant. */
function normalizePricingRules(rules: PricingRuleRow[]): PricingRuleRow[] {
  return rules.map((rule) => {
    const base = rule.infantPricingType === "not_allowed" ? { ...rule, maxInfants: null } : rule;
    return {
      ...base,
      maxGuestsScope: normalizeMaxGuestsScope(
        (base as { maxGuestsScope?: string | null }).maxGuestsScope
      ),
    };
  });
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

interface TourEditorContentState {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  duration_text: string;
  duration_minutes: number;
  group_size_text: string;
  default_capacity: number;
  price_from_text: string;
  location_region: string;
  pickup_notes: string;
  cancellation_policy: string;
  hero_badge: string;
  booking_cutoff_hours: number;
  booking_enabled: boolean;
  is_active: boolean;
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  display_order: number;
  seo_title: string;
  seo_description: string;
  inclusions: string[];
  exclusions: string[];
  what_to_bring: string[];
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

  const [content, setContent] = useState<TourEditorContentState>(() => buildTourEditorContentState(tour));
  const [savedContent, setSavedContent] = useState<TourEditorContentState>(() => buildTourEditorContentState(tour));

  const [rules, setRules] = useState<AvailabilityRuleRow[] | null>(null);
  const [savedRules, setSavedRules] = useState<AvailabilityRuleRow[] | null>(null);
  const [pricing, setPricing] = useState<PricingRuleRow[]>(() =>
    normalizePricingRules(initialPricingRules ?? [])
  );
  const [pricingDrafts, setPricingDrafts] = useState<Record<string, PricingRuleRow>>({});

  const loadRules = useCallback(async () => {
    const res = await fetch(`/api/admin/tours/${tour.id}/availability-rules`);
    if (!res.ok) return;
    const data = (await res.json()) as { rules: AvailabilityRuleRow[] };
    setRules(data.rules);
    setSavedRules(data.rules);
  }, [tour.id]);

  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  const loadPricing = useCallback(async () => {
    if (!isAdmin) return;
    const res = await fetch(`/api/admin/pricing?tour_id=${encodeURIComponent(tour.id)}`);
    if (!res.ok) return;
    const data = (await res.json()) as PricingRuleRow[];
    setPricing(normalizePricingRules(data));
  }, [isAdmin, tour.id]);

  useEffect(() => {
    if (initialPricingRules === undefined && isAdmin) void loadPricing();
  }, [initialPricingRules, isAdmin, loadPricing]);

  useEffect(() => {
    setPricingDrafts(() => {
      const next: Record<string, PricingRuleRow> = {};
      pricing.forEach((rule) => {
        next[rule.id] = { ...rule };
      });
      return next;
    });
  }, [pricing]);

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
        inclusions: content.inclusions,
        exclusions: content.exclusions,
        what_to_bring: content.what_to_bring,
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
      setSavedContent(content);
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
      setSavedRules(rules);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function savePricingRule(id: string) {
    if (!isAdmin) return;
    const original = pricing.find((rule) => rule.id === id);
    const draft = pricingDrafts[id];
    if (!original || !draft) return;
    if (draft.maxGuests < draft.minGuests) {
      showToast(PRICING_GUESTS_ORDER_TOAST, "error");
      return;
    }
    if (
      draft.infantPricingType === "fixed" &&
      !/^\d+(\.\d{1,2})?$/.test(String(draft.infantPrice ?? "").trim())
    ) {
      showToast("Enter a valid infant price for Fixed infant pricing.", "error");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/admin/pricing/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          label: draft.label,
          adult_price: draft.adultPrice,
          child_price: draft.childPrice,
          pricing_mode: draft.pricingMode,
          included_adults: draft.includedAdults,
          package_base_price: draft.packageBasePrice,
          extra_adult_price: draft.extraAdultPrice,
          extra_child_price: draft.extraChildPrice,
          infant_price: draft.infantPrice,
          infant_pricing_type: draft.infantPricingType,
          min_guests: draft.minGuests,
          max_guests: draft.maxGuests,
          max_guests_scope: draft.maxGuestsScope,
          max_infants: draft.infantPricingType === "not_allowed" ? null : draft.maxInfants,
          priority: draft.priority,
          is_active: draft.isActive,
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

  function isPricingRuleDirty(id: string): boolean {
    const original = pricing.find((rule) => rule.id === id);
    const draft = pricingDrafts[id];
    if (!original || !draft) return false;
    return (
      draft.label !== original.label ||
      draft.adultPrice !== original.adultPrice ||
      draft.childPrice !== original.childPrice ||
      draft.pricingMode !== original.pricingMode ||
      draft.includedAdults !== original.includedAdults ||
      draft.packageBasePrice !== original.packageBasePrice ||
      draft.extraAdultPrice !== original.extraAdultPrice ||
      draft.extraChildPrice !== original.extraChildPrice ||
      draft.infantPrice !== original.infantPrice ||
      draft.infantPricingType !== original.infantPricingType ||
      draft.minGuests !== original.minGuests ||
      draft.maxGuests !== original.maxGuests ||
      draft.maxGuestsScope !== original.maxGuestsScope ||
      draft.maxInfants !== original.maxInfants ||
      draft.priority !== original.priority ||
      draft.isActive !== original.isActive
    );
  }

  async function deleteRule(id: string) {
    if (!isAdmin) return;
    if (!confirm("Delete this pricing rule?")) return;
    setPending(true);
    try {
      const res = await fetch(`/api/admin/pricing/delete?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok) {
        showToast(data.message ?? "Failed to delete pricing rule", "error");
        return;
      }
      showToast("Pricing rule deleted");
      await loadPricing();
    } finally {
      setPending(false);
    }
  }

  const isContentDirty = JSON.stringify(content) !== JSON.stringify(savedContent);
  const isAvailabilityDirty = JSON.stringify(serializeRules(rules)) !== JSON.stringify(serializeRules(savedRules));

  return (
    <Tabs.Root defaultValue="content" className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <Tabs.List className="flex gap-1 overflow-x-auto border-b border-brand-border pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {["content", "pickups", "pricing", "availability", "media", "settings"].map((tab) => (
          <Tabs.Trigger
            key={tab}
            value={tab}
            className="rounded-sm px-3 py-2 text-sm text-brand-body data-[state=active]:bg-brand-surface data-[state=active]:font-semibold data-[state=active]:text-brand-heading"
          >
            {tab === "pickups" ? "Pickups" : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
              className={`mt-1 ${adminFieldClass}`}
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
              className={`mt-1 ${adminFieldClass}`}
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
              className={`mt-1 ${adminTextareaClass}`}
              value={content.short_description}
              onChange={(e) => setContent((c) => ({ ...c, short_description: e.target.value }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted md:col-span-2">
            Description
            <textarea
              className={`mt-1 ${adminTextareaClass} min-h-[120px]`}
              value={content.description}
              onChange={(e) => setContent((c) => ({ ...c, description: e.target.value }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted">
            Duration text
            <input
              className={`mt-1 ${adminFieldClass}`}
              value={content.duration_text}
              onChange={(e) => setContent((c) => ({ ...c, duration_text: e.target.value }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted">
            Duration (minutes)
            <input
              type="number"
              className={`mt-1 ${adminFieldClass}`}
              value={content.duration_minutes}
              onChange={(e) => setContent((c) => ({ ...c, duration_minutes: Number(e.target.value) }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted">
            Group size text
            <input
              className={`mt-1 ${adminFieldClass}`}
              value={content.group_size_text}
              onChange={(e) => setContent((c) => ({ ...c, group_size_text: e.target.value }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted">
            Default capacity
            <input
              type="number"
              className={`mt-1 ${adminFieldClass}`}
              value={content.default_capacity}
              onChange={(e) => setContent((c) => ({ ...c, default_capacity: Number(e.target.value) }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted">
            Price from text
            <input
              className={`mt-1 ${adminFieldClass}`}
              value={content.price_from_text}
              onChange={(e) => setContent((c) => ({ ...c, price_from_text: e.target.value }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <label className="text-xs font-medium text-brand-muted">
            Region
            <input
              className={`mt-1 ${adminFieldClass}`}
              value={content.location_region}
              onChange={(e) => setContent((c) => ({ ...c, location_region: e.target.value }))}
              disabled={!isAdmin || pending}
            />
          </label>
          <AdminStringListField
            label="Inclusions"
            items={content.inclusions}
            onItemsChange={(inclusions) => setContent((c) => ({ ...c, inclusions }))}
            disabled={!isAdmin || pending}
          />
          <AdminStringListField
            label="Exclusions"
            items={content.exclusions}
            onItemsChange={(exclusions) => setContent((c) => ({ ...c, exclusions }))}
            disabled={!isAdmin || pending}
          />
          <AdminStringListField
            label="What to bring"
            items={content.what_to_bring}
            onItemsChange={(what_to_bring) => setContent((c) => ({ ...c, what_to_bring }))}
            disabled={!isAdmin || pending}
          />
        </div>
        {isAdmin ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => void saveContent()}
            disabled={pending || !isContentDirty}
          >
            Save content
          </Button>
        ) : null}
      </Tabs.Content>

      <Tabs.Content value="pickups" className="space-y-4 rounded-sm border border-brand-border bg-white p-6">
        {!isAdmin ? (
          <p className="text-sm text-brand-body">Pickups are visible to admins only.</p>
        ) : (
          <TourDeparturesEditor
            tourId={tour.id}
            pending={pending}
            onPendingChange={setPending}
            showToast={showToast}
          />
        )}
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
              {pricing.map((r) => {
                const d = pricingDrafts[r.id] ?? r;
                const guestRangeInvalid = d.maxGuests < d.minGuests;
                const infantFixedPriceInvalid =
                  d.infantPricingType === "fixed" &&
                  !/^\d+(\.\d{1,2})?$/.test(String(d.infantPrice ?? "").trim());
                return (
                <li key={r.id} className="rounded-sm border border-brand-border p-4">
                  {isPricingRuleDirty(r.id) ? (
                    <p className="mb-2 text-xs font-medium text-amber-700">Unsaved changes</p>
                  ) : null}
                  <div className="grid gap-2 md:grid-cols-3">
                    <label className="text-xs font-medium text-brand-muted">
                      Label
                      <input
                        className={`mt-1 ${adminFieldClass}`}
                        value={d.label}
                        onChange={(e) =>
                          setPricingDrafts((prev) => ({
                            ...prev,
                            [r.id]: { ...(prev[r.id] ?? r), label: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs font-medium text-brand-muted">
                      Pricing model
                      <AdminCombobox
                        className={`mt-1 ${adminFieldClass}`}
                        value={d.pricingMode}
                        onValueChange={(nextPricingMode) =>
                          setPricingDrafts((prev) => ({
                            ...prev,
                            [r.id]: {
                              ...(prev[r.id] ?? r),
                              pricingMode: nextPricingMode as "per_person" | "package",
                            },
                          }))
                        }
                        options={[
                          { value: "per_person", label: "Per person" },
                          { value: "package", label: "Package" },
                        ]}
                      />
                    </label>
                    <label className="text-xs font-medium text-brand-muted">
                      Min guests
                      <input
                        type="number"
                        min={1}
                        aria-invalid={guestRangeInvalid}
                        className={cn(
                          `mt-1 ${adminFieldClass}`,
                          guestRangeInvalid &&
                            "border-red-500 ring-2 ring-red-500/25 focus:border-red-500 focus:ring-red-500/30"
                        )}
                        value={String(d.minGuests)}
                        onChange={(e) =>
                          setPricingDrafts((prev) => ({
                            ...prev,
                            [r.id]: { ...(prev[r.id] ?? r), minGuests: Number(e.target.value) || 1 },
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs font-medium text-brand-muted">
                      Max guests
                      <input
                        type="number"
                        min={1}
                        aria-invalid={guestRangeInvalid}
                        className={cn(
                          `mt-1 ${adminFieldClass}`,
                          guestRangeInvalid &&
                            "border-red-500 ring-2 ring-red-500/25 focus:border-red-500 focus:ring-red-500/30"
                        )}
                        value={String(d.maxGuests)}
                        onChange={(e) =>
                          setPricingDrafts((prev) => ({
                            ...prev,
                            [r.id]: { ...(prev[r.id] ?? r), maxGuests: Number(e.target.value) || 1 },
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs font-medium text-brand-muted md:col-span-2">
                      Who counts toward max guests
                      <AdminCombobox
                        className={`mt-1 ${adminFieldClass}`}
                        value={d.maxGuestsScope}
                        onValueChange={(nextScope) =>
                          setPricingDrafts((prev) => ({
                            ...prev,
                            [r.id]: {
                              ...(prev[r.id] ?? r),
                              maxGuestsScope: nextScope as MaxGuestsScope,
                            },
                          }))
                        }
                        options={MAX_GUESTS_SCOPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                      />
                    </label>
                    {guestRangeInvalid ? (
                      <p className="text-xs font-medium leading-snug text-red-600 md:col-span-3">
                        {pricingGuestsOrderDetail(d.minGuests, d.maxGuests)}
                      </p>
                    ) : null}
                    <label className="text-xs font-medium text-brand-muted">
                      Adult price
                      <input
                        className={`mt-1 ${adminFieldClass}`}
                        value={pricingDrafts[r.id]?.adultPrice ?? r.adultPrice}
                        onChange={(e) =>
                          setPricingDrafts((prev) => ({
                            ...prev,
                            [r.id]: { ...(prev[r.id] ?? r), adultPrice: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs font-medium text-brand-muted">
                      Child price
                      <input
                        className={`mt-1 ${adminFieldClass}`}
                        value={pricingDrafts[r.id]?.childPrice ?? r.childPrice}
                        onChange={(e) =>
                          setPricingDrafts((prev) => ({
                            ...prev,
                            [r.id]: { ...(prev[r.id] ?? r), childPrice: e.target.value },
                          }))
                        }
                      />
                    </label>
                    {d.pricingMode === "package" ? (
                      <>
                        <label className="text-xs font-medium text-brand-muted">
                          Included adults
                          <input
                            type="number"
                            min={1}
                            className={`mt-1 ${adminFieldClass}`}
                            value={String(pricingDrafts[r.id]?.includedAdults ?? r.includedAdults)}
                            onChange={(e) =>
                              setPricingDrafts((prev) => ({
                                ...prev,
                                [r.id]: { ...(prev[r.id] ?? r), includedAdults: Number(e.target.value) || 1 },
                              }))
                            }
                          />
                        </label>
                        <label className="text-xs font-medium text-brand-muted">
                          Package base
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            className={`mt-1 ${adminFieldClass}`}
                            value={pricingDrafts[r.id]?.packageBasePrice ?? r.packageBasePrice}
                            onChange={(e) =>
                              setPricingDrafts((prev) => ({
                                ...prev,
                                [r.id]: { ...(prev[r.id] ?? r), packageBasePrice: e.target.value },
                              }))
                            }
                          />
                        </label>
                        <label className="text-xs font-medium text-brand-muted">
                          Extra adult
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            className={`mt-1 ${adminFieldClass}`}
                            value={pricingDrafts[r.id]?.extraAdultPrice ?? r.extraAdultPrice}
                            onChange={(e) =>
                              setPricingDrafts((prev) => ({
                                ...prev,
                                [r.id]: { ...(prev[r.id] ?? r), extraAdultPrice: e.target.value },
                              }))
                            }
                          />
                        </label>
                        <label className="text-xs font-medium text-brand-muted">
                          Extra child
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            className={`mt-1 ${adminFieldClass}`}
                            value={pricingDrafts[r.id]?.extraChildPrice ?? r.extraChildPrice}
                            onChange={(e) =>
                              setPricingDrafts((prev) => ({
                                ...prev,
                                [r.id]: { ...(prev[r.id] ?? r), extraChildPrice: e.target.value },
                              }))
                            }
                          />
                        </label>
                      </>
                    ) : null}
                    <label className="text-xs font-medium text-brand-muted">
                      Infant pricing type
                      <AdminCombobox
                        className={`mt-1 ${adminFieldClass}`}
                        value={pricingDrafts[r.id]?.infantPricingType ?? r.infantPricingType}
                        onValueChange={(nextInfantPricingType) =>
                          setPricingDrafts((prev) => {
                            const row = prev[r.id] ?? r;
                            const next: PricingRuleRow = {
                              ...row,
                              infantPricingType: nextInfantPricingType,
                            };
                            if (nextInfantPricingType === "not_allowed") {
                              next.maxInfants = null;
                            }
                            if (nextInfantPricingType === "free") {
                              next.infantPrice = "0";
                            }
                            return { ...prev, [r.id]: next };
                          })
                        }
                        options={[
                          { value: "free", label: "Free" },
                          { value: "fixed", label: "Fixed" },
                          { value: "not_allowed", label: "Not allowed" },
                        ]}
                      />
                    </label>
                    <label className="text-xs font-medium text-brand-muted">
                      Infant price
                      {d.infantPricingType === "fixed" ? (
                        <>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            aria-invalid={infantFixedPriceInvalid}
                            className={cn(
                              `mt-1 ${adminFieldClass}`,
                              infantFixedPriceInvalid &&
                                "border-red-500 ring-2 ring-red-500/25 focus:border-red-500 focus:ring-red-500/30"
                            )}
                            value={d.infantPrice}
                            onChange={(e) =>
                              setPricingDrafts((prev) => ({
                                ...prev,
                                [r.id]: { ...(prev[r.id] ?? r), infantPrice: e.target.value },
                              }))
                            }
                          />
                          {infantFixedPriceInvalid ? (
                            <p className="mt-1 text-xs font-medium text-red-600">
                              Enter a positive amount (e.g. 25 or 25.00).
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <input
                          type="text"
                          disabled
                          readOnly
                          title={
                            d.infantPricingType === "free"
                              ? "Infants are free — no per-infant charge at checkout."
                              : "Infants are not sold on this rule."
                          }
                          className={cn(
                            `mt-1 ${adminFieldClass}`,
                            "cursor-not-allowed bg-brand-surface-soft text-brand-muted opacity-80"
                          )}
                          value={d.infantPricingType === "free" ? "0 (free)" : "—"}
                        />
                      )}
                    </label>
                    <label className="text-xs font-medium text-brand-muted">
                      Priority
                      <input
                        type="number"
                        className={`mt-1 ${adminFieldClass}`}
                        value={String(pricingDrafts[r.id]?.priority ?? r.priority)}
                        onChange={(e) =>
                          setPricingDrafts((prev) => ({
                            ...prev,
                            [r.id]: { ...(prev[r.id] ?? r), priority: Number(e.target.value) || 0 },
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs font-medium text-brand-muted">
                      Max infants (optional)
                      <input
                        type="number"
                        min={0}
                        disabled={
                          (pricingDrafts[r.id]?.infantPricingType ?? r.infantPricingType) === "not_allowed"
                        }
                        aria-disabled={
                          (pricingDrafts[r.id]?.infantPricingType ?? r.infantPricingType) === "not_allowed"
                        }
                        title={
                          (pricingDrafts[r.id]?.infantPricingType ?? r.infantPricingType) === "not_allowed"
                            ? "Not used when infant pricing is Not allowed"
                            : undefined
                        }
                        className={cn(
                          `mt-1 ${adminFieldClass}`,
                          (pricingDrafts[r.id]?.infantPricingType ?? r.infantPricingType) === "not_allowed" &&
                            "cursor-not-allowed bg-brand-surface-soft text-brand-muted opacity-80"
                        )}
                        value={
                          (pricingDrafts[r.id]?.infantPricingType ?? r.infantPricingType) === "not_allowed"
                            ? ""
                            : pricingDrafts[r.id]?.maxInfants === null
                              ? ""
                              : String(pricingDrafts[r.id]?.maxInfants ?? r.maxInfants ?? "")
                        }
                        onChange={(e) => {
                          if ((pricingDrafts[r.id]?.infantPricingType ?? r.infantPricingType) === "not_allowed")
                            return;
                          setPricingDrafts((prev) => ({
                            ...prev,
                            [r.id]: {
                              ...(prev[r.id] ?? r),
                              maxInfants: e.target.value === "" ? null : Number(e.target.value),
                            },
                          }));
                        }}
                      />
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-brand-muted">
                      <input
                        type="checkbox"
                        checked={pricingDrafts[r.id]?.isActive ?? r.isActive}
                        onChange={(e) =>
                          setPricingDrafts((prev) => ({
                            ...prev,
                            [r.id]: { ...(prev[r.id] ?? r), isActive: e.target.checked },
                          }))
                        }
                      />
                      Active
                    </label>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => void savePricingRule(r.id)}
                      disabled={
                        pending || !isPricingRuleDirty(r.id) || guestRangeInvalid || infantFixedPriceInvalid
                      }
                    >
                      Save changes
                    </Button>
                    <Button type="button" variant="danger" size="sm" onClick={() => void deleteRule(r.id)}>
                      Delete
                    </Button>
                  </div>
                </li>
                );
              })}
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
                      className={`mt-1 w-24 ${adminFieldBaseClass}`}
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
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => void saveAvailability()}
                disabled={pending || !isAvailabilityDirty}
              >
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
                  <AdminCombobox
                    className={`mt-1 ${adminFieldClass}`}
                    value={content.status}
                    onValueChange={(nextStatus) =>
                      setContent((c) => ({ ...c, status: nextStatus as "draft" | "published" | "archived" }))
                    }
                    disabled={pending}
                    options={[
                      { value: "draft", label: "Draft" },
                      { value: "published", label: "Published" },
                      { value: "archived", label: "Archived" },
                    ]}
                  />
                </label>
                <label className="text-xs font-medium text-brand-muted">
                  Display order
                  <input
                    type="number"
                    className={`mt-1 ${adminFieldClass}`}
                    value={content.display_order}
                    onChange={(e) => setContent((c) => ({ ...c, display_order: Number(e.target.value) }))}
                    disabled={pending}
                  />
                </label>
                <label className="text-xs font-medium text-brand-muted">
                  Booking cutoff (hours)
                  <input
                    type="number"
                    className={`mt-1 ${adminFieldClass}`}
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
                    className={`mt-1 ${adminFieldClass}`}
                    value={content.seo_title}
                    onChange={(e) => setContent((c) => ({ ...c, seo_title: e.target.value }))}
                    disabled={pending}
                  />
                </label>
                <label className="text-xs font-medium text-brand-muted">
                  SEO description
                  <textarea
                    className={`mt-1 ${adminTextareaClass} min-h-[80px]`}
                    value={content.seo_description}
                    onChange={(e) => setContent((c) => ({ ...c, seo_description: e.target.value }))}
                    disabled={pending}
                  />
                </label>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => void saveContent()}
              disabled={pending || !isContentDirty}
            >
              Save settings
            </Button>
          </>
        )}
      </Tabs.Content>
    </Tabs.Root>
  );
}

function buildTourEditorContentState(tour: SerializedTour): TourEditorContentState {
  return {
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
    inclusions: [...(tour.inclusions ?? [])],
    exclusions: [...(tour.exclusions ?? [])],
    what_to_bring: [...(tour.whatToBring ?? [])],
  };
}

function serializeRules(rules: AvailabilityRuleRow[] | null): Array<{
  weekday: number;
  default_capacity: number | null;
  is_active: boolean;
}> {
  if (!rules) return [];
  return rules.map((rule) => ({
    weekday: rule.weekday,
    default_capacity: rule.default_capacity,
    is_active: rule.is_active,
  }));
}
