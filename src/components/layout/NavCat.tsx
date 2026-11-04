"use client";

import { useEffect, useRef } from "react";
import { CatDefs, CatHead, CatSide, catPaint } from "@/components/cat/CatParts";
import {
  BODY_X,
  CHEST_X,
  CYCLE,
  FAR_FUR,
  FAR_WHITE,
  FRONT_HEAD_Y,
  FRONT_TAIL,
  GROUND,
  HEAD_AHEAD,
  HEAD_TURN,
  HEAD_Y,
  MAX_YAW,
  NOSE_AHEAD,
  WALK_LOOK,
  createHeadRig,
  createSideRig,
  ease,
  f,
  mix,
  pulse,
  rad,
  smooth,
  taper,
} from "@/components/cat/rig";

/*
 * The header cat. Once per page load it trots in from the left behind the logo, turns to face you and sits down beside
 * it — and there it stays. It watches everything: its head follows your cursor around the page (on a phone, wherever
 * you tap, and down at the page as you scroll), and with nothing to watch it glances about, blinks, flicks an ear or
 * the tip of its tail. Bring the cursor right up to it and it squints happily.
 *
 * Same cat as the customise page's <WalkingCat> (see components/cat). Cat space, with the seat at x = 0: the viewBox
 * frames the seated cat and the walk-in happens outside it (overflow visible), starting just off the left of the screen.
 */

const VIEWBOX = "-28 50 56 82"; // the seated cat, paws on the bottom edge
const PAINT = catPaint("navcat");

// Walk-in
const START_DELAY_S = 0.7;
const SPEED = 85; // cat units per second — a brisk trot
const DECEL = 45; // cat units over which it slows before turning
const MAX_WALK = 240; // on wide screens it steps out of the shadows this far from its seat rather than from the edge
const FADE_IN = 36;
const TURN_S = 0.9;
const TURN_ARC = 12; // the turn swings the chest this far forward, so it walks to −TURN_ARC and ends up on the seat
const SIT_S = 0.8;

// Watching
const SEATED_HEAD_Y = FRONT_HEAD_Y + 1;
const ATTENTION_S = 4; // how long something holds its interest after it last moved
const VIEW_DISTANCE = 320; // px — smaller turns the head further for the same cursor offset
const MAX_WATCH_YAW = rad(72);
const PITCH_UP = rad(12);
const PITCH_DOWN = rad(20);
const PET_RADIUS = 64; // px from the head at which it starts to squint
const PREY_SPEED = 2600; // px/s — a cursor this fast gets a twitch of the tail
/** Idle glances as [yaw, pitch] in radians; the first is a look straight at you, with a slow blink. */
const GLANCES: [number, number][] = [
  [0, 0],
  [-0.75, 0.22],
  [0.85, 0.18],
  [0.3, 0.36],
  [-0.3, 0.32],
  [0.6, -0.05],
  [-0.15, 0.05],
];

// Front view: standing as <WalkingCat> draws it → seated. [cx, cy, rx, ry] unless noted.
const HAUNCH = [
  [9.5, 112, 6, 9.5],
  [12, 121.5, 9.5, 10.5],
];
const HIND_LEG = [
  [10, 116, 10.6, 126.5],
  [14.6, 129.6, 15, 130],
]; // x1 y1 x2 y2
const HIND_FOOT = [
  [11, 129.4, 3.3, 2.3],
  [15.5, 130.6, 4, 2.2],
];
const NECK = [
  [82, 7.5, 8],
  [84, 8, 8],
]; // cy rx ry
const CHEST = [
  [97, 11, 14.5],
  [107, 12.5, 23],
]; // cy rx ry — seated, the belly comes right down between the paws
const HAUNCH_LIT = "#d9d5ce";
const FOOT_LIT = "#ebe8e3";
const WRAP_FUR = "#e2dfd9";

// Seated, the tail curls round the feet: the root passes behind the right haunch, the tip in front of the paws.
const WRAP_BASE = taper(
  [
    [10, 120],
    [22, 124],
    [20, 134],
    [6, 134.5],
  ],
  6.4,
  5,
);
const wrapTip = (lift: number, sway: number) =>
  taper(
    [
      [6, 134.5],
      [-6, 134.8],
      [-13 - 1.5 * lift + 0.5 * sway, 133 - 3 * lift],
      [-15.5 - 2 * lift + sway, 128.5 - 6.5 * lift],
    ],
    5,
    3.2,
  );
