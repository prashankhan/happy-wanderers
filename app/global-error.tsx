"use client";

import { useEffect } from "react";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en-AU">
      <body className="min-h-screen bg-brand-surface font-sans text-brand-heading">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-16 text-center">
          <h1 className="font-serif text-2xl font-bold md:text-3xl">Something went wrong</h1>
          <p className="max-w-md text-sm text-brand-muted">
            The application hit a critical error. Try reloading the page.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-sm bg-brand-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-primary-hover"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
