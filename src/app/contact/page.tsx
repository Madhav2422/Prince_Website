import type { Metadata } from "next";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/brand/InstagramIcon";
import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { contact } from "@/data/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Soulful Smell — call, email or message us about our fragrances.",
};

const details = [
  { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
  { icon: Phone, label: "Phone", value: contact.phone.display, href: contact.phone.href },
  { icon: InstagramIcon, label: "Instagram", value: contact.instagram.handle, href: contact.instagram.href },
];

export default function ContactPage() {
  return (
    <>
      <section aria-label="Contact" className="relative isolate overflow-hidden bg-ink-950">
        <Image
          src="/images/About_Us_bg_image.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[55%_45%]"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-ink-950/80" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ink-900 via-transparent to-ink-950/70" />

        <Container className="relative flex min-h-[340px] items-end pb-14 pt-32 lg:min-h-[400px] lg:pt-40">
          <div className="mx-auto text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.45em] text-mist sm:text-xs">
              We would love to hear from you
            </p>
            <h1 className="mt-4 font-serif text-[clamp(3rem,7vw,5.5rem)] font-semibold uppercase leading-none tracking-[0.2em] text-gold-300">
              Contact
            </h1>
            <p className="mt-3 font-serif text-2xl italic tracking-wide text-cream/90 sm:text-3xl">Say Hello</p>
          </div>
        </Container>
      </section>

      <section aria-label="Get in touch" className="bg-ink-900">
        <Container className="grid gap-14 py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:py-24">
          <Reveal variant="left">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-gold-500">Send a message</p>
            <h2 className="mt-4 font-serif text-[clamp(2.25rem,4vw,3.25rem)] font-semibold uppercase leading-tight text-cream">
              Let&apos;s Talk <span className="text-gold-500">Scents</span>
            </h2>
            <p className="mt-4 max-w-[34rem] text-[15px] leading-[1.8] text-mist">
              Questions about a fragrance, bulk orders or a collaboration? Fill in the form and we will get back to you.
            </p>
            <div className="mt-9">
              <ContactForm />
            </div>
          </Reveal>

          <Reveal variant="right" delay={0.15}>
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-gold-500">Reach us directly</p>
            <ul className="mt-6 space-y-5">
              {details.map(({ icon: Icon, label, value, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
                    className="group flex items-center gap-4 border border-ink-600/70 bg-ink-950/50 px-5 py-4 transition-colors duration-300 hover:border-gold-500/60"
                  >
                    <Icon aria-hidden className="size-6 shrink-0 text-gold-500" strokeWidth={1.4} />
                    <span>
                      <span className="block text-[11px] uppercase tracking-[0.25em] text-smoke">{label}</span>
                      <span className="mt-1 block text-sm text-cream transition-colors group-hover:text-gold-400">
                        {value}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <a
              href={contact.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-mist transition-colors hover:text-gold-500"
            >
              <MapPin aria-hidden className="size-4" strokeWidth={1.5} />
              Get directions
            </a>
          </Reveal>
        </Container>
      </section>

      <section aria-label="Our location" className="border-t border-ink-700 bg-ink-950">
        <iframe
          src={contact.mapEmbedSrc}
          title="Soulful Smell on Google Maps"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="block h-[380px] w-full border-0 grayscale-[35%] lg:h-[460px]"
        />
      </section>
    </>
  );
}
