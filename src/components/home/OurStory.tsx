import Image from "next/image";
import type { CSSProperties } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";

export function OurStory() {
  return (
    <section aria-labelledby="our-story-heading" className="relative isolate overflow-hidden bg-ink-950">
      <Image
        src="/images/About_Us_bg_image.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover object-[65%_50%] grayscale-[35%]"
      />
      {/* Darken the photo: heavy behind the copy on the left, lighter toward the quote */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(16,16,16,0.92)_0%,rgba(16,16,16,0.8)_35%,rgba(16,16,16,0.45)_62%,rgba(16,16,16,0.6)_100%)]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-ink-950/40 via-transparent to-ink-950/50" />

      <Container className="grid items-center gap-14 py-20 lg:grid-cols-[1fr_auto] lg:py-28">
        <div className="max-w-xl">
          <Reveal as="p" variant="left" className="text-xs font-medium uppercase tracking-[0.4em] text-gold-500">
            Our Story
          </Reveal>
          <Reveal
            as="h2"
            variant="left"
            delay={0.12}
            id="our-story-heading"
            className="mt-5 font-serif text-[clamp(2.75rem,5vw,4.5rem)] font-semibold uppercase leading-[0.98] text-cream"
          >
            Scents
            <br />
            With A <span className="text-gold-500">Soul</span>
          </Reveal>
          <Reveal as="p" variant="left" delay={0.24} className="mt-6 max-w-[30rem] text-[15px] leading-[1.8] text-mist sm:text-base">
            Soulful Smell was born from a simple belief — fragrances can do more than just smell good, they can carry
            memories, boost confidence and be a part of your story.
          </Reveal>
          <Reveal variant="left" delay={0.36}>
            <ButtonLink href="/about" className="mt-9">
              Our Story
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal as="figure" variant="right" delay={0.3} className="lg:mr-8 xl:mr-16">
          <span aria-hidden className="block font-serif text-7xl font-bold leading-none text-gold-500">
            ”
          </span>
          <blockquote className="-mt-4 text-sm font-medium uppercase leading-[2.6] tracking-[0.3em] text-cream">
            A fragrance
            <br />
            for every chapter
            <br />
            of you
          </blockquote>
          <span aria-hidden className="reveal-line mt-6 block h-px w-14 bg-gold-500" style={{ "--d": "0.9s" } as CSSProperties} />
        </Reveal>
      </Container>
    </section>
  );
}
