import type { Metadata } from "next";
import Image from "next/image";
import { MoonStar } from "lucide-react";
import { AttarCollection } from "@/components/shop/AttarCollection";
import { CategoryTabs } from "@/components/shop/CategoryTabs";
import { Container } from "@/components/ui/Container";
import { HERO_SIZES, PAGE_HEROES } from "@/data/pageImages";

export const metadata: Metadata = {
  title: "Attars",
  description: "Pure oils, real stories — traditional Soulful Smell attars for a calmer you.",
};

export default function AttarsPage() {
  return (
    <>
      {/* Dark strip under the fixed navbar, so its links stay readable above the bright artwork */}
      <section aria-label="Attars" className="bg-ink-950 pt-20 lg:pt-24">
        <h1 className="sr-only">Attars — pure oils, real stories</h1>
        <div className="relative mx-auto aspect-[1672/828] max-h-[560px] min-h-[240px] w-full max-w-[1900px] overflow-hidden">
          <Image
            src={PAGE_HEROES.attars}
            alt="Attars — simple scents, deeper meanings. Pure oils, real stories."
            fill
            priority
            sizes={HERO_SIZES}
            className="object-cover object-[38%_50%]"
          />
        </div>
      </section>

      {/* The attar collection keeps the pale palette of the artwork */}
      <section aria-label="Attars collection" className="bg-sage-100">
        <Container className="py-12 lg:py-16">
          <div className="mb-10 border-b border-navy-900/15">
            <CategoryTabs active="attar" tone="light" />
          </div>

          <AttarCollection />

          {/* Closing strip */}
          <div className="mt-16 flex flex-col items-center gap-6 border-t border-navy-900/15 pt-10 md:flex-row md:justify-between md:gap-8">
            <p className="text-[11px] uppercase tracking-[0.3em] text-navy-900 sm:text-xs">
              Scents for a calmer world.
            </p>

            <div className="flex flex-1 items-center justify-center gap-5">
              <span aria-hidden className="hidden h-px max-w-32 flex-1 bg-navy-900/25 md:block" />
              <span className="flex flex-col items-center gap-2">
                <MoonStar aria-hidden className="size-6 text-navy-900" strokeWidth={1.3} />
                <span className="text-[11px] uppercase tracking-[0.3em] text-navy-900">Souls meet in scent</span>
              </span>
              <span aria-hidden className="hidden h-px max-w-32 flex-1 bg-navy-900/25 md:block" />
            </div>

            <p className="font-script text-3xl text-navy-900 sm:text-4xl">Breathe Deeper</p>
          </div>
        </Container>
      </section>
    </>
  );
}
