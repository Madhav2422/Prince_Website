"use client";

import { useEffect, useRef } from "react";

const FPS = 25;
const pad = (n: number) => String(n).padStart(2, "0");

/** Running HH:MM:SS:FF timecode, like the display on a recording camera. */
export function Timecode({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let start: number | undefined;
    let last = -1;
    const tick = (now: number) => {
      start ??= now;
      const total = Math.floor(((now - start) / 1000) * FPS);
      // Written straight to the DOM so the clock never re-renders React.
      if (total !== last && ref.current) {
        last = total;
        const seconds = Math.floor(total / FPS);
        ref.current.textContent = `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}:${pad(total % FPS)}`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      00:00:00:00
    </span>
  );
}
