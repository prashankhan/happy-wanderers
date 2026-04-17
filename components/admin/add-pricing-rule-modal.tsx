"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

import { AdminCombobox } from "@/components/admin/admin-combobox";
import { adminFieldClass } from "@/components/admin/form-field-styles";
import { Button } from "@/components/ui/button";

interface AddPricingRuleModalProps {
  tourId: string;
  onCreated: () => void;
  pending: boolean;
  onPendingChange: (pending: boolean) => void;
}

export function AddPricingRuleModal({ tourId, onCreated, pending, onPendingChange }: AddPricingRuleModalProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [adultPrice, setAdultPrice] = useState("100");
  const [childPrice, setChildPrice] = useState("50");
  const [infantPrice, setInfantPrice] = useState("0");
  const [infantType, setInfantType] = useState("free");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      setError("Label is required");
      return;
    }

    onPendingChange(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/pricing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tour_id: tourId,
          label: label.trim(),
          adult_price: adultPrice,
          child_price: childPrice,
          infant_price: infantPrice,
          infant_pricing_type: infantType,
        }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };

      if (!res.ok || !data.success) {
        setError(data.message ?? "Failed to create rule");
        return;
      }

      setOpen(false);
      setLabel("");
      setAdultPrice("100");
      setChildPrice("50");
      setInfantPrice("0");
      setInfantType("free");
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

            <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-xs font-medium text-brand-muted">
                Child price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`mt-1 ${adminFieldClass}`}
                  value={childPrice}
                  onChange={(e) => setChildPrice(e.target.value)}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  onValueChange={setInfantType}
                  options={[
                    { value: "free", label: "Free" },
                    { value: "fixed", label: "Fixed amount" },
                    { value: "not_allowed", label: "Not allowed" },
                  ]}
                />
              </label>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" disabled={pending}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={pending}>
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
