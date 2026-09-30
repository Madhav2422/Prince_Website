"use client";

import { useEffect, useRef, type ReactNode } from "react";

type HorizontalReelProps = {
  /** Heading area pinned above the moving track. */
  header: ReactNode;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
};

/**
 * Pins itself to the screen and turns vertical scrolling into sideways movement of its track.
 * The section is made exactly tall enough for the track to travel its full width.
 * With reduced motion it falls back to a plain horizontally scrollable row.
 */
export function HorizontalReel({ header, children, className = "", labelledBy }: HorizontalReelProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const viewport = track?.parentElement;
    if (!section || !track || !viewport) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.dataset.static = "true";
      return;
    }

    let frame = 0;
    const measure = () => {
      const distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      section.style.setProperty("--distance", `${distance}px`);
      section.style.height = `${window.innerHeight + distance}px`;
    };
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)));
      section.style.setProperty("--progress", progress.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      schedule();
    };

    measure();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby={labelledBy} className={`relative ${className}`}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-16">
        {header}
        <div className="about-reel-viewport mt-10 lg:mt-14">
          <div ref={trackRef} className="about-reel-track flex w-max items-start gap-6 px-5 sm:gap-8 sm:px-8 lg:px-12">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
