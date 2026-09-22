import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SLOT_COUNT, SLOT_ML, TOTAL_ML } from "@/data/customize";
import { TeaserBottle } from "./TeaserBottle";

const steps = [
  { number: "01", title: "Choose", text: `Pick from our signature scents, ${SLOT_ML} ml at a time.` },
  { number: "02", title: "Layer", text: `Build ${SLOT_COUNT} layers into one ${TOTAL_ML} ml bottle.` },
  { number: "03", title: "Engrave", text: "Add your name to the label." },
];

export function CustomizeTeaser() {
  return (
    <section aria-labelledby="customize-teaser-heading" className="relative isolate overflow-hidden bg-ink-950">
      {/* Warm glow behind the bottle */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 -z-10 w-full bg-[radial-gradient(ellipse_at_72%_50%,rgba(245,193,48,0.12),transparent_55%)] lg:w-3/4"
      />

      <Container className="grid items-center gap-10 py-20 lg:grid-cols-[1fr_minmax(0,380px)] lg:gap-16 lg:py-24">
        <div className="max-w-xl">
          <Reveal as="p" variant="left" className="text-xs font-medium uppercase tracking-[0.4em] text-gold-500">
            Create your own
          </Reveal>
          <Reveal
            as="h2"
            variant="left"
            delay={0.12}
            id="customize-teaser-heading"
            className="mt-5 font-serif text-[clamp(2.75rem,5vw,4.5rem)] font-semibold uppercase leading-[0.98] text-cream"
          >
            Blend Your
            <br />
            Own <span className="text-gold-500">Aura</span>
          </Reveal>
          <Reveal as="p" variant="left" delay={0.24} className="mt-6 max-w-[30rem] text-[15px] leading-[1.8] text-mist sm:text-base">
            It&apos;s not about the smell — it&apos;s about the aura. Layer your favourite Soulful Smell fragrances into a
            bottle that exists nowhere else, and make it yours with your name.
          </Reveal>

          <Reveal as="ol" variant="left" delay={0.36} className="mt-9 grid gap-5 sm:grid-cols-3">
            {steps.map((step) => (
              <li key={step.number} className="border-t border-ink-600 pt-4">
                <span className="font-serif text-2xl text-gold-500">{step.number}</span>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-cream">{step.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-smoke">{step.text}</p>
              </li>
            ))}
          </Reveal>

          <Reveal variant="left" delay={0.48}>
            <ButtonLink href="/customize" className="mt-10">
              Customize Now
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal variant="scale" delay={0.2}>
          <TeaserBottle />
        </Reveal>
      </Container>
    </section>
  );
}
