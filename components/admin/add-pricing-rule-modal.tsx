"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

import { AdminCombobox } from "@/components/admin/admin-combobox";
import { adminFieldClass } from "@/components/admin/form-field-styles";
import { Button } from "@/components/ui/button";
import type { MaxGuestsScope } from "@/lib/types/pricing-constraints";
import { pricingGuestsOrderDetail } from "@/lib/ui/pricing-guest-limit-copy";
import { cn } from "@/lib/utils/cn";

interface AddPricingRuleModalProps {
  tourId: string;
  onCreated: () => void;
  pending: boolean;
  onPendingChange: (pending: boolean) => void;
}

export function AddPricingRuleModal({ tourId, onCreated, pending, onPendingChange }: AddPricingRuleModalProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [pricingMode, setPricingMode] = useState<"per_person" | "package">("per_person");
  const [adultPrice, setAdultPrice] = useState("100");
  const [childPrice, setChildPrice] = useState("50");
  const [childPricingType, setChildPricingType] = useState<"fixed" | "not_allowed">("fixed");
  const [extraAdultPricingType, setExtraAdultPricingType] = useState<"fixed" | "not_allowed">(
    "fixed"
  );
  const [includedAdults, setIncludedAdults] = useState("2");
  const [packageBasePrice, setPackageBasePrice] = useState("200");
  const [extraAdultPrice, setExtraAdultPrice] = useState("100");
  const [extraChildPrice, setExtraChildPrice] = useState("50");
  const [infantPrice, setInfantPrice] = useState("0");
  const [infantType, setInfantType] = useState("free");
  const [minGuests, setMinGuests] = useState("1");
  const [maxGuests, setMaxGuests] = useState("12");
  const [maxGuestsScope, setMaxGuestsScope] = useState<MaxGuestsScope>("entire_party");
  const [maxInfants, setMaxInfants] = useState("");
  const [error, setError] = useState<string | null>(null);

  const minGNum = Number(minGuests) || 1;
  const maxGNum = Number(maxGuests) || 12;
  const guestRangeInvalid = maxGNum < minGNum;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      setError("Label is required");
      return;
    }

    onPendingChange(true);
    setError(null);

    if (guestRangeInvalid) {
      onPendingChange(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/pricing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tour_id: tourId,
          label: label.trim(),
          adult_price: adultPrice,
          child_price: childPrice,
          child_pricing_type: childPricingType,
          pricing_mode: pricingMode,
          extra_adult_pricing_type: extraAdultPricingType,
          included_adults: Number(includedAdults),
          package_base_price: packageBasePrice,
          extra_adult_price: extraAdultPrice,
          extra_child_price: extraChildPrice,
          infant_price: infantPrice,
          infant_pricing_type: infantType,
          min_guests: Number(minGuests),
          max_guests: Number(maxGuests),
          max_guests_scope: maxGuestsScope,
          max_infants: infantType === "not_allowed" ? null : maxInfants ? Number(maxInfants) : null,
        }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };

      if (!res.ok || !data.success) {
        setError(data.message ?? "Failed to create rule");
        return;
      }

      setOpen(false);
      setLabel("");
      setPricingMode("per_person");
      setAdultPrice("100");
      setChildPrice("50");
      setChildPricingType("fixed");
      setExtraAdultPricingType("fixed");
      setIncludedAdults("2");
      setPackageBasePrice("200");
      setExtraAdultPrice("100");
      setExtraChildPrice("50");
      setInfantPrice("0");
      setInfantType("free");
      setMinGuests("1");
      setMaxGuests("12");
      setMaxGuestsScope("entire_party");
      setMaxInfants("");
      onCreated();
    } finally {
      onPendingChange(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button type="button" variant="secondary" size="sm" disabled={pending}>
          Add rule
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-sm border border-brand-border bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-brand-heading">Add pricing rule</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-brand-muted">
            Create a new pricing rule for this tour. The rule will be active by default.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <label className="block text-xs font-medium text-brand-muted">
              Rule label *
              <input
                type="text"
                required
                className={`mt-1 ${adminFieldClass}`}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Adult, Child, Weekend"
              />
            </label>

            <label className="block text-xs font-medium text-brand-muted">
              Pricing model
              <AdminCombobox
                className={`mt-1 ${adminFieldClass}`}
                value={pricingMode}
                onValueChange={(value) => setPricingMode(value as "per_person" | "package")}
                options={[
                  { value: "per_person", label: "Per person" },
                  { value: "package", label: "Package" },
                ]}
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-xs font-medium text-brand-muted">
                Min guests
                <input
                  type="number"
                  min="1"
                  aria-invalid={guestRangeInvalid}
                  className={cn(
                    `mt-1 ${adminFieldClass}`,
                    guestRangeInvalid &&
                      "border-red-500 ring-2 ring-red-500/25 focus:border-red-500 focus:ring-red-500/30"
                  )}
                  value={minGuests}
                  onChange={(e) => setMinGuests(e.target.value)}
                />
              </label>
              <label className="block text-xs font-medium text-brand-muted">
                Max guests
                <input
                  type="number"
                  min="1"
                  aria-invalid={guestRangeInvalid}
                  className={cn(
                    `mt-1 ${adminFieldClass}`,
                    guestRangeInvalid &&
                      "border-red-500 ring-2 ring-red-500/25 focus:border-red-500 focus:ring-red-500/30"
                  )}
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(e.target.value)}
                />
              </label>
              {guestRangeInvalid ? (
                <p className="col-span-2 text-xs font-medium leading-snug text-red-600">
                  {pricingGuestsOrderDetail(minGNum, maxGNum)}
                </p>
              ) : null}
            </div>

            <label className="block text-xs font-medium text-brand-muted">
              Who counts toward max guests
              <AdminCombobox
                className={`mt-1 ${adminFieldClass}`}
                value={maxGuestsScope}
                onValueChange={(value) => setMaxGuestsScope(value as MaxGuestsScope)}
                options={[
                  { value: "entire_party", label: "Whole party (adults + children + infants)" },
                  { value: "adults_and_children_only", label: "Adults & children only (infants extra)" },
                  { value: "adults_only", label: "Adults only (children & infants extra)" },
                ]}
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              {pricingMode !== "package" ? (
                <label className="block text-xs font-medium text-brand-muted">
                  Adult price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={`mt-1 ${adminFieldClass}`}
                    value={adultPrice}
                    onChange={(e) => setAdultPrice(e.target.value)}
                  />
                </label>
              ) : null}
              <label className="block text-xs font-medium text-brand-muted">
                Children pricing type
                <AdminCombobox
                  className={`mt-1 ${adminFieldClass}`}
                  value={childPricingType}
                  onValueChange={(next) => {
                    const value = next as "fixed" | "not_allowed";
                    setChildPricingType(value);
                    if (value === "not_allowed") setChildPrice("0");
                  }}
                  options={[
                    { value: "fixed", label: "Fixed amount" },
                    { value: "not_allowed", label: "Not allowed" },
                  ]}
                />
              </label>
            </div>

            <label className="block text-xs font-medium text-brand-muted">
                  {pricingMode === "package" ? "Child price (per-person mode only)" : "Child price"}
              {childPricingType === "not_allowed" ? (
                <input
                  type="text"
                  readOnly
                  disabled
                  className={cn(
                    `mt-1 ${adminFieldClass}`,
                    "cursor-not-allowed bg-brand-surface-soft text-brand-muted opacity-80"
                  )}
                  value="—"
                />
              ) : (
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`mt-1 ${adminFieldClass}`}
                  value={childPrice}
                  onChange={(e) => setChildPrice(e.target.value)}
                />
              )}
            </label>

            {pricingMode === "package" ? (
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-xs font-medium text-brand-muted">
                  Included guests
                  <input
                    type="number"
                    min="1"
                    className={`mt-1 ${adminFieldClass}`}
                    value={includedAdults}
                    onChange={(e) => setIncludedAdults(e.target.value)}
                  />
                  <p className="mt-1 text-[11px] text-brand-muted">
                    Counts adults + children toward package base.
                  </p>
                </label>
                <label className="block text-xs font-medium text-brand-muted">
                  Package base price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={`mt-1 ${adminFieldClass}`}
                    value={packageBasePrice}
                    onChange={(e) => setPackageBasePrice(e.target.value)}
                  />
                </label>
                <label className="block text-xs font-medium text-brand-muted">
                  Extra adult pricing type
                  <AdminCombobox
                    className={`mt-1 ${adminFieldClass}`}
                    value={extraAdultPricingType}
                    onValueChange={(next) => {
                      const value = next as "fixed" | "not_allowed";
                      setExtraAdultPricingType(value);
                      if (value === "not_allowed") setExtraAdultPrice("0");
                    }}
                    options={[
                      { value: "fixed", label: "Fixed amount" },
                      { value: "not_allowed", label: "Not allowed" },
                    ]}
                  />
                </label>
                <label className="block text-xs font-medium text-brand-muted">
                  Extra adult price
                  {extraAdultPricingType === "not_allowed" ? (
                    <input
                      type="text"
                      readOnly
                      disabled
                      className={cn(
                        `mt-1 ${adminFieldClass}`,
                        "cursor-not-allowed bg-brand-surface-soft text-brand-muted opacity-80"
                      )}
                      value="—"
                    />
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={`mt-1 ${adminFieldClass}`}
                      value={extraAdultPrice}
                      onChange={(e) => setExtraAdultPrice(e.target.value)}
                    />
                  )}
                </label>
                <label className="block text-xs font-medium text-brand-muted">
                  Extra child price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={`mt-1 ${adminFieldClass}`}
                    value={extraChildPrice}
                    onChange={(e) => setExtraChildPrice(e.target.value)}
                  />
                </label>
              </div>
            ) : null}

            <div className="grid grid-cols-3 gap-4">
              <label className="block text-xs font-medium text-brand-muted">
                Infant price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`mt-1 ${adminFieldClass}`}
                  value={infantPrice}
                  onChange={(e) => setInfantPrice(e.target.value)}
                />
              </label>
              <label className="block text-xs font-medium text-brand-muted">
                Infant pricing type
                <AdminCombobox
                  className={`mt-1 ${adminFieldClass}`}
                  value={infantType}
                  onValueChange={(next) => {
                    setInfantType(next);
                    if (next === "not_allowed") setMaxInfants("");
                  }}
                  options={[
                    { value: "free", label: "Free" },
                    { value: "fixed", label: "Fixed amount" },
                    { value: "not_allowed", label: "Not allowed" },
                  ]}
                />
              </label>
              <label className="block text-xs font-medium text-brand-muted">
                Max infants (optional)
                <input
                  type="number"
                  min="0"
                  disabled={infantType === "not_allowed"}
                  aria-disabled={infantType === "not_allowed"}
                  title={
                    infantType === "not_allowed"
                      ? "Not used when infant pricing is Not allowed"
                      : undefined
                  }
                  className={cn(
                    `mt-1 ${adminFieldClass}`,
                    infantType === "not_allowed" &&
                      "cursor-not-allowed bg-brand-surface-soft text-brand-muted opacity-80"
                  )}
                  value={infantType === "not_allowed" ? "" : maxInfants}
                  onChange={(e) => {
                    if (infantType === "not_allowed") return;
                    setMaxInfants(e.target.value);
                  }}
                />
              </label>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" size="sm" disabled={pending}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" variant="primary" size="sm" disabled={pending || guestRangeInvalid}>
                {pending ? "Creating…" : "Create rule"}
              </Button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute right-4 top-4 rounded-sm p-1 text-brand-muted hover:text-brand-heading"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
