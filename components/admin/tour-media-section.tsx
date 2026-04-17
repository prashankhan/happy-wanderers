"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Toast, useToast } from "@/components/admin/toast";
import { Button } from "@/components/ui/button";

export interface TourImageRow {
  id: string;
  imageUrl: string;
  altText: string | null;
  caption: string | null;
  sortOrder: number;
  isHero: boolean;
}

export interface TourMediaSectionProps {
  tourId: string;
  isAdmin: boolean;
}

export function TourMediaSection({ tourId, isAdmin }: TourMediaSectionProps) {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [images, setImages] = useState<TourImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [setAsCoverOnUpload, setSetAsCoverOnUpload] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/media?tour_id=${encodeURIComponent(tourId)}`);
      if (!res.ok) {
        setMsg("Could not load gallery.");
        setImages([]);
        return;
      }
      const data = (await res.json()) as TourImageRow[];
      setImages(Array.isArray(data) ? data : []);
    } catch {
      setMsg("Could not load gallery.");
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function upload(file: File, isHero: boolean) {
    setPending(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.set("tour_id", tourId);
      fd.set("file", file);
      fd.set("is_hero", isHero ? "true" : "false");
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok) {
        setMsg(data.message ?? "Upload failed");
        return;
      }
      setMsg(null);
      await load();
      router.refresh();
      showToast(isHero ? "Cover image uploaded" : "Gallery image uploaded");
    } finally {
      setPending(false);
    }
  }

  async function setHero(imageId: string) {
    if (!isAdmin) return;
    setPending(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/media/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tour_id: tourId, image_id: imageId }),
      });
      const data = ((await res.json().catch(() => null)) ?? {}) as { success?: boolean; message?: string };
      if (!res.ok) {
        setMsg(data.message ?? "Failed to update cover image");
        return;
      }
      setMsg(null);
      await load();
      router.refresh();
      showToast("Cover image updated");
    } finally {
      setPending(false);
    }
  }

  async function remove(imageId: string) {
    if (!isAdmin) return;
    if (!confirm("Remove this image from the gallery?")) return;
    setPending(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/admin/media/delete?tour_id=${encodeURIComponent(tourId)}&image_id=${encodeURIComponent(imageId)}`,
        { method: "DELETE" }
      );
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok) {
        setMsg(data.message ?? "Failed");
        return;
      }
      setMsg(null);
      await load();
      router.refresh();
      showToast("Image removed");
    } finally {
      setPending(false);
    }
  }

  async function applyReorder(next: TourImageRow[]) {
    if (!isAdmin) return;
    setPending(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/media/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tour_id: tourId, image_ids: next.map((i) => i.id) }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok) {
        setMsg(data.message ?? "Reorder failed");
        await load();
        return;
      }
      setMsg(null);
      setImages(next);
      router.refresh();
      showToast("Gallery order saved");
    } finally {
      setPending(false);
    }
  }

  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    const tmp = next[idx]!;
    next[idx] = next[j]!;
    next[j] = tmp;
    void applyReorder(next);
  }

  if (loading) {
    return <p className="text-sm text-brand-muted">Loading gallery…</p>;
  }

  return (
    <div className="space-y-4">
      {toast ? <Toast message={toast.message} type={toast.type} onClose={hideToast} /> : null}
      {msg ? <p className="text-sm text-red-600">{msg}</p> : null}
      <div className="rounded-sm border border-brand-border bg-brand-surface/40 p-4">
        <p className="text-xs text-brand-muted">
          Upload tour images, choose a cover image, and set display order. The first image appears first in the gallery.
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-sm border border-brand-border/70 bg-brand-surface-soft px-2 py-1 text-brand-muted">
            Ratio <span className="font-semibold text-brand-heading">16:9</span>
          </span>
          <span className="rounded-sm border border-brand-border/70 bg-brand-surface-soft px-2 py-1 text-brand-muted">
            Min <span className="font-semibold text-brand-heading">1600×900</span>
          </span>
          <span className="rounded-sm border border-brand-border/70 bg-brand-surface-soft px-2 py-1 text-brand-muted">
            Preferred <span className="font-semibold text-brand-heading">2400×1350</span>
          </span>
          <span className="rounded-sm border border-brand-border/70 bg-brand-surface-soft px-2 py-1 text-brand-muted">
            Max size <span className="font-semibold text-brand-heading">12MB</span>
          </span>
          <span className="rounded-sm border border-brand-border/70 bg-brand-surface-soft px-2 py-1 text-brand-muted">
            Formats <span className="font-semibold text-brand-heading">JPG, PNG, WebP, GIF</span>
          </span>
        </div>
        <label className="mt-3 block text-xs font-medium text-brand-muted">
          Upload image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="mt-1 block w-full text-sm"
            disabled={pending}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void upload(f, isAdmin && setAsCoverOnUpload);
            }}
          />
        </label>
        {isAdmin ? (
          <label className="mt-3 flex items-center gap-2 text-xs text-brand-muted">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-brand-border"
              checked={setAsCoverOnUpload}
              onChange={(e) => setSetAsCoverOnUpload(e.target.checked)}
              disabled={pending}
            />
            Set uploaded image as cover
          </label>
        ) : (
          <p className="mt-3 text-xs text-brand-muted">
            Staff can upload gallery images. Cover, reorder, and remove actions are admin-only.
          </p>
        )}
      </div>
      {images.length === 0 ? (
        <p className="text-sm text-brand-muted">No images in this gallery yet. Upload one above.</p>
      ) : null}
      <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, idx) => (
          <li key={img.id} className="overflow-hidden rounded-sm border border-brand-border bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.imageUrl} alt={img.altText ?? ""} className="h-40 w-full object-cover" />
            <div className="space-y-2 p-3 text-xs text-brand-body">
              {img.isHero ? <span className="font-semibold text-brand-primary">Cover image</span> : null}
              <p className="text-xs text-brand-muted">Position {idx + 1}</p>
              <div className="flex flex-wrap gap-2">
                {isAdmin ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={pending || idx === 0}
                      onClick={() => move(idx, -1)}
                    >
                      Move left
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={pending || idx === images.length - 1}
                      onClick={() => move(idx, 1)}
                    >
                      Move right
                    </Button>
                    <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => void setHero(img.id)}>
                      Set as cover
                    </Button>
                    <Button type="button" size="sm" variant="danger" disabled={pending} onClick={() => void remove(img.id)}>
                      Remove image
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
