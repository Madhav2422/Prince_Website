"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";

type ScrollSceneProps = ComponentPropsWithoutRef<"section"> & {
  /**
   * `pin` — a tall section with sticky content: 0 when its top reaches the top of the screen, 1 when its bottom
   * reaches the bottom. `pass` — any section: 0 as it enters from below, 1 as it leaves at the top.
   */
  mode?: "pin" | "pass";
  /** When set, `data-step` holds the current step (0 … steps − 1) so CSS can switch states. */
  steps?: number;
  /**
   * Selector for the elements that read `--progress`. Setting it on just those (rather than the whole section) keeps
   * each scrolled frame to a restyle of a few elements instead of everything inside the section.
   */
  progressTarget?: string;
};

/** Exposes how far the section has scrolled as the CSS variable `--progress` (0 → 1). */
export function ScrollScene({ mode = "pin", steps, progressTarget, ...rest }: ScrollSceneProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = progressTarget ? [...el.querySelectorAll<HTMLElement>(progressTarget)] : [el];
    let frame = 0;
    let last = "";
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const screen = window.innerHeight;
      const raw = mode === "pin" ? -rect.top / Math.max(1, rect.height - screen) : (screen - rect.top) / (screen + rect.height);
      const progress = Math.min(1, Math.max(0, raw));
      // Written straight to the DOM, and only when it changes: scrolling never re-renders React.
      const value = progress.toFixed(4);
      if (value !== last) {
        last = value;
        targets.forEach((target) => target.style.setProperty("--progress", value));
      }
      if (steps) {
        const step = String(Math.min(steps - 1, Math.floor(progress * steps)));
        if (el.dataset.step !== step) el.dataset.step = step;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [mode, steps, progressTarget]);

  return <section ref={ref} data-step={steps ? 0 : undefined} {...rest} />;
}
