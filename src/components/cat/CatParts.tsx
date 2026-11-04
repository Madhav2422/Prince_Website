/*
 * Drawing for the white cat shared by <WalkingCat> and <NavCat>; ./rig.ts poses it.
 *
 * Every paint server is namespaced by `id`, so two cats can share a page without their gradients colliding.
 * Pass `furClassName` to roughen the edges of the fur with the `${id}-fuzz` filter — it must be a literal class in the
 * caller's source (e.g. "lg:[filter:url(#cat-fuzz)]") so Tailwind can see it.
 */

import { CHEEK, CHIN, BLAZE, EAR_INSIDE, EAR_SHAPE, EYE_SHAPE, FAR_FUR, FAR_WHITE, LEGS, MUZZLE, PAW_RY, SIDE_TAIL, SKULL, SNOUT, TAIL_JOINT } from "./rig";

export type CatPaint = ReturnType<typeof catPaint>;

export function catPaint(id: string) {
  const url = (name: string) => `url(#${id}-${name})`;
  return {
    fur: url("fur"),
    head: url("head"),
    tail: url("tail"),
    white: url("white"),
    sock: url("sock"),
    muzzle: url("muzzle"),
    ear: url("ear"),
    iris: url("iris"),
    shadow: url("shadow"),
    eyeClip: url("eye"),
  };
}

export function CatDefs({ id }: { id: string }) {
  return (
    <defs>
      {/* White fur, lit from above and shaded warm grey underneath; shared in user space so every body part shades as one */}
      <linearGradient id={`${id}-fur`} gradientUnits="userSpaceOnUse" x1="0" y1="74" x2="0" y2="118">
        <stop offset="0" stopColor="#f6f4f0" />
        <stop offset="0.5" stopColor="#e6e3dd" />
        <stop offset="1" stopColor="#cfcbc4" />
      </linearGradient>
      <linearGradient id={`${id}-tail`} gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="90">
        <stop offset="0" stopColor="#f1eee9" />
        <stop offset="1" stopColor="#d6d2cb" />
      </linearGradient>
      <linearGradient id={`${id}-head`} gradientUnits="userSpaceOnUse" x1="0" y1="-14" x2="0" y2="12">
        <stop offset="0" stopColor="#f8f6f2" />
        <stop offset="1" stopColor="#d9d5ce" />
      </linearGradient>
      <linearGradient id={`${id}-white`} gradientUnits="userSpaceOnUse" x1="0" y1="80" x2="0" y2="116">
        <stop offset="0" stopColor="#fdfcfa" />
        <stop offset="1" stopColor="#dedad4" />
      </linearGradient>
      <linearGradient id={`${id}-sock`} gradientUnits="userSpaceOnUse" x1="0" y1="112" x2="0" y2="132">
        <stop offset="0" stopColor="#f4f2ee" />
        <stop offset="1" stopColor="#d3cfc8" />
      </linearGradient>
      <linearGradient id={`${id}-muzzle`} gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="10">
        <stop offset="0" stopColor="#fdfcfa" />
        <stop offset="1" stopColor="#e0ddd7" />
      </linearGradient>
      <linearGradient id={`${id}-ear`} gradientUnits="userSpaceOnUse" x1="0" y1="-9" x2="0" y2="1">
        <stop offset="0" stopColor="#f1c3c6" />
        <stop offset="1" stopColor="#cc959a" />
      </linearGradient>
      <radialGradient id={`${id}-iris`}>
        <stop offset="0" stopColor="#e2d774" />
        <stop offset="0.35" stopColor="#d6b44a" />
        <stop offset="0.8" stopColor="#a8742a" />
        <stop offset="1" stopColor="#4a3313" />
      </radialGradient>
      <radialGradient id={`${id}-shadow`}>
        <stop offset="0" stopColor="#000" stopOpacity="0.5" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <clipPath id={`${id}-eye`}>
        <path d={EYE_SHAPE} />
      </clipPath>
      {/* Roughens edges into fur; the grain lives in each part's own space, so it moves with the cat */}
      <filter id={`${id}-fuzz`} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" seed="4" />
        <feDisplacementMap in="SourceGraphic" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  );
}

/** The walking side view, facing right; legs are placed each frame by createSideRig(). */
export function CatSide({ paint, furClassName }: { paint: CatPaint; furClassName?: string }) {
  const leg = (i: number) => {
    const { widths, far, bend } = LEGS[i];
    const fur = far ? FAR_FUR : paint.fur;
    const sock = far ? FAR_WHITE : paint.sock;
    return (
      <g key={i} data-leg={i}>
        {bend === 1 && <path data-thigh fill={fur} />}
        <line strokeWidth={widths[0]} stroke={fur} />
        <line strokeWidth={widths[1]} stroke={fur} />
        <line strokeWidth={widths[2]} stroke={fur} />
        <line strokeWidth={widths[2]} stroke={sock} />
        <ellipse data-paw cx="1.2" cy="0" rx="3.8" ry={PAW_RY} fill={sock} />
      </g>
    );
  };

  return (
    <g data-part="side" strokeLinecap="round">
      {leg(0)}
      {leg(1)}
      <g data-part="side-body" className={furClassName}>
        <g data-part="tail-base" fill={paint.tail}>
          <path d={SIDE_TAIL[0]} />
          <g data-part="tail-tip">
            <circle cx={TAIL_JOINT[0]} cy={TAIL_JOINT[1]} r="3.1" />
            <path d={SIDE_TAIL[1]} />
          </g>
        </g>
        <g fill={paint.fur}>
          {/* Neck, mostly hidden by the head */}
          <path d="M138 82C140 75 145 69 152 66L164 70C165 78 162 86 156 90Z" />
          {/* Deep chest, level back, belly tucked up in front of the thigh */}
          <path d="M76 90C75 83 80 77.5 88 76.5C102 75.5 112 79.5 124 79C134 78.5 142 76.5 149 78.5C157 81 160 89 158 96C156 102.5 149 106 141 105.5C131 105 120 101.5 110 100C103 99 98 100 95 103C88 109 77 103 76 90Z" />
          <ellipse cx="87.5" cy="93.5" rx="12" ry="12.5" />
          <ellipse cx="147" cy="93.5" rx="11" ry="11.5" />
        </g>
        {/* White throat and chest */}
        <path fill={paint.white} d="M151.5 81C156.5 83 159.5 89 158.3 95.5C157.3 100.5 153.5 104.5 148.5 105C147.5 98 147.5 88 151.5 81Z" />
      </g>
      {leg(2)}
      {leg(3)}
    </g>
  );
}