const WRAP_TIP = wrapTip(0, 0);

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mixColor = (from: string, to: string, t: number) => {
  const a = rgb(from);
  const b = rgb(to);
  return `rgb(${a.map((v, i) => Math.round(mix(v, b[i], t))).join(",")})`;
};
const lerp = (pair: number[][], t: number) => pair[0].map((v, i) => mix(v, pair[1][i], t));
const clampTo = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** Exponential approach: frame-rate independent easing towards a moving target. */
const approach = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));

type Stage = "wait" | "walk" | "turn" | "sit" | "watch";

export function NavCat() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const part = (name: string) => svg.querySelector(`[data-part="${name}"]`) as SVGElement;
    const pair = (name: string) => [part(`${name}-0`), part(`${name}-1`)];
    const cat = part("cat");
    const shadow = part("shadow");
    const side = part("side");
    const front = part("front");
    const standTail = part("stand-tail");
    const wrapBase = part("wrap-base");
    const wrapTipPath = part("wrap-tip");
    const haunches = pair("haunch");
    const hindLegs = pair("hind-leg");
    const hindFeet = pair("hind-foot");
    const neck = part("neck");
    const chest = part("chest");
    const bib = part("bib");
    const frontPaws = pair("front-paw");
    const head = part("head");
    const sideRig = createSideRig(svg);
    const turnHead = createHeadRig(svg);

    /** Blends the front view from standing (0) to seated (1). */
    const placeFront = (sit: number) => {
      standTail.setAttribute("transform", `rotate(${f(mix(-40, -105, sit))} 0 100)`);
      standTail.style.opacity = f(1 - smooth(sit / 0.55));
      wrapBase.style.opacity = wrapTipPath.style.opacity = f(smooth((sit - 0.35) / 0.5));
      const [hx, hy, hrx, hry] = lerp(HAUNCH, sit);
      const [lx1, ly1, lx2, ly2] = lerp(HIND_LEG, sit);
      const [fx, fy, frx, fry] = lerp(HIND_FOOT, sit);
      const haunchFill = mixColor(FAR_FUR, HAUNCH_LIT, sit);
      const footFill = mixColor(FAR_WHITE, FOOT_LIT, sit);
      [0, 1].forEach((i) => {
        const m = i ? 1 : -1;
        haunches[i].setAttribute("cx", f(m * hx));
        haunches[i].setAttribute("cy", f(hy));
        haunches[i].setAttribute("rx", f(hrx));
        haunches[i].setAttribute("ry", f(hry));
        haunches[i].setAttribute("fill", haunchFill);
        hindLegs[i].setAttribute("x1", f(m * lx1));
        hindLegs[i].setAttribute("y1", f(ly1));
        hindLegs[i].setAttribute("x2", f(m * lx2));
        hindLegs[i].setAttribute("y2", f(ly2));
        hindLegs[i].setAttribute("stroke", haunchFill);
        hindFeet[i].setAttribute("cx", f(m * fx));
        hindFeet[i].setAttribute("cy", f(fy));
        hindFeet[i].setAttribute("rx", f(frx));
        hindFeet[i].setAttribute("ry", f(fry));
        hindFeet[i].setAttribute("fill", footFill);
      });
      const [ncy, nrx, nry] = lerp(NECK, sit);
      neck.setAttribute("cy", f(ncy));
      neck.setAttribute("rx", f(nrx));
      neck.setAttribute("ry", f(nry));
      const [ccy, crx, cry] = lerp(CHEST, sit);
      chest.setAttribute("cy", f(ccy));
      chest.setAttribute("rx", f(crx));
      chest.setAttribute("ry", f(cry));
      bib.setAttribute("transform", `translate(0 ${f(83.5 + 1.5 * sit)}) scale(${f(1 + 0.1 * sit, 3)} ${f(1 + 0.14 * sit, 3)}) translate(0 -83.5)`);
    };

    /** Places the whole body: x is the chest, theta 0 = side on facing right, π/2 = facing you. Returns the bob. */
    const placeBody = (x: number, theta: number, phase: number, speed: number, stepping: number, sit: number, clock: number) => {
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const bob = 0.8 * Math.sin(4 * Math.PI * phase + 0.5) * speed;
      const sideAlpha = smooth((Math.abs(c) - 0.3) / 0.2);
      const frontAlpha = smooth((s - 0.84) / 0.13);

      shadow.setAttribute("cx", f(x + (BODY_X - CHEST_X) * c));
      shadow.setAttribute("cy", f(GROUND + 0.6));
      shadow.setAttribute("rx", f(54 * Math.abs(c) + (22 + 5 * sit) * s));
      shadow.setAttribute("ry", "4.2");

      side.setAttribute("transform", `translate(${f(x)} 0) scale(${f(c, 4)} 1) translate(${-CHEST_X} 0)`);
      side.style.opacity = f(sideAlpha);
      if (sideAlpha > 0) {
        sideRig.pose(phase, bob, speed, clock);
        sideRig.fadeForelegs(1 - frontAlpha);
      }

      front.setAttribute("transform", `translate(${f(x)} 0) scale(${f(s, 4)} 1)`);
      front.style.opacity = f(frontAlpha);
      if (frontAlpha > 0) {
        placeFront(sit);
        frontPaws.forEach((paw, i) => {
          const lift = stepping * 2.6 * Math.max(0, Math.sin(2 * Math.PI * phase + i * Math.PI));
          paw.setAttribute("transform", `translate(0 ${f(-lift)})`);
        });
      }
      return bob;
    };

    const placeHead = (x: number, y: number, tilt: number, yaw: number, pitch: number, eyeOpen: number, ear: number) => {
      head.setAttribute("transform", `translate(${f(x)} ${f(y)}) rotate(${f(tilt)} 0 6)`);
      turnHead(yaw, eyeOpen, ear, pitch);
    };

    // Reduced motion: no walk-in and no watching, just a cat sitting by the logo.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      placeBody(0, Math.PI / 2, 0, 0, 0, 1, 0);
      placeHead(0, SEATED_HEAD_Y, 0, 0, 0, 1, 0);
      cat.style.visibility = "visible";
      return;
    }

    let stage: Stage = "wait";
    let stageT = 0;
    let raf = 0;
    let last = 0;
    let clock = 0;
    let cx = 0; // chest, cat units
    let startX = 0;
    let fade = false;
    let phase = 0;

    // Watching
    const now = () => performance.now() / 1000;
    let headX = 0; // screen px of the seated head
    let headY = 0;
    let gazeX = 0;
    let gazeY = 0;
    let attentionUntil = -1;
    let mouseAt = -Infinity;
    let movedAt = -Infinity;
    let pointerX = -1e4;
    let pointerY = -1e4;
    let lastMove = { x: 0, y: 0, t: 0 };
    let glance = GLANCES[0];
    let nextGlanceAt = 0;
    let slowBlinkAt = -10;
    let nextBlink = 2;
    let blinkAt = -10;
    let earAt = -10;
    let nextEar = 6;
    let flickAt = -10;
    let nextFlick = 5;
    let yaw = 0;
    let pitch = 0;
    let tilt = 0;
    let pet = 0;
    let curious = 0;
    let tipDrawn = false;
    // Last head pose written to the DOM. Infinity, not NaN: any comparison with NaN is false, so it would never draw.
    let written = [Infinity, Infinity, Infinity, Infinity, Infinity];

    const go = (next: Stage) => {
      stage = next;
      stageT = 0;
    };

    const measure = () => {
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      headX = ctm.e;
      headY = ctm.d * SEATED_HEAD_Y + ctm.f;
    };

    /** Works out where the walk starts: just off the left of the screen, or out of the shadows on wide screens. */
    const plan = () => {
      const ctm = svg.getScreenCTM();
      if (!ctm || !ctm.a) return false;
      const endX = -TURN_ARC;
      startX = -ctm.e / ctm.a - NOSE_AHEAD - 6;
      fade = endX - startX > MAX_WALK;
      if (fade) startX = endX - MAX_WALK;
      cx = startX;
      return true;
    };

    const watch = (x: number, y: number, hold: number) => {
      gazeX = x;
      gazeY = y;
      attentionUntil = now() + hold;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // touch moves are scrolls; taps arrive as pointerdown
      const t = now();
      const speed = Math.hypot(e.clientX - lastMove.x, e.clientY - lastMove.y) / Math.max(0.008, t - lastMove.t);
      if (speed > PREY_SPEED && t - flickAt > 1.2) flickAt = t; // something darting about: the tail twitches
      lastMove = { x: e.clientX, y: e.clientY, t };
      pointerX = e.clientX;
      pointerY = e.clientY;
      mouseAt = movedAt = t;
      watch(e.clientX, e.clientY, ATTENTION_S);
    };
    const onPointerDown = (e: PointerEvent) => {
      watch(e.clientX, e.clientY, 3);
      earAt = now(); // it hears the tap
    };
    const onScroll = () => {
      if (now() - mouseAt < 2) return; // with a mouse it keeps its eyes on the cursor
      watch(window.innerWidth / 2, window.innerHeight * 0.7, 1.6);
    };
    const onLeave = () => {
      attentionUntil = 0;
      pointerX = pointerY = -1e4;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    document.documentElement.addEventListener("mouseleave", onLeave);

    /** Seated: the head, eyes, ears and tail tip. Only touches the DOM when something visibly changes. */
    const watchFrame = (t: number, dt: number) => {
      let yawT: number;
      let pitchT: number;
      const attentive = t < attentionUntil;
      if (attentive) {
        yawT = clampTo(Math.atan2(gazeX - headX, VIEW_DISTANCE), -MAX_WATCH_YAW, MAX_WATCH_YAW);
        pitchT = clampTo(Math.atan2(gazeY - headY, VIEW_DISTANCE * 1.25), -PITCH_UP, PITCH_DOWN);
        nextGlanceAt = t + 1.2;
      } else {
        if (t >= nextGlanceAt) {
          const options = GLANCES.filter((g) => g !== glance);
          glance = options[Math.floor(Math.random() * options.length)];
          if (glance === GLANCES[0]) slowBlinkAt = t + 0.5;
          nextGlanceAt = t + 1.8 + Math.random() * 2.6;
        }
        [yawT, pitchT] = glance;
      }
      // Snappy when tracking something, lazy when just looking about.
      const rate = attentive ? 9 : 3.5;
      yaw = approach(yaw, yawT, rate, dt);
      pitch = approach(pitch, pitchT, rate, dt);

      // Cursor right by its face: a happy squint, leaning in. A cursor that stops after moving: a curious head tilt.
      const close = t - mouseAt < ATTENTION_S && Math.hypot(pointerX - headX, pointerY - headY) < PET_RADIUS;
      pet = approach(pet, close ? 1 : 0, 5, dt);
      const still = t - movedAt;
      curious = approach(curious, attentive && still > 0.9 && still < 2.8 ? 1 : 0, 4, dt);
      const tiltSign = Math.floor(movedAt) % 2 ? 1 : -1;
      tilt = approach(tilt, 9 * curious * tiltSign + 7 * pet, 6, dt);

      if (t >= nextBlink) {
        blinkAt = t;
        nextBlink = t + 3 + Math.random() * 3.5;
      }
      const slowBlink = smooth((t - slowBlinkAt) / 0.3) * (1 - smooth((t - slowBlinkAt - 0.75) / 0.4));
      const eyeOpen = Math.min(1 - 0.94 * pulse(t, blinkAt, 0.16), 1 - 0.94 * slowBlink, 1 - 0.88 * pet);

      if (t >= nextEar) {
        earAt = t;
        nextEar = t + 5 + Math.random() * 6;
      }
      const ear = -14 * pulse(t, earAt, 0.22);

      const values = [yaw, pitch, tilt, eyeOpen, ear];
      const moved = values.some((v, i) => Math.abs(v - written[i]) > (i < 2 ? 0.002 : i === 3 ? 0.005 : 0.05));
      if (moved) {
        written = values;
        placeHead(0, SEATED_HEAD_Y, tilt, yaw, pitch, eyeOpen, ear);
      }

      // Now and then the tip of the tail lifts and twitches.
      if (t >= nextFlick) {
        flickAt = t;
        nextFlick = t + 4 + Math.random() * 5;
      }
      // (pulse() ends on sin(π) ≈ 1e-16, not 0, hence the threshold.)
      const flick = pulse(t, flickAt, 0.9);
      const flicking = flick > 0.001;
      if (flicking || tipDrawn) {
        const sway = 1.6 * Math.sin(2 * Math.PI * 2.4 * (t - flickAt)) * flick;
        wrapTipPath.setAttribute("d", flicking ? wrapTip(flick, sway) : WRAP_TIP);
        tipDrawn = flicking;
      }
    };

    const frame = (ms: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, last ? (ms - last) / 1000 : 0);
      last = ms;
      clock += dt;
      stageT += dt;

      if (stage === "wait") {
        if (stageT < START_DELAY_S) return;
        if (!plan()) {
          stageT = START_DELAY_S - 0.5; // not laid out yet: look again shortly
          return;
        }
        cat.style.visibility = "visible";
        go("walk");
      }

      if (stage === "watch") {
        watchFrame(now(), dt);
        return;
      }

      let theta = 0;
      let arc = 0;
      let speed = 0;
      let stepping = 0;
      let sit = 0;
      let look = WALK_LOOK;
      let drop = 0;

      if (stage === "walk") {
        const remaining = -TURN_ARC - cx;
        speed = remaining < DECEL ? Math.max(0.18, Math.sqrt(remaining / DECEL)) : 1;
        const step = SPEED * speed * dt;
        const moved = Math.min(step, remaining);
        cx += moved;
        phase += moved / CYCLE;
        cat.style.opacity = fade ? f(smooth((cx - startX) / FADE_IN), 3) : "1";
        if (step >= remaining) go("turn");
      } else if (stage === "turn") {
        const e = ease(stageT / TURN_S);
        theta = (Math.PI / 2) * e;
        arc = TURN_ARC * Math.sin(theta);
        speed = 0.35;
        stepping = 1;
        phase += dt * 1.1;
        look = WALK_LOOK * Math.cos(theta);
        if (stageT >= TURN_S) go("sit");
      } else {
        // sit
        theta = Math.PI / 2;
        arc = TURN_ARC;
        look = 0;
        sit = ease(stageT / SIT_S);
        drop = 2.5 * pulse(stageT, 0.1, 0.6) + (SEATED_HEAD_Y - FRONT_HEAD_Y) * sit; // a little dip as it settles
      }

      if (clock >= nextBlink) {
        blinkAt = clock;
        nextBlink = clock + 3 + Math.random() * 3.5;
      }
      const eyeOpen = 1 - 0.94 * pulse(clock, blinkAt, 0.16);

      const x = cx + arc;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const bob = placeBody(x, theta, phase, speed, stepping, sit, clock);
      yaw = Math.max(-1, Math.min(1, look * HEAD_TURN)) * MAX_YAW;
      placeHead(x + HEAD_AHEAD * c, mix(HEAD_Y, FRONT_HEAD_Y, s) + bob * 1.3 + drop, 0, yaw, 0, eyeOpen, 0);

      if (stage === "sit" && stageT >= SIT_S) {
        placeBody(0, Math.PI / 2, phase, 0, 0, 1, clock);
        cat.style.opacity = "1";
        measure();
        const t = now();
        nextBlink = t + 1.5;
        nextEar = t + 3;
        nextFlick = t + 2.5;
        nextGlanceAt = t + 0.8;
        go("watch");
      }
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={VIEWBOX}
      aria-hidden
      // Behind the logo (−z inside the header's stacking context), so it walks in behind the lettering.
      className="pointer-events-none absolute bottom-1 left-full -z-10 -ml-1 h-9.5 w-6.5 overflow-visible lg:bottom-1.5 lg:h-12 lg:w-8.25"
    >
      <CatDefs id="navcat" />

      <g data-part="cat" style={{ visibility: "hidden" }}>
        <ellipse data-part="shadow" fill={PAINT.shadow} />

        <CatSide paint={PAINT} />

        {/* Front view: standing as it turns towards you, then seated */}
        <g data-part="front" strokeLinecap="round" style={{ opacity: 0 }}>
          <g data-part="stand-tail" fill={PAINT.tail}>
            <path d={FRONT_TAIL[0]} />
            <path d={FRONT_TAIL[1]} />
          </g>
          <path data-part="wrap-base" d={WRAP_BASE} fill={WRAP_FUR} style={{ opacity: 0 }} />
          {[0, 1].map((i) => (
            <ellipse key={i} data-part={`haunch-${i}`} />
          ))}
          {[0, 1].map((i) => (
            <g key={i}>
              <line data-part={`hind-leg-${i}`} strokeWidth="4.8" />
              <ellipse data-part={`hind-foot-${i}`} />
            </g>
          ))}
          <ellipse data-part="neck" fill={PAINT.fur} />
          <ellipse data-part="chest" fill={PAINT.fur} />
          <path data-part="bib" fill={PAINT.white} d="M-4.5 83.5C-7 92 -6.5 104 0 110.5C6.5 104 7 92 4.5 83.5Z" />
          {[-1, 1].map((sideSign, i) => (
            <g key={sideSign} data-part={`front-paw-${i}`}>
              <line x1={4.5 * sideSign} y1="104" x2={4.7 * sideSign} y2="124" stroke={PAINT.fur} strokeWidth="5.8" />
              <line x1={4.7 * sideSign} y1="123.5" x2={4.9 * sideSign} y2="127.3" stroke={PAINT.sock} strokeWidth="5" />
              <ellipse cx={5 * sideSign} cy="129.4" rx="3.5" ry="2.4" fill={PAINT.sock} />
            </g>
          ))}
          <path data-part="wrap-tip" d={WRAP_TIP} fill={WRAP_FUR} style={{ opacity: 0 }} />
        </g>

        <CatHead paint={PAINT} />
      </g>
    </svg>
  );
}
