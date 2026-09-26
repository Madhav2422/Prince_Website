import Link from "next/link";
import { Play } from "lucide-react";
import { FilmStrip } from "@/components/screens/FilmStrip";
import { Viewfinder } from "@/components/screens/Viewfinder";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SCREENS_PATH, screensReel } from "@/data/soulfulScreens";

/** Introduces SoulfulScreens, the media house, and sends visitors to its page. */
export function SoulfulScreensTeaser() {
  return (
    <section aria-labelledby="screens-teaser-heading" className="relative isolate overflow-hidden bg-ink-950">
      <FilmStrip items={screensReel} />

      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_55%,rgba(245,193,48,0.1),transparent_60%)]"
      />

      <Container className="grid items-center gap-12 py-20 lg:grid-cols-[1fr_minmax(0,580px)] lg:gap-16 lg:py-28">
        <div className="max-w-xl">
          <Reveal as="p" variant="left" className="text-xs font-medium uppercase tracking-[0.4em] text-gold-500">
            Our media house
          </Reveal>
          <Reveal
            as="h2"
            variant="left"
            delay={0.12}
            id="screens-teaser-heading"
            className="mt-5 font-serif text-[clamp(2.75rem,5vw,4.5rem)] font-semibold uppercase leading-[0.98] text-cream"
          >
            Soulful
            <br />
            <span className="text-gold-500">Screens</span>
          </Reveal>
          <Reveal
            as="p"
            variant="left"
            delay={0.24}
            className="mt-6 max-w-[30rem] text-[15px] leading-[1.8] text-mist sm:text-base"
          >
            The same soul, a different medium. SoulfulScreens is our media house — we tell stories through film, video
            and photography with the same care we put into every bottle.
          </Reveal>
          <Reveal variant="left" delay={0.36}>
            <ButtonLink href={SCREENS_PATH} className="mt-10">
              Explore SoulfulScreens
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal variant="scale" delay={0.2}>
          {/* Same destination as the button, so it stays out of the tab order */}
          <Link href={SCREENS_PATH} tabIndex={-1} aria-hidden className="group block">
            <Viewfinder className="aspect-[4/3] overflow-hidden sm:aspect-video border border-ink-600/70 bg-[radial-gradient(ellipse_at_center,#262626,#0b0b0b_72%)]">
              <div aria-hidden className="ss-grain pointer-events-none absolute -inset-[10%] opacity-[0.08]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center">
                <span className="ss-pulse relative grid size-16 place-items-center rounded-full border border-gold-500/80 text-gold-500 transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-ink-950 sm:size-20">
                  <Play className="ml-1 size-6 fill-current sm:size-7" strokeWidth={1.5} />
                </span>
                <p className="font-serif text-2xl italic tracking-wide text-cream sm:text-3xl">
                  Lights. Camera. <span className="text-gold-400">Soul.</span>
                </p>
              </div>
            </Viewfinder>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
