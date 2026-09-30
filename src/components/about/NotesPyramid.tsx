import type { CSSProperties } from "react";

/** The three bands of the pyramid, apex at the top. The lit band follows `data-step` on the surrounding <ScrollScene>. */
const BANDS = [
  { points: "150,8 193.79,93 106.21,93", label: "Top", labelY: 74 },
  { points: "103.12,99 196.88,99 239.12,181 60.88,181", label: "Heart", labelY: 146 },
  { points: "57.79,187 242.21,187 286,272 14,272", label: "Base", labelY: 236 },
];

const WISPS = [
  { d: "M150 2 C 140 -14, 160 -26, 148 -44 S 154 -60, 146 -70", delay: "0s" },
  { d: "M152 2 C 164 -12, 144 -28, 158 -46 S 150 -62, 160 -72", delay: "1.5s" },
  { d: "M148 2 C 150 -16, 136 -30, 146 -48 S 140 -60, 144 -74", delay: "3s" },
];

export function NotesPyramid({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 -80 300 360" aria-hidden className={`overflow-visible ${className}`}>
      <defs>
        <linearGradient id="about-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbd972" />
          <stop offset="0.55" stopColor="#f5c130" />
          <stop offset="1" stopColor="#b8870c" />
        </linearGradient>
        <filter id="about-band-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {WISPS.map((wisp) => (
        <path
          key={wisp.d}
          d={wisp.d}
          pathLength={1}
          fill="none"
          stroke="#f8cb45"
          strokeWidth="1.4"
          strokeLinecap="round"
          className="about-wisp"
          style={{ "--d": wisp.delay } as CSSProperties}
        />
      ))}

      {BANDS.map((band, i) => (
        <g key={band.label}>
          <polygon points={band.points} fill="#161616" stroke="rgb(245 193 48 / 0.28)" strokeWidth="1" />
          <polygon points={band.points} fill="url(#about-gold)" filter="url(#about-band-glow)" data-band={i} className="about-band" />
          <text
            x="150"
            y={band.labelY}
            textAnchor="middle"
            data-label={i}
            className="about-band-label text-[11px] font-semibold uppercase tracking-[0.35em]"
          >
            {band.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
