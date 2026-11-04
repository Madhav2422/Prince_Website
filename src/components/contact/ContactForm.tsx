"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { Loader2, Send, X } from "lucide-react";
import { contact } from "@/data/contact";

const field =
  "w-full border border-ink-600 bg-ink-950/60 px-4 py-3 text-sm text-cream placeholder:text-smoke/70 transition-colors duration-300 focus:border-gold-500 focus:outline-none";
const label = "mb-2 block text-[11px] font-medium uppercase tracking-[0.25em] text-smoke";

// Read each variable by its full name so Next.js can inline it into the browser bundle.
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

/** How long the "sent" confirmation stays on screen, including its exit animation. */
const SUCCESS_VISIBLE_MS = 5000;
const SUCCESS_EXIT_MS = 450;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [leaving, setLeaving] = useState(false);

  // Start the exit animation just before the 5 second mark…
  useEffect(() => {
    if (status !== "sent") return;
    const timer = setTimeout(() => setLeaving(true), SUCCESS_VISIBLE_MS - SUCCESS_EXIT_MS);
    return () => clearTimeout(timer);
  }, [status]);

  // …and remove the panel once it has faded out (also used by the close button).
  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => {
      setStatus("idle");
      setLeaving(false);
    }, SUCCESS_EXIT_MS);
    return () => clearTimeout(timer);
  }, [leaving]);

  function fail(message: string) {
    setError(message);
    setStatus("error");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();

    const name = value("name");
    const email = value("email");
    const phone = value("phone");
    const message = value("message");
    const firstName = name.split(/\s+/)[0];

    // Honeypot filled in: almost certainly a bot. Pretend it worked, send nothing.
    if (value("company")) {
      form.reset();
      setSentTo(firstName);
      setStatus("sent");
      return;
    }

    if (!name) return fail("Please tell us your name.");
    if (!EMAIL_PATTERN.test(email)) return fail("Please enter a valid email address.");
    if (!message) return fail("Please write a message.");

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      console.error("EmailJS is not configured: set the NEXT_PUBLIC_EMAILJS_* environment variables.");
      return fail("Our message service is unavailable right now.");
    }

    setStatus("sending");
    setError("");
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { name, email, phone: phone || "Not provided", message },
        // Throttle stops accidental double submits from sending the same email twice.
        { publicKey: PUBLIC_KEY, limitRate: { id: "contact-form", throttle: 10_000 } },
      );
      form.reset();
      setSentTo(firstName);
      setLeaving(false);
      setStatus("sent");
    } catch (err) {
      // EmailJS rejects with { status, text } rather than an Error.
      console.error("EmailJS send failed:", err);
      fail("We couldn’t send your message just now. Please try again in a moment.");
    }
  }

  return (
    <div className="relative">
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

      {/* Always mounted so screen readers announce the confirmation when it appears */}
      <div aria-live="polite" className="pointer-events-none absolute inset-0">
        {status === "sent" && <SentPanel name={sentTo} leaving={leaving} onClose={() => setLeaving(true)} />}
      </div>
    </div>
  );
}

/** Sparks that burst out of the seal: [x, y, size] in px. */
const SPARKS: [number, number, number][] = [
  [58, 0, 6],
  [41, 41, 4],
  [0, 58, 5],
  [-41, 41, 4],
  [-58, 0, 6],
  [-41, -41, 4],
  [0, -58, 5],
  [41, -41, 4],
  [30, -52, 3],
  [-30, 52, 3],
  [52, 30, 3],
  [-52, -30, 3],
];

function SentPanel({ name, leaving, onClose }: { name: string; leaving: boolean; onClose: () => void }) {
  return (
    <div
      className={`cf-panel pointer-events-auto relative flex h-full flex-col items-center justify-center overflow-hidden border border-gold-500/40 bg-ink-950/95 px-6 py-10 text-center backdrop-blur-sm ${leaving ? "is-leaving" : ""}`}
    >
      {/* Soft gold glow behind everything */}
      <div aria-hidden className="absolute left-1/2 top-1/3 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/10 blur-3xl" />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close message"
        className="absolute right-3 top-3 grid size-9 place-items-center text-smoke transition-colors hover:text-gold-400 focus-visible:outline-2 focus-visible:outline-gold-500"
      >
        <X className="size-4" />
      </button>

      {/* Animated seal: ring and tick draw themselves, then sparks burst outward */}
      <div aria-hidden className="relative size-24">
        <span className="cf-halo absolute inset-0 rounded-full border border-gold-400" />
        {SPARKS.map(([dx, dy, size], i) => (
          <span
            key={i}
            className="cf-spark absolute left-1/2 top-1/2 rounded-full bg-gold-300"
            style={
              {
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                "--dx": `${dx}px`,
                "--dy": `${dy}px`,
                animationDelay: `${0.9 + (i % 3) * 0.06}s`,
              } as CSSProperties
            }
          />
        ))}
        <svg viewBox="0 0 64 64" className="relative size-full">
          <circle cx="32" cy="32" r="30" className="fill-gold-500/10" />
          <circle
            cx="32"
            cy="32"
            r="26"
            transform="rotate(-90 32 32)"
            className="cf-ring fill-none stroke-gold-500"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M21 33 l7 7 l15 -16"
            className="cf-check fill-none stroke-gold-400"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <p className="relative mt-8 animate-fade-up text-[11px] font-medium uppercase tracking-[0.4em] text-gold-500 [animation-delay:0.5s]">
        Message sent
      </p>
      <h3 className="relative mt-3 animate-fade-up font-serif text-[clamp(1.9rem,4vw,2.6rem)] font-semibold uppercase leading-tight text-cream [animation-delay:0.62s]">
        Thank you{name ? `, ${name}` : ""}
      </h3>
      <p className="relative mt-3 max-w-[22rem] animate-fade-up text-[15px] leading-[1.8] text-mist [animation-delay:0.75s]">
        Your note has reached Soulful Smell. We&apos;ll get back to you soon. Keep an eye on your inbox.
      </p>

      {/* Countdown line: drains over the time the panel stays visible */}
      <span
        aria-hidden
        className="cf-timer absolute inset-x-0 bottom-0 h-[3px] bg-linear-to-r from-gold-700 via-gold-400 to-gold-700"
        style={{ animationDuration: `${SUCCESS_VISIBLE_MS}ms` }}
      />
    </div>
  );
}
