"use client";

import { useEffect, useRef, useState } from "react";
import { BottleVisual, POUR_IMPACT_MS, type BottleLayer, type CapState } from "@/components/customize/BottleVisual";
import { SprayMist, SprayPump } from "./SprayPump";

/** A sample blend — one layer of each, so the preview shows off the range of colours. */
const SAMPLE = ["jazz-club", "velvet-berry", "the-writer", "evoque", "strong-will", "miraah"];
/** Already poured: a delay this far in the past skips the fill animation, so the bottle simply stands full. */
const LAYERS: BottleLayer[] = SAMPLE.map((slug, i) => ({ key: i, slug, delay: -(POUR_IMPACT_MS + 1000) }));

// The show, at an unhurried pace: the cap comes off, the pump sprays a few times, the cap goes back on.
const SPRAYS = 3;
const OPEN_AFTER_MS = 600; // lets the section finish sliding into view first
const CAP_OPENS_IN_MS = 1300; // keep in sync with `.teaser-bottle .cz-cap-open` in globals.css
const FIRST_SPRAY_MS = OPEN_AFTER_MS + CAP_OPENS_IN_MS + 400;
const SPRAY_EVERY_MS = 2000;
const CLOSE_AFTER_LAST_SPRAY_MS = 2800; // the cap comes back as the last mist thins out

/**
 * The Customize bottle as a showcase. When it scrolls into view the cap unscrews, the bottle sprays its mist straight
 * out of the page at you a few times, and the cap goes back on. It plays again if you leave and come back to it.
 */
export function TeaserBottle() {
  const ref = useRef<HTMLDivElement>(null);
  const [cap, setCap] = useState<CapState>("idle");
  const [openCount, setOpenCount] = useState(0);
  const [spray, setSpray] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let playing = false;
    let armed = true; // re-armed each time the bottle has scrolled fully out of view
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, run: () => void) => timers.push(setTimeout(run, ms));

    const play = () => {
      playing = true;
      at(OPEN_AFTER_MS, () => {
        setCap("open");
        setOpenCount((count) => count + 1);
      });
      for (let i = 0; i < SPRAYS; i++) at(FIRST_SPRAY_MS + i * SPRAY_EVERY_MS, () => setSpray((n) => n + 1));
      at(FIRST_SPRAY_MS + (SPRAYS - 1) * SPRAY_EVERY_MS + CLOSE_AFTER_LAST_SPRAY_MS, () => {
        setCap("closed");
        playing = false;
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio === 0) armed = true;
        if (entry.intersectionRatio >= 0.4 && armed && !playing) {
          armed = false;
          play();
        }
      },
      { threshold: [0, 0.4] },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    // Height comes from `.teaser-bottle` in globals.css, which also sizes the mist to match the bottle.
    <div ref={ref} className="teaser-bottle relative mx-auto w-full max-w-[300px]">
      <BottleVisual layers={LAYERS} pours={[]} cap={cap} openCount={openCount} engraving="Your Name">
        <SprayPump spray={spray} />
      </BottleVisual>
      <SprayMist spray={spray} />
    </div>
  );
}
