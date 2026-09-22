"use client";

import { useEffect, useRef, useState } from "react";
import { BottleVisual, type BottleLayer } from "@/components/customize/BottleVisual";

/** A sample blend — one layer of each, so the preview shows off the range of colours. */
const SAMPLE = ["jazz-club", "velvet-berry", "the-writer", "evoque", "strong-will", "miraah"];

/** The Customize bottle as a showcase: it stays empty until scrolled into view, then fills layer by layer. */
export function TeaserBottle() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const layers: BottleLayer[] = visible ? SAMPLE.map((slug, i) => ({ key: i, slug, delay: i * 320 })) : [];

  return (
    <div ref={ref} className="mx-auto h-[380px] w-full max-w-[300px] sm:h-[440px]">
      <BottleVisual layers={layers} pours={[]} cap="idle" openCount={0} engraving="Your Name" />
    </div>
  );
}
