"use client";

import * as Dialog from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: "primary" | "danger";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "primary",
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-sm border border-brand-border bg-white p-5 shadow-xl">
          <Dialog.Title className="pr-6 text-base font-semibold text-brand-heading">{title}</Dialog.Title>
          {description && (
            <Dialog.Description className="mt-2 text-sm leading-relaxed text-brand-muted">
              {description}
            </Dialog.Description>
          )}

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-sm border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-medium text-brand-heading transition-colors hover:bg-brand-surface-soft"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className={`rounded-sm px-3 py-1.5 text-xs font-medium text-white transition-colors ${
                variant === "danger"
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-brand-primary hover:bg-brand-primary-hover"
              }`}
            >
              {confirmLabel}
            </button>
          </div>

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute right-3 top-3 rounded-sm p-1 text-brand-muted hover:text-brand-heading transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
