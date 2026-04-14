"use client";

import { useState } from "react";

export function ContactForm() {
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

  const inputClasses = "mt-2 block w-full rounded-md border border-brand-border bg-white px-4 py-3.5 text-brand-heading focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all placeholder:text-brand-body/30";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-sm font-bold tracking-tight text-brand-heading">
          Name
          <input required name="name" placeholder="E.g. David Attenborough" className={inputClasses} />
        </label>
        <label className="block text-sm font-bold tracking-tight text-brand-heading">
          Email
          <input required type="email" name="email" placeholder="david@archive.org" className={inputClasses} />
        </label>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-sm font-bold tracking-tight text-brand-heading">
          Phone (optional)
          <input name="phone" placeholder="+61 400 000 000" className={inputClasses} />
        </label>
        <label className="block text-sm font-bold tracking-tight text-brand-heading">
          Topic
          <input name="topic" placeholder="Private charter, accessibility..." className={inputClasses} />
        </label>
      </div>

      <label className="block text-sm font-bold tracking-tight text-brand-heading">
        Message
        <textarea required name="message" rows={6} placeholder="How can we help you plan your rainforest day?" className={inputClasses} />
      </label>

      <div className="pt-2">
        {status === "error" ? <p className="mb-4 text-sm font-bold text-red-600">Could not send. Please check your data and try again.</p> : null}
        {status === "done" ? <p className="mb-4 text-sm font-bold text-availability-open">Message sent successfully. We will be in touch within one business day.</p> : null}
        
        <button 
          type="submit" 
          disabled={status === "loading"}
          className="inline-flex items-center justify-center rounded-sm bg-brand-primary px-14 py-5 text-2xl font-bold tracking-tight text-white transition-all hover:bg-brand-primary-hover hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
        >
          {status === "loading" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
