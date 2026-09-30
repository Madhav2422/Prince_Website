import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clapperboard, FlaskConical, MoonStar } from "lucide-react";
import { AuraField } from "@/components/about/AuraField";
import { CountUp } from "@/components/about/CountUp";
import { HorizontalReel } from "@/components/about/HorizontalReel";
import { NotesPyramid } from "@/components/about/NotesPyramid";
import { ScrollScene } from "@/components/about/ScrollScene";
import { SpotlightCard } from "@/components/about/SpotlightCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { scents, SLOT_COUNT, TOTAL_ML } from "@/data/customize";
import { byCategory, getProduct, type Product } from "@/data/products";
import { SCREENS_PATH } from "@/data/soulfulScreens";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Soulful Smell makes fragrances that carry memories — long-lasting eau de parfums, attars and bottles you blend yourself. It's not about the smell, it's about the aura.",
};

const eyebrow = "text-xs font-medium uppercase tracking-[0.4em] text-gold-500";
const heading = "font-serif text-[clamp(2.5rem,5vw,4.25rem)] font-semibold uppercase leading-[0.98] text-cream";

const MANIFESTO =
  "We believe a fragrance is a memory you can wear. It is the first thing people feel and the last thing they forget — a mood you carry, a story you leave behind, an aura that stays after you have left the room.";
const GOLD_WORDS = new Set(["memory", "feel", "forget", "aura"]);

const ACTS = [
  {
    act: "Act I",
    notes: "Top notes",
    title: "The first hello",
    text: "Bright and fleeting — what you notice in the first few minutes, before anything else.",
    examples: "Citrus · Fresh herbs · Fruit",
  },
  {
    act: "Act II",
    notes: "Heart notes",
    title: "The character",
    text: "As the opening fades, the heart unfolds and gives the scent its personality for hours.",
    examples: "Florals · Spices · Warmth",
  },
  {
    act: "Act III",
    notes: "Base notes",
    title: "What lingers",
    text: "The deep notes that settle on your skin and stay — the part people remember you by.",
    examples: "Woods · Musk · Amber · Oud",
  },
];

const REEL = ["strong-will", "dusk-musk", "the-writer", "deja-vu", "the-actor", "soulful-special", "jazz-club", "sailor", "noir"]
  .map(getProduct)
  .filter((product): product is Product => Boolean(product));

