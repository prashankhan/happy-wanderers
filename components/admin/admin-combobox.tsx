"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { adminFieldClass } from "@/components/admin/form-field-styles";

export interface AdminComboboxOption {
  value: string;
  label: string;
}

export interface AdminComboboxProps {
  name?: string;
  value: string;
  options: AdminComboboxOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  maxOptions?: number;
  mode?: "search" | "select";
  onValueChange: (value: string) => void;
}

export function AdminCombobox({
  name,
  value,
  options,
  placeholder,
  className,
  disabled = false,
  required = false,
  maxOptions = 200,
  mode = "select",
  onValueChange,
}: AdminComboboxProps) {
  const comboboxId = useId().replace(/:/g, "-");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectedLabelRef = useRef("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  selectedLabelRef.current = selectedOption?.label ?? "";

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? options
      : options.filter((option) => {
          const label = option.label.toLowerCase();
          const optionValue = option.value.toLowerCase();
          return label.includes(q) || optionValue.includes(q);
        });
    return list.slice(0, maxOptions);
  }, [maxOptions, options, query]);

  useEffect(() => {
    setQuery(selectedOption?.label ?? "");
  }, [selectedOption?.label]);

  useEffect(() => {
    if (!open) return;
    const selectedIndex = filteredOptions.findIndex((option) => option.value === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [filteredOptions, open, value]);

  function selectOption(nextValue: string) {
    onValueChange(nextValue);
    setOpen(false);
    // Finalize selection immediately (no extra outside click needed).
    inputRef.current?.blur();
  }

  return (
    <div className="relative">
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <input
        ref={inputRef}
        className={className ? `${adminFieldClass} ${className}` : adminFieldClass}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (mode === "select") {
            setQuery("");
          }
          setOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => {
            setQuery(selectedLabelRef.current);
            setOpen(false);
          }, 120);
        }}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            if (mode === "select") {
              setQuery("");
            }
            setOpen(true);
            return;
          }
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, filteredOptions.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            const current = filteredOptions[activeIndex];
            if (current) selectOption(current.value);
          } else if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        role="combobox"
        aria-expanded={open}
        aria-controls={`admin-combobox-listbox-${comboboxId}`}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-activedescendant={
          open && filteredOptions[activeIndex]
            ? `admin-combobox-option-${comboboxId}-${filteredOptions[activeIndex]?.value.replace(/[^a-zA-Z0-9_-]/g, "-")}`
            : undefined
        }
      />
      {open ? (
        <div
          id={`admin-combobox-listbox-${comboboxId}`}
          role="listbox"
          className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-sm border border-brand-border bg-white shadow-lg"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                key={option.value}
                id={`admin-combobox-option-${comboboxId}-${option.value.replace(/[^a-zA-Z0-9_-]/g, "-")}`}
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-brand-surface ${
                  option.value === value || index === activeIndex
                    ? "bg-brand-surface-soft font-semibold text-brand-heading"
                    : "text-brand-body"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOption(option.value);
                }}
              >
                {option.label}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-brand-muted">No matches found.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
