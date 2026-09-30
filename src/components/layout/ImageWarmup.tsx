"use client";

import { getImageProps } from "next/image";
import { useEffect } from "react";
import type { PageImage } from "@/data/pageImages";

type Connection = { saveData?: boolean; effectiveType?: string };

let warmed = false;
// Held so the requests aren't dropped with the image objects before they finish.
const warming: HTMLImageElement[] = [];

/**
 * Once the current page has loaded and the browser is idle, quietly fetches the first photos of the other main pages,
 * so moving to one lands with its pictures already there instead of dark boxes that fill in a moment later.
 * Runs once per visit, and not at all with Data Saver on or on a very slow connection.
 */
export function ImageWarmup({ pages }: { pages: Record<string, PageImage[]> }) {
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    if (warmed || connection?.saveData || connection?.effectiveType?.includes("2g")) return;

    const here = window.location.pathname;
    const warm = () => {
      if (warmed) return;
      warmed = true;
      const seen = new Set<string>();
      for (const [path, images] of Object.entries(pages)) {
        if (path === here) continue;
        for (const { src, sizes } of images) {
          const { props } = getImageProps({ src, alt: "", fill: true, sizes });
          if (!props.srcSet || seen.has(props.srcSet)) continue;
          seen.add(props.srcSet);
          // Same srcset and sizes as the page's <img>, so the browser picks — and caches — the very same file.
          const img = new window.Image();
          img.decoding = "async";
          img.sizes = props.sizes ?? sizes;
          img.srcset = props.srcSet;
          img.src = props.src;
          warming.push(img);
        }
      }
    };

    let idle = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      if ("requestIdleCallback" in window) idle = requestIdleCallback(warm, { timeout: 4000 });
      else timer = setTimeout(warm, 1500);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (idle) cancelIdleCallback(idle);
      clearTimeout(timer);
    };
  }, [pages]);

  return null;
}
