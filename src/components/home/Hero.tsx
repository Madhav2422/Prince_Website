"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { heroSlides } from "@/data/home";

const AUTOPLAY_MS = 6500;

const sideText = "text-[11px] font-medium uppercase leading-[2.4] tracking-[0.32em] text-mist lg:text-xs";

export function Hero() {
  const [active, setActive] = useState(0);
  // False until the first slide change, so only the initial entrance gets the short pause.
  const [entered, setEntered] = useState(false);

  const goTo = (i: number) => {
    setEntered(true);
    setActive(i);
  };

  // Restart the timer whenever the slide changes, so manual navigation gets a full interval.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => goTo((active + 1) % heroSlides.length), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [active]);

  const slide = heroSlides[active];

  return (
    <section
      aria-label="Featured"
      className="relative isolate flex flex-col overflow-hidden bg-[linear-gradient(100deg,#232323_0%,#1d1d1d_45%,#141414_100%)] lg:h-svh lg:min-h-[700px] lg:max-h-[900px]"
    >
      {/* Product photos: stacked under the copy on mobile, filling the right side on desktop */}
      <div className="relative h-[420px] w-full sm:h-[520px] max-lg:order-last max-lg:mask-[linear-gradient(to_bottom,transparent,black_18%)] lg:absolute lg:top-20 lg:bottom-0 lg:right-0 lg:-z-10 lg:h-auto lg:w-[78%] lg:[mask-composite:intersect] lg:[mask-image:linear-gradient(to_right,transparent,black_38%),linear-gradient(to_bottom,transparent,black_14%)]">
        {heroSlides.map((s, i) => (
          <Image
            key={s.image.src}
            src={s.image.src}
            alt={i === active ? s.image.alt : ""}
            aria-hidden={i !== active}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 78vw, 100vw"
            style={{ objectPosition: s.image.position }}
            className={`object-cover transition-opacity duration-[1400ms] ease-out ${
              i === active ? "ken-burns opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-ink-900/60 via-transparent to-ink-950/40" />
      </div>

      <Container className="relative flex flex-col pt-32 pb-4 lg:h-full lg:justify-center lg:pt-24 lg:pb-0">
        <div className="max-w-xl">
          {/* Each line rises out of its own clipped box, one after another (--d = delay) */}
          <div key={active} aria-live="polite" style={{ "--base": entered ? "0s" : "0.2s" } as CSSProperties}>
            <p className="hero-line text-[11px] font-medium uppercase tracking-[0.38em] text-mist sm:text-xs">
              <span>{slide.eyebrow}</span>
            </p>
            <h1 className="mt-5 font-serif text-[clamp(3.4rem,6.6vw,6.5rem)] font-bold uppercase leading-[0.92] tracking-[-0.005em]">
              <span className="hero-line block pb-1 text-cream" style={{ "--d": "0.15s" } as CSSProperties}>
                <span>{slide.title[0]}</span>
              </span>
              <span className="hero-line block pb-1 text-gold-500" style={{ "--d": "0.3s" } as CSSProperties}>
                <span>{slide.title[1]}</span>
              </span>
            </h1>
            <p
              className="hero-line mt-6 max-w-[27rem] text-[15px] leading-[1.75] text-mist sm:text-base"
              style={{ "--d": "0.5s" } as CSSProperties}
            >
              <span>{slide.description}</span>
            </p>
            <div className="hero-line mt-9 pb-1" style={{ "--d": "0.65s" } as CSSProperties}>
              <span>
                <ButtonLink href={slide.cta.href}>{slide.cta.label}</ButtonLink>
              </span>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-3 lg:mt-16">
            {heroSlides.map((s, i) => (
              <button
                key={s.eyebrow}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show slide ${i + 1} of ${heroSlides.length}`}
                aria-current={i === active}
                className="group py-3"
              >
                <span
                  className={`block h-0.5 w-9 transition-colors duration-500 ${
                    i === active ? "bg-gold-500" : "bg-ink-500 group-hover:bg-smoke"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div aria-hidden className="absolute right-5 top-[21%] hidden text-right sm:right-8 lg:right-12 xl:block">
          <p className={sideText}>
            Scents
            <br />
            Stories
            <br />
            People
          </p>
          <span className="ml-auto mt-6 block h-px w-10 bg-smoke/70" />
        </div>

        <p aria-hidden className={`${sideText} absolute bottom-[4%] right-5 hidden text-right sm:right-8 lg:right-12 xl:block`}>
          A
          <br />
          Better
          <br />
          You
        </p>
      </Container>
    </section>
  );
}