/** The head — every feature is placed each frame by createHeadRig(). */
export function CatHead({ paint, furClassName }: { paint: CatPaint; furClassName?: string }) {
  return (
    <g data-part="head">
      <ellipse data-part="head-shadow" cy="7" rx="12" ry="9.5" fill={paint.shadow} />
      <g className={furClassName}>
        <g data-part="ears" fill={paint.head}>
          {[0, 1].map((i) => (
            <g key={i} data-part={`ear-${i}`}>
              <g data-part={i ? "ear-twitch" : undefined}>
                <path d={EAR_SHAPE} />
                <g data-part={`ear-inside-${i}`}>
                  <path d={EAR_INSIDE} fill={paint.ear} />
                  <path
                    d="M-1.6 0.6C-0.8 -1.8 0.2 -3.6 1.4 -5.2M0.4 0.6C0.9 -1.4 1.6 -3 2.4 -4.4"
                    fill="none"
                    stroke="#ecebe6"
                    strokeWidth="0.35"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                </g>
              </g>
            </g>
          ))}
        </g>
        <g fill={paint.head}>
          <ellipse data-part="cheek-0" cy={CHEEK[1]} rx="6" ry="5.4" />
          <ellipse data-part="cheek-1" cy={CHEEK[1]} rx="6" ry="5.4" />
          <ellipse data-part="skull" ry={SKULL.halfHeight} />
          <ellipse data-part="snout" cy={SNOUT.y} ry="6" />
        </g>
        <g fill={paint.muzzle}>
          <ellipse data-part="blaze" cy={BLAZE[1]} ry="3.6" />
          <ellipse data-part="muzzle-0" cy={MUZZLE[1]} rx="3.3" ry="2.8" />
          <ellipse data-part="muzzle-1" cy={MUZZLE[1]} rx="3.3" ry="2.8" />
          <ellipse data-part="chin" cy={CHIN[1]} rx="3" ry="2" />
        </g>
      </g>

      <g data-part="nose">
        <path d="M-1.7 -0.8C-0.8 -1.2 0.8 -1.2 1.7 -0.8C1.5 0.2 0.5 0.9 0 1.1C-0.5 0.9 -1.5 0.2 -1.7 -0.8Z" fill="#e49aa3" />
        <path
          d="M0 1.1V2.2M-2.1 2.9C-1.2 3.2 -0.4 2.9 0 2.2C0.4 2.9 1.2 3.2 2.1 2.9"
          fill="none"
          stroke="#8a7677"
          strokeWidth="0.4"
          strokeLinecap="round"
          opacity="0.75"
        />
      </g>

      {[0, 1].map((i) => (
        <g key={i} data-part={`eye-${i}`}>
          <g clipPath={paint.eyeClip}>
            <circle cx="0.1" cy="-0.15" r="2.15" fill={paint.iris} />
            <ellipse cx="0.1" cy="-0.15" rx="0.8" ry="1.95" fill="#0d0d0d" />
            <circle cx="-0.7" cy="-1" r="0.42" fill="#fff" opacity="0.85" />
            {/* Shade from the upper lid */}
            <ellipse cy="-2.2" rx="3" ry="1.3" fill="#000" opacity="0.35" />
          </g>
          <path d={EYE_SHAPE} fill="none" stroke="#2b2b2d" strokeWidth="0.5" />
        </g>
      ))}
      <g data-part="eyes-closed" fill="none" stroke="#4a4546" strokeWidth="0.6" strokeLinecap="round" style={{ opacity: 0 }}>
        <path data-part="lid-0" d="M-2.6 0.4C-1.2 1.2 1.2 1 2.6 -0.7" />
        <path data-part="lid-1" d="M-2.6 0.4C-1.2 1.2 1.2 1 2.6 -0.7" />
      </g>

      {[0, 1].map((i) => (
        <path
          key={i}
          data-part={`whiskers-${i}`}
          d="M0 -0.6C4.5 -2.4 9.5 -3.1 13.5 -2.8M0 0.3C4.8 -0.1 10 0.3 14.5 1.3M0 1.2C4.5 2 8.8 3.4 12.5 5"
          fill="none"
          stroke="#e9e7e2"
          strokeWidth="0.28"
          strokeLinecap="round"
          opacity="0.4"
        />
      ))}
    </g>
  );
}
