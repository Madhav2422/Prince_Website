import type { CSSProperties } from "react";

/*
 * The teaser bottle's spray: the pump hiding under its cap, and the mist it sprays straight out of the page at you.
 * Animations live in globals.css (`.sp-*`); all sizes are in bottle units (the units of <BottleVisual>'s viewBox).
 */

/** The nozzle: a small opening in the middle of the spray head, facing you. */
const NOZZLE = { x: 150, y: 43 };
/** Top of <BottleVisual>'s viewBox ("0 -40 300 510") — needed to place the mist over the nozzle. Keep in sync. */
const VIEWBOX_TOP = -40;
const VIEWBOX_MID_X = 150;
/** The burst leaves as the head reaches the bottom of its press. Keep in sync with `sp-press` in globals.css. */
const PRESS_MS = 170;

/**
 * Clouds of mist. Each starts as a point at the nozzle and swells to `size` across — the way something grows as it
 * comes towards you — settling `x`/`y` away from the nozzle. Several overlapping lobes, rather than one neat disc,
 * make it billow like mist; they spread sideways and down, never upwards.
 */
const PUFFS = [
  // The puff right at the nozzle
  { size: 50, x: 0, y: 0, peak: 0.65, delay: 0, duration: 650 },
  { size: 300, x: 0, y: 16, peak: 0.46, delay: 0, duration: 2000 },
  { size: 300, x: -112, y: 34, peak: 0.35, delay: 60, duration: 2200 },
  { size: 320, x: 118, y: 50, peak: 0.35, delay: 90, duration: 2300 },
  { size: 340, x: -58, y: 150, peak: 0.3, delay: 130, duration: 2500 },
  { size: 340, x: 76, y: 172, peak: 0.3, delay: 160, duration: 2600 },
  // The haze left hanging in front of the screen
  { size: 720, x: 0, y: 112, peak: 0.22, delay: 220, duration: 3000 },
];

const DROPLET_TINTS = ["#fbe6a8", "#ffffff", "#f5c130"];
/** How many of the droplets are bigger beads that land on the glass and slip down it. */
const BEADS = 12;

// Seeded, so every burst (and the server and browser) lay the droplets out identically.
const random = (() => {
  let seed = 20261;
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
})();

/** Droplets flying out in every direction around the nozzle, each landing on the "glass" where it ends up. */
const DROPLETS = Array.from({ length: 80 }, (_, i) => {
  const bead = i < BEADS;
  const angle = random() * Math.PI * 2;
  // Square root spreads them evenly over the disc instead of bunching them at the centre.
  const distance = 60 + Math.sqrt(random()) * 440;
  return {
    bead,
    x: Math.round(Math.cos(angle) * distance),
    y: Math.round(Math.sin(angle) * distance),
    size: (bead ? 6 + random() * 5 : 1.8 + random() * 2.4).toFixed(1),
    delay: Math.round(random() * 300),
    duration: Math.round(bead ? 2400 + random() * 900 : 1500 + random() * 1100),
    tint: DROPLET_TINTS[i % DROPLET_TINTS.length],
  };
});

/**
 * The pump under the cap. Rendered inside <BottleVisual> as its children, so it is in bottle coordinates and can use
 * the bottle's gradients (`cz-metal`). `spray` counts the presses so far; each new number presses the head once.
 */
export function SprayPump({ spray }: { spray: number }) {
  return (
    <g aria-hidden>
      {/* Stem and head — pressed down once per spray */}
      <g key={spray} className={spray > 0 ? "sp-press" : undefined}>
        <rect x="146" y="50" width="8" height="24" fill="url(#cz-metal)" opacity="0.85" />
        <rect x="134" y="32" width="32" height="22" rx="4" fill="url(#cz-metal)" />
        {/* Finger rest and its shadow */}
        <rect x="136" y="33" width="28" height="4" rx="2" fill="#fff" opacity="0.28" />
        <rect x="134" y="49" width="32" height="5" rx="2.5" fill="#000" opacity="0.22" />
        {/* Nozzle, pointing straight at you */}
        <circle cx={NOZZLE.x} cy={NOZZLE.y} r="4" fill="#1a1a1a" stroke="#7a5710" strokeWidth="0.8" />
        <circle cx={NOZZLE.x} cy={NOZZLE.y} r="1.5" fill="#000" />
      </g>

      {/* Ferrule crimped over the neck; the stem slides into it */}
      <rect x="129" y="68" width="42" height="15" rx="2" fill="url(#cz-metal)" />
      <rect x="129" y="72" width="42" height="1.4" fill="#000" opacity="0.28" />
      <rect x="129" y="78" width="42" height="1.4" fill="#000" opacity="0.28" />
    </g>
  );
}

/**
 * The mist, sprayed out of the screen towards you. A sibling of the bottle's <svg> inside `.teaser-bottle` rather than
 * part of it: as plain elements animated with transform and opacity it runs on the GPU, and never makes the browser
 * repaint the bottle underneath. Re-mounted for every press so the animations replay.
 */
export function SprayMist({ spray }: { spray: number }) {
  if (spray === 0) return null;
  return (
    <div
      key={spray}
      aria-hidden
      className="sp-mist"
      style={{
        left: `calc(50% + var(--u) * ${NOZZLE.x - VIEWBOX_MID_X})`,
        top: `calc(var(--u) * ${NOZZLE.y - VIEWBOX_TOP})`,
      }}
    >
      {PUFFS.map((puff, i) => (
        <span
          key={i}
          className="sp-puff"
          style={
            {
              "--size": puff.size,
              "--x": puff.x,
              "--y": puff.y,
              "--peak": puff.peak,
              "--d": `${PRESS_MS + puff.delay}ms`,
              "--dur": `${puff.duration}ms`,
            } as CSSProperties
          }
        />
      ))}
      {DROPLETS.map((drop, i) => (
        <span
          key={i}
          className={drop.bead ? "sp-drop sp-bead" : "sp-drop"}
          style={
            {
              "--size": drop.size,
              "--x": drop.x,
              "--y": drop.y,
              "--tint": drop.tint,
              "--d": `${PRESS_MS + drop.delay}ms`,
              "--dur": `${drop.duration}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
