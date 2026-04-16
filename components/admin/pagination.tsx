"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { cn } from "@/lib/utils/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const url = baseUrl ?? pathname;

  const pages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const delta = 2;
    const range: (number | "...")[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }

    return range;
  }, [currentPage, totalPages]);

  function buildUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${url}?${params.toString()}`;
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1">
      <Link
        href={buildUrl(currentPage - 1)}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-sm text-sm font-medium transition-colors",
          currentPage === 1
            ? "pointer-events-none text-brand-muted/50"
            : "text-brand-body hover:bg-brand-surface"
        )}
        aria-disabled={currentPage === 1}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="flex h-8 w-8 items-center justify-center text-sm text-brand-muted">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page)}
            className={cn(
              "flex h-8 min-w-[32px] items-center justify-center rounded-sm text-sm font-medium transition-colors",
              page === currentPage
                ? "bg-brand-primary text-white"
                : "text-brand-body hover:bg-brand-surface"
            )}
          >
            {page}
          </Link>
        )
      )}

      <Link
        href={buildUrl(currentPage + 1)}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-sm text-sm font-medium transition-colors",
          currentPage === totalPages
            ? "pointer-events-none text-brand-muted/50"
            : "text-brand-body hover:bg-brand-surface"
        )}
        aria-disabled={currentPage === totalPages}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
    </div>
  );
}
