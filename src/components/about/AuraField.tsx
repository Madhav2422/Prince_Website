"use client";

import { useEffect, useRef, type CSSProperties } from "react";

// Deterministic pseudo-random numbers (Park–Miller), so the server and the browser draw identical motes.
let seed = 11;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const MOTES = Array.from({ length: 22 }, () => ({
  left: (rand() * 100).toFixed(2),
  size: (1.5 + rand() * 2.5).toFixed(2),
  dur: (14 + rand() * 14).toFixed(2),
  delay: (-rand() * 28).toFixed(2),
  drift: ((rand() - 0.5) * 80).toFixed(1),
}));

const POOLS = [
  { className: "left-[2%] top-[4%] size-[55vmax]", color: "rgba(245,193,48,0.16)", dur: 26, delay: 0, dx: "8vw", dy: "6vh" },
  { className: "right-[-12%] top-[26%] size-[48vmax]", color: "rgba(214,120,30,0.14)", dur: 22, delay: -8, dx: "-10vw", dy: "-5vh" },
  { className: "bottom-[-30%] left-[26%] size-[60vmax]", color: "rgba(160,96,20,0.16)", dur: 30, delay: -14, dx: "6vw", dy: "-8vh" },
];

/**
 * Warm, slowly drifting light with specks of scent rising through it.
 * With `followCursor`, a soft glow trails the visitor's pointer — their own aura.
 * Place it as the first child of a `relative isolate overflow-hidden` section.
 */
export function AuraField({ followCursor = false, motes = true }: { followCursor?: boolean; motes?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const glow = glowRef.current;
    const host = root?.parentElement;
    if (!root || !glow || !host) return;

    let x = root.clientWidth / 2;
    let y = root.clientHeight / 2;
    let tx = x;
    let ty = y;
    let frame = 0;
    const paint = () => {
      glow.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    };
    paint();

    const canFollow =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canFollow) return;

    // Eases toward the pointer and stops the loop once it has caught up.
    const tick = () => {
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      paint();
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      tx = event.clientX - rect.left;
      ty = event.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    host.addEventListener("pointermove", onMove);
    return () => {
      host.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {POOLS.map((pool) => (
        <div
          key={pool.className}
          className={`about-aura ${pool.className}`}
          style={
            {
              background: `radial-gradient(circle, ${pool.color} 0%, transparent 65%)`,
              "--dur": `${pool.dur}s`,
              "--delay": `${pool.delay}s`,
              "--dx": pool.dx,
              "--dy": pool.dy,
            } as CSSProperties
          }
        />
      ))}

      <div
        ref={glowRef}
        className={`absolute left-0 top-0 -ml-72 -mt-72 size-144 rounded-full bg-[radial-gradient(circle,rgba(245,193,48,0.13),transparent_62%)] ${
          followCursor ? "" : "hidden"
        }`}
      />

      {motes &&
        MOTES.map((mote, i) => (
          <span
            key={i}
            className="about-mote"
            style={
              {
                left: `${mote.left}%`,
                width: `${mote.size}px`,
                height: `${mote.size}px`,
                "--dur": `${mote.dur}s`,
                "--delay": `${mote.delay}s`,
                "--drift": `${mote.drift}px`,
              } as CSSProperties
            }
          />
        ))}
    </div>
  );
}
