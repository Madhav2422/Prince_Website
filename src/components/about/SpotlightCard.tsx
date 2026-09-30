"use client";

import Link from "next/link";
import type { PointerEvent, ReactNode } from "react";

/** A link card lit by a soft glow that follows the cursor. */
export function SpotlightCard({ href, className = "", children }: { href: string; className?: string; children: ReactNode }) {
  const onPointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--y", `${event.clientY - rect.top}px`);
  };

  return (
    <Link href={href} onPointerMove={onPointerMove} className={`about-spotlight group relative block overflow-hidden ${className}`}>
      {children}
    </Link>
  );
}
