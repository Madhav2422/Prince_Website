"use client";

import { useEffect, useRef } from "react";

const FPS = 25;
const pad = (n: number) => String(n).padStart(2, "0");

/** Running HH:MM:SS:FF timecode, like the display on a recording camera. */
export function Timecode({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let start: number | undefined;
    let last = -1;
    const tick = (now: number) => {
      start ??= now;
      const total = Math.floor(((now - start) / 1000) * FPS);
      // Written straight to the DOM so the clock never re-renders React.
      if (total !== last) {
        last = total;
        const seconds = Math.floor(total / FPS);
        el.textContent = `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}:${pad(total % FPS)}`;
      }
      frame = requestAnimationFrame(tick);
    };
    // Only ticks while on screen, so it costs nothing while you scroll the rest of the page.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !frame) frame = requestAnimationFrame(tick);
      if (!entry.isIntersecting && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      00:00:00:00
    </span>
  );
}
