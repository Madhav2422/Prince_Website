import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { features } from "@/data/home";

export function Features() {
  return (
    <section aria-label="Why Soulful Smell" className="border-y border-ink-700 bg-ink-800">
      <Container>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }, i) => (
            <Reveal
              as="li"
              key={title}
              delay={i * 0.12}
              className="relative flex items-center gap-4 py-5 max-sm:not-last:border-b max-sm:border-ink-700 lg:py-8 lg:pl-10 lg:first:pl-0 lg:not-first:before:absolute lg:not-first:before:left-0 lg:not-first:before:top-1/2 lg:not-first:before:h-11 lg:not-first:before:w-px lg:not-first:before:-translate-y-1/2 lg:not-first:before:bg-ink-600"
            >
              <Icon aria-hidden className="size-9 shrink-0 text-gold-500" strokeWidth={1.25} />
              <div>
                <h2 className="text-[13px] font-semibold text-cream lg:text-sm">{title}</h2>
                <p className="mt-1 text-xs text-smoke lg:text-[13px]">{text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
