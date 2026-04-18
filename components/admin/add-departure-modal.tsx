"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";

import { AdminCombobox } from "@/components/admin/admin-combobox";
import { adminFieldClass } from "@/components/admin/form-field-styles";
import { Button } from "@/components/ui/button";

interface AddDepartureModalProps {
  tourId: string;
  isFirstPickup: boolean;
  onCreated: () => void;
  pending: boolean;
  onPendingChange: (pending: boolean) => void;
}

export function AddDepartureModal({
  tourId,
  isFirstPickup,
  onCreated,
  pending,
  onPendingChange,
}: AddDepartureModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pickupTime, setPickupTime] = useState("07:00");
  const [pickupTimeLabel, setPickupTimeLabel] = useState("");
  const [priceType, setPriceType] = useState<"none" | "fixed" | "percentage">("none");
  const [priceValue, setPriceValue] = useState("0");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [notes, setNotes] = useState("");
  const [isDefault, setIsDefault] = useState(isFirstPickup);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setIsDefault(isFirstPickup);
      setError(null);
    }
  }, [open, isFirstPickup]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    onPendingChange(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/departures/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tour_id: tourId,
          name: name.trim(),
          pickup_time: pickupTime,
          pickup_time_label: pickupTimeLabel.trim() || null,
          price_adjustment_type: priceType,
          price_adjustment_value: priceType === "none" ? "0" : priceValue.trim() || "0",
          google_maps_link: googleMapsLink.trim() || null,
          notes: notes.trim() || null,
          is_default: isDefault || isFirstPickup,
          is_active: true,
        }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        setError(data.message ?? "Failed to create pickup");
        return;
      }
      setOpen(false);
      setName("");
      setPickupTime("07:00");
      setPickupTimeLabel("");
      setPriceType("none");
      setPriceValue("0");
      setGoogleMapsLink("");
      setNotes("");
      setIsDefault(false);
      onCreated();
    } finally {
      onPendingChange(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button type="button" variant="secondary" size="sm" disabled={pending}>
          Add pickup
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-sm border border-brand-border bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-brand-heading">Add pickup location</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-brand-muted">
            Pickups appear on the public tour and booking pages. Times use 24-hour format (e.g. 07:30).
          </Dialog.Description>
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-4">
            <label className="block text-xs font-medium text-brand-muted">
              Name *
              <input
                required
                className={`mt-1 ${adminFieldClass}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cairns City"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-xs font-medium text-brand-muted">
                Pickup time (24h) *
                <input
                  type="time"
                  required
                  className={`mt-1 ${adminFieldClass}`}
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                />
              </label>
              <label className="block text-xs font-medium text-brand-muted">
                Time label (optional)
                <input
                  className={`mt-1 ${adminFieldClass}`}
                  value={pickupTimeLabel}
                  onChange={(e) => setPickupTimeLabel(e.target.value)}
                  placeholder="e.g. 7:00 AM"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-xs font-medium text-brand-muted">
                Price adjustment
                <AdminCombobox
                  className={`mt-1 ${adminFieldClass}`}
                  value={priceType}
                  onValueChange={(v) => {
                    setPriceType(v as "none" | "fixed" | "percentage");
                    if (v === "none") setPriceValue("0");
                  }}
                  options={[
                    { value: "none", label: "None" },
                    { value: "fixed", label: "Fixed (AUD)" },
                    { value: "percentage", label: "Percentage (%)" },
                  ]}
                />
              </label>
              <label className="block text-xs font-medium text-brand-muted">
                Adjustment value
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  disabled={priceType === "none"}
                  className={`mt-1 ${adminFieldClass}`}
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                />
              </label>
            </div>
            <label className="block text-xs font-medium text-brand-muted">
              Google Maps link (optional)
              <input
                className={`mt-1 ${adminFieldClass}`}
                value={googleMapsLink}
                onChange={(e) => setGoogleMapsLink(e.target.value)}
                placeholder="https://..."
              />
            </label>
            <label className="block text-xs font-medium text-brand-muted">
              Notes (optional)
              <textarea
                rows={2}
                className={`mt-1 ${adminFieldClass}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-body">
              <input
                type="checkbox"
                checked={isDefault || isFirstPickup}
                disabled={isFirstPickup}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              Default pickup for this tour
              {isFirstPickup ? (
                <span className="text-xs text-brand-muted">(required for the first pickup)</span>
              ) : null}
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" size="sm" disabled={pending}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" variant="primary" size="sm" disabled={pending}>
                {pending ? "Saving…" : "Create pickup"}
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
