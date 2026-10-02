"use client";

import type { CSSProperties, ReactNode } from "react";
import { getScent, SLOT_COUNT } from "@/data/customize";

/** Timings shared with the Customizer so it can queue pours and schedule the cap. Keep in sync with globals.css. */
export const CAP_OPEN_MS = 900;
export const POUR_IMPACT_MS = 700;
export const POUR_TOTAL_MS = 1500;
/** Minimum spacing between queued pours, so fast clicks play one after another. */
export const POUR_GAP_MS = 850;

/** Interior of the glass, in SVG user units — the liquid is clipped to this. */
const INTERIOR = { x: 62, y: 158, width: 176, height: 222 };
const LAYER_H = INTERIOR.height / SLOT_COUNT;
const BOTTOM = INTERIOR.y + INTERIOR.height;
/** Where the essence drop forms, above the open neck. */
const ORB_Y = 40;
const surfaceY = (filled: number) => BOTTOM - filled * LAYER_H;

const PARTICLES = Array.from({ length: 7 }, (_, i) => {
  const angle = (i / 7) * Math.PI * 2;
  return [Math.round(Math.cos(angle) * 40), Math.round(Math.sin(angle) * 34)];
});
const SPLASH = [
  [-16, -22],
  [2, -30],
  [17, -20],
];
const SPARKLES = [-10, 4, 12];
const WISPS = [
  "M146 80 C 132 62, 160 48, 142 28 S 150 0, 138 -18",
  "M152 80 C 166 60, 140 44, 158 22 S 150 -6, 164 -22",
  "M150 80 C 150 64, 136 50, 150 34 S 162 10, 150 -8",
];

export type BottleLayer = { key: number; slug: string; delay: number };
export type Pour = { key: number; slug: string; delay: number; index: number };
export type CapState = "idle" | "open" | "closed";

type BottleVisualProps = {
  layers: BottleLayer[];
  pours: Pour[];
  cap: CapState;
  /** Bumps every time the cap opens, so the aroma wisps replay. */
  openCount: number;
  engraving: string;
  /** Extra SVG, in bottle coordinates, drawn just under the cap — so it is only seen once the cap has lifted. */
  children?: ReactNode;
};

