"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { contact } from "@/data/contact";

const field =
  "w-full border border-ink-600 bg-ink-950/60 px-4 py-3 text-sm text-cream placeholder:text-smoke/70 transition-colors duration-300 focus:border-gold-500 focus:outline-none";
const label = "mb-2 block text-[11px] font-medium uppercase tracking-[0.25em] text-smoke";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Something went wrong.");
      form.reset();
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Honeypot: hidden from people, tempting to bots */}
      <div aria-hidden className="absolute left-[-9999px]">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>
            Your Name *
          </label>
          <input id="name" name="name" type="text" required autoComplete="name" className={field} placeholder="Madhav Hirani" />
        </div>
        <div>
          <label htmlFor="phone" className={label}>
            Phone
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={field} placeholder="+91 00000 00000" />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={label}>
          Email *
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={field} placeholder="you@example.com" />
      </div>

      <div>
        <label htmlFor="message" className={label}>
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={`${field} resize-y`}
          placeholder="Tell us which scent you are looking for…"
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="group inline-flex items-center gap-3 bg-gold-500 px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.18em] text-ink-950 transition-colors duration-300 hover:bg-gold-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
        {status === "sending" ? (
          <Loader2 aria-hidden className="size-4 animate-spin" />
        ) : (
          <Send aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </button>

      <p aria-live="polite" className="min-h-6 text-sm">
        {status === "sent" && (
          <span className="text-gold-400">Thank you — your message is on its way. We will get back to you soon.</span>
        )}
        {status === "error" && (
          <span className="text-red-400">
            {error}{" "}
            <a href={`mailto:${contact.email}`} className="underline hover:text-gold-400">
              Email us instead
            </a>
            .
          </span>
        )}
      </p>
    </form>
  );
}
