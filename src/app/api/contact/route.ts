import { NextResponse } from "next/server";
import { contact } from "@/data/contact";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  /** Honeypot — bots fill it in, humans never see it. */
  company?: unknown;
};

const asText = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Silently accept spam so bots get no feedback.
  if (asText(body.company, 100)) return NextResponse.json({ ok: true });

  const name = asText(body.name, 100);
  const email = asText(body.email, 200);
  const phone = asText(body.phone, 40);
  const message = asText(body.message, 4000);

  if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please fill in your name, a valid email and a message." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;

  // Without an email provider configured the message is only logged on the server.
  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY is not set — message not delivered:", { name, email, phone, message });
    return NextResponse.json({ ok: true, delivered: false });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "Soulful Smell <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO_EMAIL ?? contact.email],
      reply_to: email,
      subject: `New enquiry from ${name}`,
      text: [`Name: ${name}`, `Email: ${email}`, `Phone: ${phone || "—"}`, "", message].join("\n"),
    }),
  });

  if (!response.ok) {
    console.error("[contact] Resend rejected the message:", response.status, await response.text());
    return NextResponse.json({ error: "We could not send your message. Please email us directly." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, delivered: true });
}
