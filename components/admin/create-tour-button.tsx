"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CreateTourButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onCreate() {
    const raw = window.prompt("Tour title (leave blank for “New tour”)", "");
    if (raw === null) return;
    const title = raw.trim();

    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(title ? { title } : {}),
      });
      const data = (await res.json()) as {
        success?: boolean;
        tour_id?: string;
        message?: string;
      };
      if (!res.ok || !data.success || !data.tour_id) {
        setMessage(data.message ?? "Could not create tour");
        return;
      }
      router.push(`/admin/tours/${data.tour_id}`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="primary" size="sm" disabled={pending} onClick={onCreate}>
        {pending ? "Creating…" : "New tour"}
      </Button>
      {message ? <p className="text-xs text-red-600">{message}</p> : null}
    </div>
  );
}
