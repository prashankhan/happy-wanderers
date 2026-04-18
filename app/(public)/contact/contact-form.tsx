"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { primaryTourCtaClassName } from "@/lib/ui/primary-tour-cta";
import { cn } from "@/lib/utils/cn";

/** Matches `app/(public)/booking/booking-form-client.tsx` contact details card. */
const publicFormLabelClass =
  "mb-2 block text-base font-bold uppercase tracking-normal text-brand-muted";

const publicFormFieldClass =
  "w-full rounded-sm border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-heading shadow-sm transition placeholder:text-brand-body/35 focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/10";

interface ContactFormProps {
  /** When true, status copy and submit control are centered (contact page). */
  centerSubmit?: boolean;
}

export function ContactForm({ centerSubmit = false }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone") || null,
          topic: fd.get("topic") || null,
          message: fd.get("message"),
        }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        <div>
          <label htmlFor="contact-name" className={publicFormLabelClass}>
            Name
          </label>
          <input
            id="contact-name"
            required
            name="name"
            placeholder="E.g. David Attenborough"
            className={publicFormFieldClass}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={publicFormLabelClass}>
            Email
          </label>
          <input
            id="contact-email"
            required
            type="email"
            name="email"
            placeholder="david@archive.org"
            className={publicFormFieldClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        <div>
          <label htmlFor="contact-phone" className={publicFormLabelClass}>
            Phone (optional)
          </label>
          <input
            id="contact-phone"
            name="phone"
            placeholder="+61 400 000 000"
            className={publicFormFieldClass}
          />
        </div>
        <div>
          <label htmlFor="contact-topic" className={publicFormLabelClass}>
            Topic
          </label>
          <input
            id="contact-topic"
            name="topic"
            placeholder="Private charter, accessibility…"
            className={publicFormFieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className={publicFormLabelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          required
          name="message"
          rows={6}
          placeholder="How can we help you plan your rainforest day?"
          className={publicFormFieldClass}
        />
      </div>

      <div
        className={cn(
          "pt-1 md:pt-2",
          centerSubmit && "flex flex-col items-center text-center"
        )}
      >
        {status === "error" ? (
          <p
            className={cn(
              "mb-4 rounded-sm border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600",
              centerSubmit && "w-full max-w-md"
            )}
          >
            Could not send. Please check your data and try again.
          </p>
        ) : null}
        {status === "done" ? (
          <p
            className={cn(
              "mb-4 rounded-sm border border-availability-open/30 bg-brand-surface-soft p-4 text-sm font-bold text-availability-open",
              centerSubmit && "w-full max-w-md"
            )}
          >
            Message sent successfully. We will be in touch within one business day.
          </p>
        ) : null}

        <Button type="submit" variant="primary" disabled={status === "loading"} className={primaryTourCtaClassName}>
          {status === "loading" ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
