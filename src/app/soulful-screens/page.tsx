import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, Play } from "lucide-react";
import { InstagramIcon } from "@/components/brand/InstagramIcon";
import { FilmStrip } from "@/components/screens/FilmStrip";
import { Viewfinder } from "@/components/screens/Viewfinder";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { contact } from "@/data/contact";
import { pageMetadata } from "@/lib/seo";
import {
  screensProcess,
  screensReel,
  screensServices,
  screensShowreel,
  screensWhatsApp,
} from "@/data/soulfulScreens";

export const metadata: Metadata = pageMetadata({
  title: "SoulfulScreens",
  description:
    "SoulfulScreens is the media house from the makers of Soulful Smell — films, ad films, music videos, reels and photography.",
  path: "/soulful-screens",
});

const eyebrow = "text-xs font-medium uppercase tracking-[0.4em] text-gold-500";
const heading = "mt-4 font-serif text-[clamp(2.5rem,5vw,4rem)] font-semibold uppercase leading-[0.98] text-cream";

const reach = [
  { icon: InstagramIcon, label: contact.instagram.handle, href: contact.instagram.href },
  { icon: Mail, label: contact.email, href: `mailto:${contact.email}` },
  { icon: Phone, label: contact.phone.display, href: contact.phone.href },
];

