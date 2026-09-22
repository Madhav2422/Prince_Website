import type { Metadata } from "next";
import Image from "next/image";
import { Customizer } from "@/components/customize/Customizer";
import { Container } from "@/components/ui/Container";
import { SLOT_COUNT, SLOT_ML, TOTAL_ML } from "@/data/customize";

export const metadata: Metadata = {
  title: "Customize Your Perfume",
  description: `Build your own ${TOTAL_ML} ml Soulful Smell bottle from ${SLOT_COUNT} layers of ${SLOT_ML} ml, engraved with your name.`,
};

export default function CustomizePage() {
  return (
    <>
      <section aria-label="Customize" className="relative isolate overflow-hidden bg-ink-950">
        <Image
          src="/images/Hero_image_3.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[55%_45%]"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-ink-950/82" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ink-900 via-transparent to-ink-950/70" />

        <Container className="relative flex min-h-[320px] items-end pb-14 pt-32 lg:min-h-[380px] lg:pt-40">
          <div className="mx-auto text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.45em] text-mist sm:text-xs">
              Six scents · One bottle
            </p>
            <h1 className="mt-4 font-serif text-[clamp(2.75rem,6.5vw,5.5rem)] font-semibold uppercase leading-none tracking-[0.12em] text-cream">
              Customize <span className="text-gold-500">Your Perfume</span>
            </h1>
            <p className="mt-5 font-serif text-2xl italic tracking-wide text-cream/90 sm:text-3xl">
              It&apos;s not about the smell — it&apos;s about the <span className="text-gold-400">aura</span>.
            </p>
            <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.4em] text-smoke sm:text-xs">
              Layer it · Name it · Wear it
            </p>
          </div>
        </Container>
      </section>

      <section aria-label="Build your bottle" className="bg-ink-900">
        <Container className="py-16 lg:py-24">
          <Customizer />
        </Container>
      </section>
    </>
  );
}
