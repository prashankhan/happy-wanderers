"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

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

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Name
        <input required name="name" className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3" />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Email
        <input required type="email" name="email" className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3" />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Phone (optional)
        <input name="phone" className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3" />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Topic
        <input name="topic" className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3" />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Message
        <textarea required name="message" rows={5} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3" />
      </label>
      {status === "error" ? <p className="text-sm text-red-600">Could not send. Please try again.</p> : null}
      {status === "done" ? <p className="text-sm text-green-700">Sent. We’ll be in touch shortly.</p> : null}
      <Button type="submit" variant="primary" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
