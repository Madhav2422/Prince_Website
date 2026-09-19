"use client";

import { getScent, SLOT_COUNT } from "@/data/customize";

/** Interior of the glass, in SVG user units — the liquid is clipped to this. */
const INTERIOR = { x: 62, y: 158, width: 176, height: 222 };
const LAYER_H = INTERIOR.height / SLOT_COUNT;

type BottleVisualProps = {
  /** Scent slug per filled slot, oldest first (bottom of the bottle). */
  layers: { key: number; slug: string }[];
  engraving: string;
  /** Slug of the scent currently pouring in, if any. */
  pouring: string | null;
};

export function BottleVisual({
  layers,
  engraving,
  pouring,
}: BottleVisualProps) {
  const pourScent = pouring ? getScent(pouring) : null;

  return (
    <svg
      viewBox="0 0 300 470"
      role="img"
      aria-label={`Bottle filled with ${layers.length} of ${SLOT_COUNT} layers`}
      className="h-full w-full"
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

        <radialGradient id="cz-glow">
          <stop offset="0" stopColor="#f5c130" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#e39a16" stopOpacity="0.16" />
          <stop offset="1" stopColor="#e39a16" stopOpacity="0" />
        </radialGradient>
        {/* Softens the boundary between neighbouring scent layers */}
        <filter id="cz-blend" x="-10%" y="-6%" width="120%" height="112%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>

        <linearGradient id="cz-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="0.16" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="0.86" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="cz-cap" x1="0" y1="0" x2="1" y2="0">
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
        {/* Each scent gets its own vertical gradient so layers read as liquid, not flat blocks */}
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

      {/* Cap + collar */}
      <rect x="112" y="12" width="76" height="66" rx="4" fill="url(#cz-cap)" />
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
      <rect x="124" y="78" width="52" height="8" rx="2" fill="url(#cz-metal)" />
      <rect
        x="130"
        y="86"
        width="40"
        height="26"
        fill="url(#cz-metal)"
        opacity="0.9"
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
          {layers.map(({ key, slug }, i) => (
            <g
              key={key}
              className="cz-layer"
              style={{
                transform: `translateY(${-i * LAYER_H}px)`,
                transition: "transform 700ms cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <rect
                x={INTERIOR.x}
                y={INTERIOR.y + INTERIOR.height - LAYER_H}
                width={INTERIOR.width}
                height={LAYER_H + 1}
                fill={`url(#cz-liquid-${key})`}
              />
              {/* Soft meniscus so neighbouring scents blend into each other */}
              <rect
                x={INTERIOR.x}
                y={INTERIOR.y + INTERIOR.height - LAYER_H - 3}
                width={INTERIOR.width}
                height="7"
                fill={getScent(slug)?.to ?? "#fff"}
                opacity="0.45"
              />
            </g>
          ))}
        </g>

        {/* Swaying surface on the topmost layer */}
        {layers.length > 0 && (
          <ellipse
            className="cz-surface"
            cx="150"
            cy={INTERIOR.y + INTERIOR.height - layers.length * LAYER_H}
            rx={INTERIOR.width / 2}
            ry="5"
            fill="#fff"
            opacity="0.28"
            style={{ transition: "cy 700ms cubic-bezier(0.22,1,0.36,1)" }}
          />
        )}

        {/* Rising bubbles once there is something to rise through */}
        {layers.length > 0 &&
          [0, 1, 2].map((i) => (
            <circle
              key={i}
              className="cz-bubble"
              cx={110 + i * 40}
              cy={INTERIOR.y + INTERIOR.height - 10}
              r={2 + (i % 2)}
              fill="#fff"
              opacity="0.35"
              style={{ animationDelay: `${i * 1.3}s` }}
            />
          ))}
      </g>

      {/* Pouring stream + splash */}
      {pourScent && (
        <g key={pouring} aria-hidden>
          <rect
            className="cz-stream"
            x="146"
            y="96"
            width="8"
            height="90"
            rx="4"
            fill={pourScent.to}
            opacity="0.9"
          />
          <circle
            className="cz-droplet"
            cx="150"
            cy="120"
            r="7"
            fill={pourScent.to}
          />
        </g>
      )}

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

      {/* Glass highlights over everything */}
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
    </svg>
  );
}
