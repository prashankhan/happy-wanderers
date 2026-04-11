"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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
  const [images, setImages] = useState<TourImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media?tour_id=${encodeURIComponent(tourId)}`);
      if (!res.ok) return;
      const data = (await res.json()) as TourImageRow[];
      setImages(data);
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
      await load();
      router.refresh();
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
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok) {
        setMsg(data.message ?? "Failed");
        return;
      }
      await load();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function remove(imageId: string) {
    if (!isAdmin) return;
    if (!confirm("Soft-delete this image?")) return;
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
      await load();
      router.refresh();
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
      setImages(next);
      router.refresh();
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
    return <p className="text-sm text-gray-500">Loading gallery…</p>;
  }

  return (
    <div className="space-y-4">
      {msg ? <p className="text-sm text-red-600">{msg}</p> : null}
      <label className="block text-xs font-medium text-gray-500">
        Upload image
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="mt-1 block w-full text-sm"
          disabled={pending}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void upload(f, false);
          }}
        />
      </label>
      {isAdmin ? (
        <label className="block text-xs font-medium text-gray-500">
          Upload as hero
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="mt-1 block w-full text-sm"
            disabled={pending}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void upload(f, true);
            }}
          />
        </label>
      ) : (
        <p className="text-xs text-gray-500">Staff can upload gallery images; hero and delete are admin-only.</p>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, idx) => (
          <li key={img.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.imageUrl} alt={img.altText ?? ""} className="h-40 w-full object-cover" />
            <div className="space-y-2 p-3 text-xs text-gray-600">
              {img.isHero ? <span className="font-semibold text-blue-900">Hero</span> : null}
              <div className="flex flex-wrap gap-2">
                {isAdmin ? (
                  <>
                    <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => move(idx, -1)}>
                      Up
                    </Button>
                    <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => move(idx, 1)}>
                      Down
                    </Button>
                    <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => void setHero(img.id)}>
                      Set hero
                    </Button>
                    <Button type="button" size="sm" variant="danger" disabled={pending} onClick={() => void remove(img.id)}>
                      Delete
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
