"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type HTMLAttributes } from "react";

type RevealProps = HTMLAttributes<HTMLElement> & {
  /** Direction the element travels in from. `wipe` opens from the centre outward. */
  variant?: "up" | "left" | "right" | "scale" | "wipe";
  /** Delay in seconds — use it to stagger siblings. */
  delay?: number;
  as?: ElementType;
};

/** Reveals its children the first time they scroll into view. Styles live in globals.css (`.reveal`). */
export function Reveal({ variant = "up", delay = 0, as: Tag = "div", className = "", style, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
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
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ "--d": `${delay}s`, ...style } as CSSProperties}
      className={`reveal reveal-${variant} ${visible ? "is-visible" : ""} ${className}`}
      {...rest}
    />
  );
}
