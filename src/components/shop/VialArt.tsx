/** Drawn stand-in for products without a photo yet — a small attar vial tinted to the scent. */
export function VialArt({ tint = "#c9a13a", name, tone = "dark" }: { tint?: string; name: string; tone?: "dark" | "light" }) {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const light = tone === "light";

  return (
    <svg viewBox="0 0 300 300" role="img" aria-label={name} className="size-full">
      <defs>
        <radialGradient id={`va-bg-${id}`} cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor={tint} stopOpacity={light ? 0.45 : 0.3} />
          <stop offset="1" stopColor={light ? "#e4ecd4" : "#0d0d0d"} stopOpacity={light ? 0.9 : 0.95} />
        </radialGradient>
        <linearGradient id={`va-oil-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={tint} />
          <stop offset="1" stopColor={tint} stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`va-cap-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a5710" />
          <stop offset="0.3" stopColor="#f3d27a" />
          <stop offset="0.6" stopColor="#b98d23" />
          <stop offset="1" stopColor="#6e4e0e" />
        </linearGradient>
      </defs>

      <rect width="300" height="300" fill={light ? "#eaf0dd" : "#141414"} />
      <rect width="300" height="300" fill={`url(#va-bg-${id})`} />

      {/* Vial */}
      <g>
        <rect x="132" y="58" width="36" height="20" rx="3" fill={`url(#va-cap-${id})`} />
        <rect x="140" y="78" width="20" height="12" fill={`url(#va-cap-${id})`} opacity="0.85" />
        <rect
          x="116"
          y="90"
          width="68"
          height="128"
          rx="10"
          fill={light ? "#ffffff" : "#ffffff"}
          fillOpacity={light ? 0.45 : 0.07}
          stroke={light ? "#12384a" : "#ffe08a"}
          strokeOpacity={light ? 0.18 : 0.3}
        />
        <rect x="124" y="126" width="52" height="86" rx="6" fill={`url(#va-oil-${id})`} />
        <ellipse cx="150" cy="127" rx="26" ry="4" fill="#fff" opacity={light ? 0.5 : 0.25} />
        <rect x="123" y="98" width="5" height="112" rx="2.5" fill="#fff" opacity={light ? 0.6 : 0.22} />
      </g>

      <ellipse cx="150" cy="224" rx="52" ry="7" fill={light ? "#12384a" : "#000"} opacity={light ? 0.14 : 0.5} />
      <text
        x="150"
        y="258"
        textAnchor="middle"
        fill={light ? "#5c7684" : "#8a8a8a"}
        fontSize="9"
        letterSpacing="2.5"
        fontFamily="var(--font-sans)"
      >
        PHOTO COMING SOON
      </text>
    </svg>
  );
}
