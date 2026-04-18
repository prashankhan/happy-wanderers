"use client";

import { useCallback, useEffect, useState } from "react";

import { AddDepartureModal } from "@/components/admin/add-departure-modal";
import { AdminCombobox } from "@/components/admin/admin-combobox";
import { adminFieldClass } from "@/components/admin/form-field-styles";
import { Button } from "@/components/ui/button";

export interface DepartureRow {
  id: string;
  tourId: string;
  name: string;
  pickupTime: string;
  pickupTimeLabel: string | null;
  priceAdjustmentType: string;
  priceAdjustmentValue: string;
  googleMapsLink: string | null;
  notes: string | null;
  isDefault: boolean;
  isActive: boolean;
  displayOrder: number;
}

interface TourDeparturesEditorProps {
  tourId: string;
  pending: boolean;
  onPendingChange: (pending: boolean) => void;
  showToast: (message: string, type?: "error") => void;
}

export function TourDeparturesEditor({
  tourId,
  pending,
  onPendingChange,
  showToast,
}: TourDeparturesEditorProps) {
  const [rows, setRows] = useState<DepartureRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, DepartureRow>>({});

  const loadDepartures = useCallback(async () => {
    const res = await fetch(`/api/admin/departures?tour_id=${encodeURIComponent(tourId)}`);
    if (!res.ok) return;
    const data = (await res.json()) as DepartureRow[];
    setRows(data);
  }, [tourId]);

  useEffect(() => {
    void loadDepartures();
  }, [loadDepartures]);

  useEffect(() => {
    const next: Record<string, DepartureRow> = {};
    rows.forEach((r) => {
      next[r.id] = { ...r };
    });
    setDrafts(next);
  }, [rows]);

  function isDirty(id: string): boolean {
    const o = rows.find((r) => r.id === id);
    const d = drafts[id];
    if (!o || !d) return false;
    return JSON.stringify(o) !== JSON.stringify(d);
  }

  async function saveRow(id: string) {
    const d = drafts[id];
    if (!d) return;
    onPendingChange(true);
    try {
      const res = await fetch("/api/admin/departures/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: d.name,
          pickup_time: d.pickupTime,
          pickup_time_label: d.pickupTimeLabel,
          price_adjustment_type: d.priceAdjustmentType,
          price_adjustment_value: d.priceAdjustmentType === "none" ? "0" : d.priceAdjustmentValue,
          google_maps_link: d.googleMapsLink,
          notes: d.notes,
          is_default: d.isDefault,
          is_active: d.isActive,
          display_order: d.displayOrder,
        }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        showToast(data.message ?? "Update failed", "error");
        return;
      }
      showToast("Pickup saved");
      await loadDepartures();
    } finally {
      onPendingChange(false);
    }
  }

  async function deleteRow(id: string) {
    if (!confirm("Delete this pickup? Bookings that use it cannot be deleted here—those rows must stay until reassigning or deactivating instead.")) return;
    onPendingChange(true);
    try {
      const res = await fetch(`/api/admin/departures/delete?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        showToast(data.message ?? "Delete failed", "error");
        return;
      }
      showToast("Pickup deleted");
      await loadDepartures();
    } finally {
      onPendingChange(false);
    }
  }

  const isFirstPickup = rows.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-brand-body">
          Pickup stops for checkout and the public tour page. Optional price adjustments apply after the active pricing
          rule (none, fixed AUD, or percentage).
        </p>
        <AddDepartureModal
          tourId={tourId}
          isFirstPickup={isFirstPickup}
          onCreated={() => void loadDepartures()}
          pending={pending}
          onPendingChange={onPendingChange}
        />
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-brand-muted">No pickups yet. Add one to enable pickup choice on the site.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => {
            const d = drafts[r.id] ?? r;
            return (
              <li key={r.id} className="rounded-sm border border-brand-border p-4">
                {isDirty(r.id) ? (
                  <p className="mb-2 text-xs font-medium text-amber-700">Unsaved changes</p>
                ) : null}
                <div className="grid gap-2 md:grid-cols-3">
                  <label className="text-xs font-medium text-brand-muted">
                    Name
                    <input
                      className={`mt-1 ${adminFieldClass}`}
                      value={d.name}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [r.id]: { ...(prev[r.id] ?? r), name: e.target.value },
                        }))
                      }
                      disabled={pending}
                    />
                  </label>
                  <label className="text-xs font-medium text-brand-muted">
                    Pickup time (24h)
                    <input
                      type="time"
                      className={`mt-1 ${adminFieldClass}`}
                      value={d.pickupTime}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [r.id]: { ...(prev[r.id] ?? r), pickupTime: e.target.value },
                        }))
                      }
                      disabled={pending}
                    />
                  </label>
                  <label className="text-xs font-medium text-brand-muted">
                    Time label
                    <input
                      className={`mt-1 ${adminFieldClass}`}
                      value={d.pickupTimeLabel ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [r.id]: { ...(prev[r.id] ?? r), pickupTimeLabel: e.target.value || null },
                        }))
                      }
                      disabled={pending}
                    />
                  </label>
                  <label className="text-xs font-medium text-brand-muted">
                    Price adjustment
                    <AdminCombobox
                      className={`mt-1 ${adminFieldClass}`}
                      value={d.priceAdjustmentType}
                      onValueChange={(v) =>
                        setDrafts((prev) => {
                          const row = prev[r.id] ?? r;
                          const nextType = v as DepartureRow["priceAdjustmentType"];
                          return {
                            ...prev,
                            [r.id]: {
                              ...row,
                              priceAdjustmentType: nextType,
                              priceAdjustmentValue: nextType === "none" ? "0" : row.priceAdjustmentValue,
                            },
                          };
                        })
                      }
                      options={[
                        { value: "none", label: "None" },
                        { value: "fixed", label: "Fixed (AUD)" },
                        { value: "percentage", label: "Percentage (%)" },
                      ]}
                      disabled={pending}
                    />
                  </label>
                  <label className="text-xs font-medium text-brand-muted">
                    Adjustment value
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      disabled={d.priceAdjustmentType === "none" || pending}
                      className={`mt-1 ${adminFieldClass}`}
                      value={d.priceAdjustmentValue}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [r.id]: { ...(prev[r.id] ?? r), priceAdjustmentValue: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label className="text-xs font-medium text-brand-muted">
                    Display order
                    <input
                      type="number"
                      min={0}
                      className={`mt-1 ${adminFieldClass}`}
                      value={String(d.displayOrder)}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [r.id]: {
                            ...(prev[r.id] ?? r),
                            displayOrder: Number.parseInt(e.target.value, 10) || 0,
                          },
                        }))
                      }
                      disabled={pending}
                    />
                  </label>
                  <label className="text-xs font-medium text-brand-muted md:col-span-3">
                    Google Maps link
                    <input
                      className={`mt-1 ${adminFieldClass}`}
                      value={d.googleMapsLink ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [r.id]: { ...(prev[r.id] ?? r), googleMapsLink: e.target.value || null },
                        }))
                      }
                      disabled={pending}
                    />
                  </label>
                  <label className="text-xs font-medium text-brand-muted md:col-span-3">
                    Notes
                    <textarea
                      rows={2}
                      className={`mt-1 ${adminFieldClass}`}
                      value={d.notes ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [r.id]: { ...(prev[r.id] ?? r), notes: e.target.value || null },
                        }))
                      }
                      disabled={pending}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-brand-muted">
                    <input
                      type="checkbox"
                      checked={d.isDefault}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [r.id]: { ...(prev[r.id] ?? r), isDefault: e.target.checked },
                        }))
                      }
                      disabled={pending}
                    />
                    Default pickup
                  </label>
                  <label className="flex items-center gap-2 text-xs text-brand-muted">
                    <input
                      type="checkbox"
                      checked={d.isActive}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [r.id]: { ...(prev[r.id] ?? r), isActive: e.target.checked },
                        }))
                      }
                      disabled={pending}
                    />
                    Active (shown on site)
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={pending || !isDirty(r.id)}
                    onClick={() => void saveRow(r.id)}
                  >
                    Save changes
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    disabled={pending || rows.length <= 1}
                    onClick={() => void deleteRow(r.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