export function BottleVisual({
  layers,
  pours,
  cap,
  openCount,
  engraving,
  children,
}: BottleVisualProps) {
  const isOpen = cap === "open";

  return (
    <svg
      viewBox="0 -40 300 510"
      role="img"
      aria-label={`Bottle filled with ${layers.length} of ${SLOT_COUNT} layers`}
      className="h-full w-full overflow-visible"
    >
      <defs>
        <clipPath id="cz-interior">
          <rect
            x={INTERIOR.x}
            y={INTERIOR.y}
            width={INTERIOR.width}
            height={INTERIOR.height}
            rx="10"
          />
        </clipPath>
        <clipPath id="cz-cap-clip">
          <rect x="112" y="12" width="76" height="66" rx="4" />
        </clipPath>

        <radialGradient id="cz-glow">
          <stop offset="0" stopColor="#f5c130" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#e39a16" stopOpacity="0.16" />
          <stop offset="1" stopColor="#e39a16" stopOpacity="0" />
        </radialGradient>
        <filter id="cz-blend" x="-10%" y="-6%" width="120%" height="112%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <filter id="cz-soft" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" />
        </filter>

        <linearGradient id="cz-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="0.16" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="0.86" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="cz-cap-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0a0a0a" />
          <stop offset="0.25" stopColor="#3a3a3a" />
          <stop offset="0.55" stopColor="#111" />
          <stop offset="0.85" stopColor="#2a2a2a" />
          <stop offset="1" stopColor="#080808" />
        </linearGradient>
        <linearGradient id="cz-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6e4e0e" />
          <stop offset="0.25" stopColor="#f3d27a" />
          <stop offset="0.5" stopColor="#b98d23" />
          <stop offset="0.78" stopColor="#ffeaa8" />
          <stop offset="1" stopColor="#7a5710" />
        </linearGradient>
        <linearGradient id="cz-gleam-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        {layers.map(({ key, slug }) => {
          const scent = getScent(slug);
          return scent ? (
            <linearGradient
              key={key}
              id={`cz-liquid-${key}`}
              x1="0"
              y1="1"
              x2="0"
              y2="0"
            >
              <stop offset="0" stopColor={scent.from} />
              <stop offset="1" stopColor={scent.to} />
            </linearGradient>
          ) : null;
        })}
        {pours.map(({ key, slug }) => {
          const scent = getScent(slug);
          return scent ? (
            <radialGradient
              key={key}
              id={`cz-orb-${key}`}
              cx="0.35"
              cy="0.3"
              r="0.8"
            >
              <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
              <stop offset="0.35" stopColor={scent.to} />
              <stop offset="1" stopColor={scent.from} />
            </radialGradient>
          ) : null;
        })}
      </defs>

      {/* Glow that strengthens as the bottle fills */}
      <ellipse
        cx="150"
        cy="300"
        rx="150"
        ry="180"
        fill="url(#cz-glow)"
        className="transition-opacity duration-1000"
        opacity={0.35 + (layers.length / SLOT_COUNT) * 0.65}
      />

      {/* Essence drop: drawn behind the metal neck so it visibly disappears into the bottle */}
      {pours.map((pour) => {
        const scent = getScent(pour.slug);
        if (!scent) return null;
        const target = surfaceY(pour.index);
        const vars = {
          "--pd": `${pour.delay}ms`,
          "--fall": `${target - ORB_Y - 4}px`,
        } as CSSProperties;
        return (
          <g key={pour.key} style={vars} aria-hidden>
            <circle
              className="cz-orb-glow"
              cx="150"
              cy={ORB_Y}
              r="16"
              fill={scent.to}
              filter="url(#cz-soft)"
            />
            {PARTICLES.map(([dx, dy], i) => (
              <circle
                key={i}
                className="cz-particle"
                cx="150"
                cy={ORB_Y}
                r="2.2"
                fill={scent.to}
                style={
                  {
                    "--dx": `${dx}px`,
                    "--dy": `${dy}px`,
                    animationDelay: `calc(var(--pd) + ${i * 30}ms)`,
                  } as CSSProperties
                }
              />
            ))}
            <line
              className="cz-trail"
              x1="150"
              y1={ORB_Y + 8}
              x2="150"
              y2={target}
              stroke={scent.to}
              strokeWidth="2.4"
              strokeLinecap="round"
              pathLength={1}
            />
            <circle
              className="cz-orb"
              cx="150"
              cy={ORB_Y}
              r="9"
              fill={`url(#cz-orb-${pour.key})`}
            />
          </g>
        );
      })}

      {/* Collar + neck */}
      <rect x="124" y="78" width="52" height="8" rx="2" fill="url(#cz-metal)" />
      <rect
        x="130"
        y="86"
        width="40"
        height="26"
        fill="url(#cz-metal)"
        opacity="0.9"
      />
      {/* The opening, revealed when the cap lifts */}
      <ellipse
        cx="150"
        cy="79"
        rx="19"
        ry="3.5"
        fill="#050505"
        stroke="#f3d27a"
        strokeWidth="1"
        className="transition-opacity duration-300"
        style={{
          opacity: isOpen ? 1 : 0,
          transitionDelay: isOpen ? "380ms" : "750ms",
        }}
      />

      {/* Glass body */}
      <path
        d="M62 158c0-26 18-34 30-46h116c12 12 30 20 30 46v212c0 12-8 20-20 20H82c-12 0-20-8-20-20Z"
        fill="url(#cz-glass)"
        stroke="#ffe08a"
        strokeOpacity="0.32"
        strokeWidth="1.5"
      />

      {/* Liquid */}
      <g clipPath="url(#cz-interior)" opacity="0.88">
        <g filter="url(#cz-blend)">
          {layers.map(({ key, slug, delay }, i) => (
            <g
              key={key}
              style={{
                transform: `translateY(${-i * LAYER_H}px)`,
                transition: "transform 700ms cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <g
                className="cz-fill"
                style={{
                  transformOrigin: `150px ${BOTTOM}px`,
                  animationDelay: `${delay + POUR_IMPACT_MS}ms`,
                }}
              >
                <rect
                  x={INTERIOR.x}
                  y={BOTTOM - LAYER_H}
                  width={INTERIOR.width}
                  height={LAYER_H + 1}
                  fill={`url(#cz-liquid-${key})`}
                />
                <rect
                  x={INTERIOR.x}
                  y={BOTTOM - LAYER_H - 3}
                  width={INTERIOR.width}
                  height="7"
                  fill={getScent(slug)?.to ?? "#fff"}
                  opacity="0.45"
                />
                {/* Swaying surface sheen lives on the top layer, so it only appears once that pour lands */}
                {i === layers.length - 1 && (
                  <ellipse
                    className="cz-surface"
                    cx="150"
                    cy={BOTTOM - LAYER_H}
                    rx={INTERIOR.width / 2}
                    ry="5"
                    fill="#fff"
                    opacity="0.3"
                    style={{ transformOrigin: `150px ${BOTTOM - LAYER_H}px` }}
                  />
                )}
              </g>
            </g>
          ))}
        </g>

        {/* Bubbles fade in once the first drop has landed */}
        {layers.length > 0 && (
          <g
            key={layers[0].key}
            className="cz-fade-in"
            style={{ animationDelay: `${layers[0].delay + POUR_IMPACT_MS}ms` }}
          >
            {[0, 1, 2].map((i) => (
              <circle
                key={i}
                className="cz-bubble"
                cx={110 + i * 40}
                cy={BOTTOM - 10}
                r={2 + (i % 2)}
                fill="#fff"
                opacity="0.35"
                style={{ animationDelay: `${i * 1.3}s` }}
              />
            ))}
          </g>
        )}
      </g>

      {/* Impact: ripple + splash on the surface, aroma sparkles leaving the neck */}
      {pours.map((pour) => {
        const scent = getScent(pour.slug);
        if (!scent) return null;
        const target = surfaceY(pour.index);
        return (
          <g
            key={pour.key}
            style={{ "--pd": `${pour.delay}ms` } as CSSProperties}
            aria-hidden
          >
            <ellipse
              className="cz-ripple"
              cx="150"
              cy={target}
              rx="10"
              ry="3"
              fill="none"
              stroke={scent.to}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              style={{ transformOrigin: `150px ${target}px` }}
            />
            {SPLASH.map(([sx, sy], i) => (
              <circle
                key={i}
                className="cz-splash"
                cx="150"
                cy={target - 2}
                r="2.4"
                fill={scent.to}
                style={
                  { "--sx": `${sx}px`, "--sy": `${sy}px` } as CSSProperties
                }
              />
            ))}
            {SPARKLES.map((sx, i) => (
              <circle
                key={i}
                className="cz-sparkle"
                cx={150 + sx}
                cy="82"
                r="1.6"
                fill="#fbe6a8"
                style={
                  {
                    "--sx": `${sx * 1.5}px`,
                    animationDelay: `calc(var(--pd) + ${820 + i * 120}ms)`,
                  } as CSSProperties
                }
              />
            ))}
          </g>
        );
      })}

      {/* Engraved plate */}
      <rect
        x="92"
        y="286"
        width="116"
        height="52"
        rx="2"
        fill="#0d0d0d"
        opacity="0.72"
      />
      <rect
        x="97"
        y="291"
        width="106"
        height="42"
        rx="1"
        fill="none"
        stroke="#e0b64a"
        strokeOpacity="0.55"
        strokeWidth="0.8"
      />
      <text
        x="150"
        y={engraving ? 306 : 313}
        textAnchor="middle"
        fill="#eab83c"
        fontSize="8"
        letterSpacing="2.4"
        fontFamily="var(--font-sans)"
      >
        SOULFUL SMELL
      </text>
      {engraving && (
        <text
          x="150"
          y="326"
          textAnchor="middle"
          fill="#f7dc94"
          fontSize="17"
          fontStyle="italic"
          fontFamily="var(--font-serif)"
          className="cz-engraving"
        >
          {engraving}
        </text>
      )}

      {/* Glass highlights */}
      <rect
        x="70"
        y="170"
        width="7"
        height="196"
        rx="3.5"
        fill="#fff"
        opacity="0.22"
      />
      <rect
        x="226"
        y="176"
        width="4"
        height="184"
        rx="2"
        fill="#fff"
        opacity="0.14"
      />
      <ellipse cx="150" cy="404" rx="120" ry="12" fill="#000" opacity="0.5" />

      {/* Aroma wisps rising from the neck each time it opens */}
      {isOpen && (
        <g
          key={openCount}
          aria-hidden
          fill="none"
          stroke="#f5e2b0"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          {WISPS.map((d, i) => (
            <path
              key={i}
              d={d}
              pathLength={1}
              className="cz-wisp"
              style={{ animationDelay: `${380 + i * 180}ms` }}
            />
          ))}
        </g>
      )}

      {children}

      {/* Cap — last, so it floats above everything when lifted */}
      <g
        className={`cz-cap ${cap === "open" ? "cz-cap-open" : cap === "closed" ? "cz-cap-close" : ""}`}
        // Restart the close animation (and its gleam) every time the cap seals
        key={cap === "closed" ? `closed-${openCount}` : "cap"}
      >
        <rect
          x="112"
          y="12"
          width="76"
          height="66"
          rx="4"
          fill="url(#cz-cap-fill)"
        />
        <rect
          x="112"
          y="12"
          width="76"
          height="6"
          rx="3"
          fill="#4a4a4a"
          opacity="0.7"
        />
        <rect x="120" y="20" width="5" height="50" fill="#fff" opacity="0.08" />
        <rect x="112" y="74" width="76" height="4" fill="#000" opacity="0.45" />
        {cap === "closed" && (
          <g clipPath="url(#cz-cap-clip)">
            <g transform="skewX(-18)">
              <rect
                className="cz-gleam"
                x="100"
                y="0"
                width="22"
                height="90"
                fill="url(#cz-gleam-fill)"
              />
            </g>
          </g>
        )}
      </g>
    </svg>
  );
}
