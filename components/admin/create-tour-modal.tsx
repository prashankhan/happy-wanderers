"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { adminFieldClass } from "@/components/admin/form-field-styles";
import { Button } from "@/components/ui/button";

export function CreateTourModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(title.trim() ? { title: title.trim() } : {}),
      });
      const data = (await res.json()) as {
        success?: boolean;
        tour_id?: string;
        message?: string;
      };

      if (!res.ok || !data.success || !data.tour_id) {
        setError(data.message ?? "Could not create tour");
        return;
      }

      setOpen(false);
      setTitle("");
      router.push(`/admin/tours/${data.tour_id}`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button type="button" variant="primary" size="sm">
          New tour
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-sm border border-brand-border bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-brand-heading">Create new tour</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-brand-muted">
            Enter a title for your new tour. You can leave it blank for a generic title.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <label className="block text-xs font-medium text-brand-muted">
              Tour title
              <input
                type="text"
                className={`mt-1 ${adminFieldClass}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sunset City Tour"
                autoFocus
              />
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" size="sm" disabled={pending}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" variant="primary" size="sm" disabled={pending}>
                {pending ? "Creating…" : "Create tour"}
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