export default function SoulfulScreensPage() {
  return (
    <>
      {/* Hero */}
      <section aria-labelledby="screens-title" className="relative isolate overflow-hidden bg-black">
        <div aria-hidden className="ss-beam absolute -inset-x-1/2 -bottom-[60%] top-0 -z-10" />
        <div aria-hidden className="ss-grain pointer-events-none absolute -inset-[10%] -z-10 opacity-[0.07]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ink-900 via-transparent to-transparent" />

        <Container className="pb-14 pt-24 lg:pb-20 lg:pt-32">
          <Viewfinder className="flex min-h-[460px] items-center justify-center px-4 py-20 sm:min-h-[520px] lg:min-h-[580px]">
            <div className="text-center">
              <p className="hero-line text-[11px] font-medium uppercase tracking-[0.3em] text-mist sm:text-xs sm:tracking-[0.45em]">
                <span>A Soulful Smell media house</span>
              </p>
              <h1
                id="screens-title"
                className="mt-5 font-serif text-[clamp(3.25rem,11vw,8.5rem)] font-semibold uppercase leading-[0.9] tracking-[0.06em]"
              >
                <span className="hero-line block pb-1 text-cream" style={{ "--d": "0.12s" } as CSSProperties}>
                  <span>Soulful</span>
                </span>
                <span className="hero-line block pb-1 text-gold-500" style={{ "--d": "0.26s" } as CSSProperties}>
                  <span>Screens</span>
                </span>
              </h1>
              <p
                className="hero-line mt-5 font-serif text-2xl italic tracking-wide text-cream/90 sm:text-3xl"
                style={{ "--d": "0.45s" } as CSSProperties}
              >
                <span>Stories you can feel.</span>
              </p>
              <div className="hero-line mt-10 pb-1" style={{ "--d": "0.6s" } as CSSProperties}>
                <span className="flex flex-wrap justify-center gap-4">
                  <ButtonLink href={screensWhatsApp}>Start a project</ButtonLink>
                  <ButtonLink href="#showreel" variant="outline">
                    Watch the reel
                  </ButtonLink>
                </span>
              </div>
            </div>
          </Viewfinder>
        </Container>
      </section>

      <FilmStrip items={screensReel} />

      {/* About */}
      <section aria-labelledby="screens-about" className="bg-ink-900">
        <Container className="grid gap-10 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
          <Reveal variant="left">
            <p className={eyebrow}>Who we are</p>
            <h2 id="screens-about" className={heading}>
              Behind every frame,
              <br />
              <span className="text-gold-500">a feeling</span>
            </h2>
          </Reveal>
          <Reveal variant="right" delay={0.15} className="space-y-5 text-[15px] leading-[1.85] text-mist sm:text-base">
            <p>
              SoulfulScreens is the media house from the makers of Soulful Smell. Where Soulful Smell puts a mood into a
              bottle, SoulfulScreens puts it on screen.
            </p>
            <p>
              From the first idea to the final cut — story, script, shoot, edit, colour and sound — we craft films and
              content that people don&apos;t just watch, they feel. Maybe that&apos;s why our fragrances carry names like{" "}
              <Link href="/shop" className="text-cream underline decoration-gold-500/60 underline-offset-4 hover:text-gold-400">
                The Writer, The Actor and The Director
              </Link>
              .
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Services */}
      <section aria-labelledby="screens-services" className="bg-ink-950">
        <Container className="py-20 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal variant="left">
              <p className={eyebrow}>What we make</p>
              <h2 id="screens-services" className={heading}>
                Our <span className="text-gold-500">Services</span>
              </h2>
            </Reveal>
            <Reveal as="p" variant="right" delay={0.1} className="max-w-sm text-sm leading-relaxed text-smoke">
              One team from idea to screen, so your story keeps its soul all the way through.
            </Reveal>
          </div>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {screensServices.map(({ icon: Icon, title, text }, i) => (
              <Reveal
                as="li"
                key={title}
                delay={(i % 3) * 0.1}
                className="group relative overflow-hidden border border-ink-700 bg-ink-900/60 p-7 transition-colors duration-500 hover:border-gold-500/50 sm:p-8"
              >
                <div className="flex items-start justify-between">
                  <Icon
                    aria-hidden
                    className="size-9 text-gold-500 transition-transform duration-500 group-hover:-translate-y-1"
                    strokeWidth={1.25}
                  />
                  <span className="font-serif text-lg text-ink-500">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-7 text-sm font-semibold uppercase tracking-[0.25em] text-cream">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-smoke">{text}</p>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gold-500 transition-transform duration-500 group-hover:scale-x-100"
                />
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* Process */}
      <section aria-labelledby="screens-process" className="bg-ink-900">
        <Container className="py-20 lg:py-28">
          <Reveal variant="left">
            <p className={eyebrow}>How we work</p>
            <h2 id="screens-process" className={heading}>
              From Idea <span className="text-gold-500">To Screen</span>
            </h2>
          </Reveal>

          <ol className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {screensProcess.map((step, i) => (
              <Reveal as="li" key={step.scene} delay={i * 0.12} className="relative pt-4">
                {/* Clapperboard stick — snaps shut when the card appears */}
                <div
                  aria-hidden
                  className="ss-clap absolute inset-x-0 top-0 h-4 border border-ink-600 bg-[repeating-linear-gradient(120deg,var(--color-cream)_0_12px,var(--color-ink-950)_12px_24px)]"
                />
                <div className="border border-ink-600 bg-ink-950/70 p-6">
                  <p className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-smoke">
                    <span>Scene</span>
                    <span>Take 1</span>
                  </p>
                  <p className="mt-2 font-serif text-5xl font-semibold text-gold-500">{step.scene}</p>
                  <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.25em] text-cream">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-smoke">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Showreel */}
      <section id="showreel" aria-labelledby="screens-reel" className="scroll-mt-20 bg-black">
        <Container className="py-20 lg:py-28">
          <Reveal className="text-center">
            <p className={eyebrow}>Showreel</p>
            <h2 id="screens-reel" className={heading}>
              Watch Our <span className="text-gold-500">Work</span>
            </h2>
          </Reveal>

          <Reveal variant="scale" delay={0.15} className="mx-auto mt-12 max-w-5xl">
            <Viewfinder
              className={`overflow-hidden border border-ink-600/70 bg-[radial-gradient(ellipse_at_center,#262626,#0b0b0b_72%)] ${
                // The placeholder needs a taller frame on phones; a real video stays 16:9.
                screensShowreel.youtubeId ? "aspect-video" : "aspect-[4/3] sm:aspect-video"
              }`}
            >
              {screensShowreel.youtubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${screensShowreel.youtubeId}?rel=0`}
                  title="SoulfulScreens showreel"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 size-full"
                />
              ) : (
                <>
                  <div aria-hidden className="ss-grain pointer-events-none absolute -inset-[10%] opacity-[0.08]" />
                  <a
                    href={contact.instagram.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center"
                  >
                    <span className="ss-pulse relative grid size-16 place-items-center rounded-full border border-gold-500/80 text-gold-500 transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-ink-950 sm:size-24">
                      <Play aria-hidden className="ml-1 size-6 fill-current sm:size-9" strokeWidth={1.5} />
                    </span>
                    <span className="font-serif text-2xl italic text-cream sm:text-4xl">Our showreel is coming soon</span>
                    <span className="text-[11px] uppercase tracking-[0.3em] text-smoke transition-colors group-hover:text-gold-400">
                      Watch our latest work on Instagram
                    </span>
                  </a>
                </>
              )}
            </Viewfinder>
          </Reveal>
        </Container>
      </section>

      {/* Call to action */}
      <section aria-labelledby="screens-cta" className="relative isolate overflow-hidden bg-ink-950">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(245,193,48,0.12),transparent_60%)]"
        />
        <Container className="py-20 text-center lg:py-28">
          <Reveal>
            <p className="font-script text-4xl text-gold-400 sm:text-5xl">Have a story to tell?</p>
            <h2
              id="screens-cta"
              className="mt-4 font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-semibold uppercase leading-none text-cream"
            >
              Let&apos;s Make It <span className="text-gold-500">Together</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.8] text-mist">
              A brand film, a music video or a reel series — tell us your idea and we&apos;ll get back to you with how we can
              bring it to the screen.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <ButtonLink href={screensWhatsApp}>Chat on WhatsApp</ButtonLink>
              <ButtonLink href={`mailto:${contact.email}`} variant="outline">
                Email us
              </ButtonLink>
            </div>
          </Reveal>

          <ul className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4">
            {reach.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
                  className="inline-flex items-center gap-2.5 text-sm text-smoke transition-colors hover:text-gold-400"
                >
                  <Icon aria-hidden className="size-4.5 text-gold-500" strokeWidth={1.5} />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
