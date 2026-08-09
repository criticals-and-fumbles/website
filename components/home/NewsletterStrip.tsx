"use client";

import { useState } from "react";
import { showToast } from "@/components/ui/Toast";

export function NewsletterStrip() {
  const [email, setEmail] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    showToast("Coming soon — The Session Report isn't live yet!");
    setEmail("");
  }

  return (
    <section className="border-t border-border bg-surface px-4 py-16 md:px-8">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl text-text">The Session Report</h2>
        <p className="mt-2 text-sm text-text-muted">
          One article, one tip, one rabbit hole. Every Thursday.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="min-h-[44px] flex-1 rounded-md border border-border bg-bg px-4 text-sm text-text placeholder:text-text-muted focus:border-emerald focus:outline-none"
          />
          <button
            type="submit"
            className="min-h-[44px] rounded-md bg-emerald px-6 font-ui text-sm text-bg transition-opacity hover:opacity-90"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