export default function AboutPage() {
  const words = MANIFESTO.split(" ");

  return (
    <>
      {/* 1 · Hero — the visitor's own aura follows the cursor */}
      <section aria-labelledby="about-title" className="relative isolate flex min-h-svh items-center overflow-hidden bg-ink-950">
        <AuraField followCursor />
        <Container className="pb-28 pt-32 text-center">
          <p className="hero-line text-[11px] font-medium uppercase tracking-[0.45em] text-mist sm:text-xs">
            <span>About Soulful Smell</span>
          </p>
          <h1 id="about-title" className="mt-7">
            <span
              className="hero-line block pb-1 font-serif text-[clamp(2.6rem,7vw,6.5rem)] font-semibold uppercase leading-[0.95] text-cream"
              style={{ "--d": "0.12s" } as CSSProperties}
            >
              <span>It&apos;s not about</span>
            </span>
            <span
              className="hero-line block pb-1 font-serif text-[clamp(2.6rem,7vw,6.5rem)] font-semibold uppercase leading-[0.95] text-cream"
              style={{ "--d": "0.24s" } as CSSProperties}
            >
              <span>the smell —</span>
            </span>
            <span
              className="hero-line block pb-3 pt-2 font-script text-[clamp(3rem,8vw,7.5rem)] leading-[1.1] text-gold-400"
              style={{ "--d": "0.42s" } as CSSProperties}
            >
              <span>it&apos;s about the aura.</span>
            </span>
          </h1>
          <p
            className="hero-line mx-auto mt-8 max-w-xl text-[15px] leading-[1.8] text-mist sm:text-base"
            style={{ "--d": "0.62s" } as CSSProperties}
          >
            <span>Fragrances that carry memories, boost confidence and become a part of your story.</span>
          </p>
        </Container>

        <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.4em] text-smoke">Scroll</span>
          <span aria-hidden className="about-scroll-cue relative block h-14 w-px overflow-hidden bg-ink-600" />
        </div>
      </section>

      {/* 2 · Manifesto — lights up word by word as you scroll */}
      <ScrollScene aria-labelledby="about-belief" progressTarget="[data-words]" className="relative h-[220vh] bg-ink-900">
        <div className="sticky top-0 flex h-svh items-center">
          <Container>
            <p id="about-belief" className={eyebrow}>
              What we believe
            </p>
            <p
              data-words
              className="mt-8 max-w-5xl font-serif text-[clamp(1.85rem,4.2vw,3.6rem)] font-medium leading-[1.22] text-cream"
              style={{ "--n": words.length } as CSSProperties}
            >
              {words.map((word, i) => (
                <span
                  key={i}
                  className={`about-word ${GOLD_WORDS.has(word.replace(/[^a-z]/gi, "").toLowerCase()) ? "italic text-gold-400" : ""}`}
                  style={{ "--i": i } as CSSProperties}
                >
                  {word}{" "}
                </span>
              ))}
            </p>
          </Container>
        </div>
      </ScrollScene>

      {/* 3 · Our story */}
      <ScrollScene
        mode="pass"
        aria-labelledby="about-story"
        progressTarget=".about-parallax"
        className="relative overflow-hidden bg-ink-950"
      >
        <Container className="grid items-center gap-14 py-24 lg:grid-cols-2 lg:gap-20 lg:py-32">
          <Reveal variant="scale" className="relative">
            <div className="relative aspect-[4/3] overflow-hidden border border-ink-700">
              <Image
                src="/images/About_Us_bg_image.jpg"
                alt="A filmmaker's desk at night: a camera, clapperboard and editing laptop beside a Soulful Smell bottle, perfumery vials and a sketchbook"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="about-parallax object-cover object-[65%_50%]"
              />
              <div aria-hidden className="absolute inset-0 bg-linear-to-t from-ink-950/60 via-transparent to-transparent" />
            </div>

            {/* Slowly turning badge */}
            <div className="absolute -bottom-10 -right-4 grid size-32 place-items-center rounded-full bg-ink-950 sm:-right-8 sm:size-36">
              <svg viewBox="0 0 120 120" aria-hidden className="about-spin absolute inset-0 size-full">
                <defs>
                  <path id="about-badge-path" d="M60 60 m -45 0 a 45 45 0 1 1 90 0 a 45 45 0 1 1 -90 0" />
                </defs>
                <text className="fill-cream text-[9.4px] font-medium uppercase tracking-[0.3em]">
                  <textPath href="#about-badge-path">Film • Fragrance • Feelings •</textPath>
                </text>
              </svg>
              <MoonStar aria-hidden className="size-7 text-gold-500" strokeWidth={1.3} />
            </div>
          </Reveal>

          <div>
            <Reveal as="p" variant="right" className={eyebrow}>
              Our Story
            </Reveal>
            <Reveal as="h2" variant="right" delay={0.12} id="about-story" className={`mt-5 ${heading}`}>
              Two Worlds,
              <br />
              One <span className="text-gold-500">Story</span>
            </Reveal>
            <Reveal variant="right" delay={0.24} className="mt-7 space-y-5 text-[15px] leading-[1.85] text-mist sm:text-base">
              <p>
                Soulful Smell was born from a simple belief — fragrances can do more than just smell good. They can carry
                memories, boost confidence and be a part of your story.
              </p>
              <p>
                It comes from the same place as our media house, SoulfulScreens — a love for capturing feelings. One
                tells stories in frames, the other in fragrance. Same places, different scents.
              </p>
              <p>
                So we make scents for every chapter of you: long-lasting eau de parfums, attars that hold a whole mood in
                a single drop, and a studio where you can blend a bottle that exists nowhere else.
              </p>
            </Reveal>
            <Reveal as="figure" variant="right" delay={0.36} className="mt-10 border-l-2 border-gold-500 pl-6">
              <blockquote className="font-serif text-2xl italic leading-snug text-cream sm:text-3xl">
                “A fragrance for every chapter of you.”
              </blockquote>
            </Reveal>
          </div>
        </Container>
      </ScrollScene>

      {/* 4 · In numbers */}
      <section aria-label="Soulful Smell in numbers" className="border-y border-ink-700 bg-ink-900">
        <Container>
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            {[
              { value: byCategory("perfume").length, label: "Signature perfumes" },
              { value: byCategory("attar").length, label: "Attars" },
              { value: scents.length, label: "Scents to layer" },
              { value: TOTAL_ML, suffix: " ml", label: "Bottle made by you" },
            ].map((stat, i) => (
              <Reveal
                key={stat.label}
                delay={i * 0.1}
                className={`flex flex-col-reverse items-center gap-2 py-10 text-center lg:py-14 ${
                  i % 2 === 1 ? "border-l border-ink-700" : ""
                } ${i >= 2 ? "border-t border-ink-700 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
              >
                <dt className="text-[11px] uppercase tracking-[0.3em] text-smoke">{stat.label}</dt>
                <dd className="font-serif text-[clamp(3rem,6vw,4.75rem)] font-semibold leading-none text-gold-500">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {/* 5 · Anatomy of a scent — the pyramid builds act by act */}
      <ScrollScene
        steps={3}
        aria-labelledby="about-acts"
        progressTarget=".about-progress"
        className="relative h-[300vh] bg-ink-950"
      >
        <div className="sticky top-0 flex h-svh items-center overflow-hidden pt-16">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_28%_55%,rgba(245,193,48,0.08),transparent_55%)]"
          />
          <Container className="relative grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
            <div className="lg:order-2">
              <p className={eyebrow}>The anatomy of a scent</p>
              <h2 id="about-acts" className={`mt-4 ${heading} text-[clamp(2rem,4.2vw,3.5rem)]`}>
                A Story In <span className="text-gold-500">Three Acts</span>
              </h2>

              <ol className="mt-6 space-y-3 sm:mt-9 sm:space-y-6">
                {ACTS.map((act, i) => (
                  <li key={act.act} data-note={i} className="about-note relative pl-6">
                    <span aria-hidden className="about-note-bar absolute inset-y-0 left-0 w-0.5 bg-gold-500" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-500 sm:text-[11px]">
                      {act.act} · {act.notes}
                    </p>
                    <h3 className="mt-1 font-serif text-xl text-cream sm:text-3xl">{act.title}</h3>
                    <p className="mt-1.5 hidden max-w-md text-sm leading-relaxed text-mist sm:block">{act.text}</p>
                    <p className="mt-1 text-[11px] tracking-wider text-smoke sm:mt-2">{act.examples}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-8 h-px w-full max-w-md bg-ink-700">
                <div className="about-progress h-full bg-gold-500" />
              </div>
            </div>

            <NotesPyramid className="mx-auto h-[30svh] w-auto max-w-full sm:h-[38svh] lg:order-1 lg:h-[62svh]" />
          </Container>
        </div>
      </ScrollScene>

      {/* 6 · The collection — scrolls sideways */}
      <HorizontalReel
        labelledBy="about-collection"
        className="bg-ink-900"
        header={
          <Container className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className={eyebrow}>The collection</p>
              <h2 id="about-collection" className={`mt-4 ${heading}`}>
                Every Mood, <span className="text-gold-500">Bottled</span>
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-smoke">
              From bright everyday freshness to deep oud after dark — find the one that sounds like you.
            </p>
          </Container>
        }
      >
        {REEL.map((product, i) => (
          <Link
            key={product.slug}
            href={product.category === "attar" ? "/shop/attars" : "/shop"}
            className={`group block w-[min(70vw,300px)] shrink-0 lg:w-[320px] ${i % 2 ? "lg:mt-12" : ""}`}
          >
            <div className="relative aspect-square overflow-hidden border border-ink-700 transition-colors duration-500 group-hover:border-gold-500/60">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="320px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-gold-500">
              {product.category === "attar" ? "Attar" : "Eau de parfum"}
            </p>
            <h3 className="mt-1 font-serif text-2xl uppercase tracking-[0.12em] text-cream">{product.name}</h3>
            <p className="mt-1 text-sm italic text-smoke">{product.tagline}</p>
          </Link>
        ))}
        <Link
          href="/shop"
          className="group flex aspect-square w-[min(70vw,300px)] shrink-0 flex-col items-center justify-center gap-5 border border-dashed border-gold-500/40 text-center transition-colors duration-500 hover:border-gold-500 lg:w-[320px]"
        >
          <span className="grid size-16 place-items-center rounded-full border border-gold-500 text-gold-500 transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-ink-950">
            <ArrowRight aria-hidden className="size-6 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
          <span className="font-serif text-2xl uppercase tracking-[0.12em] text-cream">See it all</span>
          <span className="text-[11px] uppercase tracking-[0.3em] text-smoke">Visit the shop</span>
        </Link>
      </HorizontalReel>

      {/* 7 · More than a fragrance house */}
      <section aria-labelledby="about-beyond" className="bg-ink-950">
        <Container className="py-24 lg:py-32">
          <Reveal className="text-center">
            <p className={eyebrow}>Beyond the bottle</p>
            <h2 id="about-beyond" className={`mt-4 ${heading}`}>
              More Than A <span className="text-gold-500">Fragrance House</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {[
              {
                href: "/customize",
                icon: FlaskConical,
                kicker: "Customize",
                title: "Blend your own aura",
                text: `Layer ${SLOT_COUNT} scents into one ${TOTAL_ML} ml bottle, then engrave your name on it. A fragrance that exists nowhere else.`,
                cta: "Start blending",
              },
              {
                href: SCREENS_PATH,
                icon: Clapperboard,
                kicker: "SoulfulScreens",
                title: "Our media house",
                text: "The same soul, a different medium — films, ad films, music videos, reels and photography.",
                cta: "Explore SoulfulScreens",
              },
            ].map(({ icon: Icon, ...card }, i) => (
              <Reveal key={card.href} variant={i ? "right" : "left"} delay={i * 0.12}>
                <SpotlightCard
                  href={card.href}
                  className="h-full border border-ink-700 bg-ink-900/60 p-8 transition-colors duration-500 hover:border-gold-500/50 sm:p-10"
                >
                  <Icon
                    aria-hidden
                    className="size-10 text-gold-500 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-6deg]"
                    strokeWidth={1.2}
                  />
                  <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">{card.kicker}</p>
                  <h3 className="mt-2 font-serif text-3xl text-cream sm:text-4xl">{card.title}</h3>
                  <p className="mt-4 max-w-md text-[15px] leading-[1.8] text-mist">{card.text}</p>
                  <span className="mt-8 inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-gold-400">
                    {card.cta}
                    <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 8 · Closing */}
      <section aria-labelledby="about-closing" className="relative isolate overflow-hidden bg-black">
        <AuraField motes={false} />
        <Container className="py-28 text-center lg:py-40">
          <Reveal>
            <p className="font-script text-4xl text-gold-400 sm:text-5xl">Good scents, brighter days.</p>
            <h2
              id="about-closing"
              className="mt-5 font-serif text-[clamp(3rem,8vw,7rem)] font-semibold uppercase leading-[0.92] text-cream"
            >
              Find Your <span className="text-gold-500">Aura</span>
            </h2>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <ButtonLink href="/shop">Shop the collection</ButtonLink>
              <ButtonLink href="/customize" variant="outline">
                Create your own
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
