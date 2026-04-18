"use client";

import { useCallback, useId, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export interface AdminStringListFieldProps {
  label: string;
  hint?: string;
  items: string[];
  onItemsChange: (next: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

function splitPasteIntoItems(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function AdminStringListField({
  label,
  hint = "Press Enter or comma after each item. Paste multiple lines or comma-separated values to add several at once.",
  items,
  onItemsChange,
  disabled = false,
  placeholder = "Type an item…",
}: AdminStringListFieldProps) {
  const headingId = useId();
  const [draft, setDraft] = useState("");

  const flushDraft = useCallback(() => {
    const next = draft.trim();
    if (!next) return;
    onItemsChange([...items, next]);
    setDraft("");
  }, [draft, items, onItemsChange]);

  function removeAt(index: number) {
    onItemsChange(items.filter((_, i) => i !== index));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      flushDraft();
      return;
    }
    if (e.key === "Backspace" && draft === "" && items.length > 0) {
      e.preventDefault();
      onItemsChange(items.slice(0, -1));
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    if (disabled) return;
    const text = e.clipboardData.getData("text");
    if (!text || !/[\n,]/.test(text)) return;
    e.preventDefault();
    const pasted = splitPasteIntoItems(text);
    if (!pasted.length) return;
    const tail = draft.trim();
    const merged = tail ? [...items, tail, ...pasted] : [...items, ...pasted];
    onItemsChange(merged);
    setDraft("");
  }

  return (
    <div className="text-xs font-medium text-brand-muted md:col-span-2">
      <div id={headingId} className="text-brand-heading">
        {label}
      </div>
      {hint ? <p className="mt-0.5 font-normal leading-relaxed text-brand-muted">{hint}</p> : null}
      <div
        role="group"
        aria-labelledby={headingId}
        className={cn(
          "mt-1 flex min-h-[80px] flex-wrap content-start items-center gap-2 rounded-sm border border-brand-border bg-white p-2 shadow-sm transition",
          "focus-within:border-brand-primary/40 focus-within:ring-2 focus-within:ring-brand-primary/10",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        {items.map((item, index) => (
          <span
            key={`${index}-${item}`}
            className="inline-flex max-w-full items-center gap-1 rounded-sm border border-brand-border bg-brand-surface px-2 py-1 text-sm font-bold text-brand-heading"
          >
            <span className="min-w-0 truncate" title={item}>
              {item}
            </span>
            <button
              type="button"
              className="shrink-0 rounded-sm p-0.5 text-brand-muted transition-colors hover:bg-brand-surface-soft hover:text-brand-heading"
              aria-label={`Remove ${item}`}
              disabled={disabled}
              onClick={() => removeAt(index)}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </span>
        ))}
        <input
          type="text"
          className={cn(
            "min-h-9 min-w-[12rem] flex-1 border-0 bg-transparent px-2 py-1 text-base font-bold text-brand-heading outline-none placeholder:text-brand-muted/70",
            !disabled && "cursor-text"
          )}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => {
            if (draft.trim()) flushDraft();
          }}
          disabled={disabled}
          placeholder={items.length === 0 ? placeholder : "Add another…"}
          aria-label={`Add item to ${label}`}
        />
      </div>
    </div>
  );
}
