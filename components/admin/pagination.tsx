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
      {currentPage === 1 ? (
        <span
          aria-disabled="true"
          className="flex h-8 w-8 items-center justify-center rounded-sm text-brand-muted/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </span>
      ) : (
        <Link
          href={buildUrl(currentPage - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-sm text-sm font-medium text-brand-body transition-colors hover:bg-brand-surface"
          aria-label="Go to previous page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
      )}

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

      {currentPage === totalPages ? (
        <span
          aria-disabled="true"
          className="flex h-8 w-8 items-center justify-center rounded-sm text-brand-muted/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      ) : (
        <Link
          href={buildUrl(currentPage + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-sm text-sm font-medium text-brand-body transition-colors hover:bg-brand-surface"
          aria-label="Go to next page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      )}
    </div>
  );
}
