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
  TAIL_BEHIND,
  WALK_LOOK,
  clamp01,
  createHeadRig,
  createSideRig,
  ease,
  f,
  mix,
  pulse,
  smooth,
} from "@/components/cat/rig";

/*
 * A white cat that roams around the bottle: it strolls in from the left behind the glass, comes out on the
 * right, turns round towards you (a curious look at the bottle, a head tilt and a slow blink), then trots back past the
 * front of the bottle and off to the left.
 *
 * The overlay shares <BottleVisual>'s viewBox, so the cat scales with the bottle. While it is behind the bottle the
 * overlay sits under it (z-index −1 inside the isolated bottle container); it moves in front once it has come round.
 *
 * The turn blends two drawings — the side view narrows as the cat faces you while a front view widens — pivoting on
 * the chest, so the hindquarters swing round like a real cat turning. A fine displacement filter roughens the edges of
 * the fur. The cat itself (proportions, gait, 3D head) is shared with the header cat: see components/cat.
 */

// Bottle space — keep in sync with BottleVisual's viewBox, glass outline and floor shadow.
const VIEWBOX = "0 -40 300 510";
const BOTTLE_MID_X = 150;
/** Where the chest is when the cat turns round: just clear of the glass on the right. */
const TURN_X = 266;
const TURN_ARC = 12;
const BACK_Y = 380; // floor line behind the bottle
const FRONT_Y = 404; // floor line in front of it
const BACK_DEPTH = 0.8; // size behind the bottle relative to in front
/** Cat units → bottle units. */
const SCALE = 1;

const SPEED = 70; // cat units per second — a light trot
const DECEL = 55; // bottle units over which it slows before turning
const ACCEL = 40; // bottle units over which it gets back up to speed

const FIRST_VISIT_S = 2;
const TURN_S = 1;
const POSE_S = 2.8;

/** The fur filter, desktop only: at phone size it can't be seen and costs a filter pass every frame. */
const FUZZ = "lg:[filter:url(#cat-fuzz)]";
const PAINT = catPaint("cat");

type Stage = "away" | "enter" | "turn1" | "pose" | "turn2" | "leave";

export function WalkingCat() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Visits only count down while the bottle is on screen, so you don't miss the first one scrolling down to it.
    let onScreen = false;
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    observer.observe(svg);

    const part = (name: string) => svg.querySelector(`[data-part="${name}"]`) as SVGElement;
    const cat = part("cat");
    const shadow = part("shadow");
    const side = part("side");
    const front = part("front");
    const frontTail = part("front-tail");
    const frontPaws = [part("front-paw-0"), part("front-paw-1")];
    const head = part("head");
    const sideRig = createSideRig(svg);
    const turnHead = createHeadRig(svg);

    let stage: Stage = "away";
    let stageT = 0;
    let waitFor = FIRST_VISIT_S;
    let clock = 0;
    let cx = 0; // chest position, bottle units
    let exitX = 0;
    let phase = 0;
    let travelled = 0;
    let nextBlink = 2.5;
    let blinkAt = -1;
    let raf = 0;
    let last = 0;

    const go = (next: Stage) => {
      stage = next;
      stageT = 0;
    };

    /** Works out where the left edge of the screen is, in bottle units, for this visit. */
    const plan = () => {
      const ctm = svg.getScreenCTM();
      if (!ctm) return false;
      const screenLeft = -ctm.e / ctm.a;
      cx = screenLeft - NOSE_AHEAD * SCALE * BACK_DEPTH - 12;
      exitX = screenLeft - TAIL_BEHIND * SCALE - 12;
      return cx < TURN_X - 60;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
      last = now;
      clock += dt;
      stageT += dt;

      if (stage === "away") {
        if (!onScreen) stageT = 0;
        if (stageT >= waitFor) {
          if (plan()) {
            phase = 0;
            svg.style.zIndex = "-1"; // starts behind the bottle
            cat.style.visibility = "visible";
            go("enter");
          } else {
            // Not laid out yet: look again shortly.
            stageT = 0;
            waitFor = 2;
          }
        }
        return;
      }

      let theta = 0; // 0 = facing right, π/2 = facing you, π = facing left
      let depth = 0; // 0 = behind the bottle, 1 = in front
      let arc = 0;
      let speed = 0;
      let look = WALK_LOOK;
      let tilt = 0;
      let eyeOpen = 1;
      let ear = 0;
      let tail = -40;
      let stepping = 0;
      let breathe = 0;

      if (stage === "enter") {
        const remaining = TURN_X - cx;
        speed = remaining < DECEL ? Math.max(0.18, Math.sqrt(remaining / DECEL)) : 1;
        const step = SPEED * SCALE * BACK_DEPTH * speed * dt;
        const moved = Math.min(step, remaining);
        cx += moved;
        phase += moved / (SCALE * BACK_DEPTH * CYCLE);
        if (step >= remaining) go("turn1");
      } else if (stage === "turn1" || stage === "turn2") {
        const first = stage === "turn1";
        const e = ease(stageT / TURN_S);
        theta = (Math.PI / 2) * (first ? e : 1 + e);
        // A real U-turn: it swings out a little and steps towards you as it comes round.
        depth = first ? 0.5 * e : 0.5 + 0.5 * e;
        arc = TURN_ARC * Math.sin(theta);
        speed = 0.35;
        stepping = 1;
        phase += dt * 1.1;
        look = WALK_LOOK * Math.cos(theta);
        tail = first ? -40 : 40;
        if (stageT >= TURN_S) {
          if (first) {
            svg.style.zIndex = "1"; // clear of the glass now, so step in front of it
            go("pose");
          } else {
            travelled = 0;
            go("leave");
          }
        }
      } else if (stage === "pose") {
        const t = stageT;
        theta = Math.PI / 2;
        depth = 0.5;
        arc = TURN_ARC;
        // Looks back at the bottle and sniffs, then turns to you: head tilt and a slow blink.
        const atBottle = smooth(t / 0.45) * (1 - smooth((t - 1.25) / 0.35));
        const sniff = 1.8 * Math.sin(2 * Math.PI * 4 * t) * pulse(t, 0.5, 0.7);
        const curious = smooth((t - 1.6) / 0.35) * (1 - smooth((t - 2.45) / 0.35));
        look = -0.85 * atBottle;
        tilt = -5 * atBottle + sniff + 11 * curious;
        eyeOpen = 1 - smooth((t - 1.75) / 0.22) * (1 - smooth((t - 2.22) / 0.3));
        ear = -14 * pulse(t, 0.9, 0.22);
        tail = mix(-40, 40, smooth((t - 0.3) / 2.3)) + 6 * Math.sin(2 * Math.PI * 0.8 * t);
        breathe = 0.5 * Math.sin(2 * Math.PI * 0.5 * t);
        if (t >= POSE_S) go("turn2");
      } else {
        // leave
        theta = Math.PI;
        depth = 1;
        speed = Math.min(1, 0.2 + Math.sqrt(travelled / ACCEL));
        const step = SPEED * SCALE * speed * dt;
        cx -= step;
        travelled += step;
        phase += step / (SCALE * CYCLE);
        // A quick glance at you as it passes the bottle.
        const glance = Math.sin(Math.PI * clamp01((BOTTLE_MID_X + 40 - cx) / 150));
        look = -WALK_LOOK * (1 - 0.9 * glance);
        if (cx <= exitX) {
          cat.style.visibility = "hidden";
          waitFor = 5 + Math.random() * 4;
          go("away");
          return;
        }
      }

      if (clock >= nextBlink) {
        blinkAt = clock;
        nextBlink = clock + 3 + Math.random() * 3.5;
      }
      eyeOpen = Math.min(eyeOpen, 1 - 0.94 * pulse(clock, blinkAt, 0.16));

      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const k = SCALE * mix(BACK_DEPTH, 1, depth);
      const gy = mix(BACK_Y, FRONT_Y, depth);
      const x = cx + arc;
      const bob = 0.8 * Math.sin(4 * Math.PI * phase + 0.5) * speed;
      const sideAlpha = smooth((Math.abs(c) - 0.3) / 0.2);
      const frontAlpha = smooth((s - 0.84) / 0.13);

      shadow.setAttribute("cx", f(x + (BODY_X - CHEST_X) * c * k));
      shadow.setAttribute("cy", f(gy + 0.6 * k));
      shadow.setAttribute("rx", f((54 * Math.abs(c) + 22 * s) * k));
      shadow.setAttribute("ry", f(4.2 * k));

      // Side view, squeezed around the chest as the cat turns
      side.setAttribute("transform", `translate(${f(x)} ${f(gy)}) scale(${f(k * c, 4)} ${f(k, 4)}) translate(${-CHEST_X} ${-GROUND})`);
      side.style.opacity = f(sideAlpha);
      if (sideAlpha > 0) {
        sideRig.pose(phase, bob, speed, clock);
        sideRig.fadeForelegs(1 - frontAlpha);
      }

      // Front view, widening as the cat faces you
      front.setAttribute("transform", `translate(${f(x)} ${f(gy)}) scale(${f(k * s, 4)} ${f(k, 4)}) translate(0 ${-GROUND})`);
      front.style.opacity = f(frontAlpha);
      if (frontAlpha > 0) {
        frontTail.setAttribute("transform", `rotate(${f(tail)} 0 100)`);
        frontPaws.forEach((paw, i) => {
          const lift = stepping * 2.6 * Math.max(0, Math.sin(2 * Math.PI * phase + i * Math.PI));
          paw.setAttribute("transform", `translate(0 ${f(-lift)})`);
        });
      }

      // Head: turns to wherever the cat is looking
      const hx = x + HEAD_AHEAD * c * k;
      const hy = gy + (mix(HEAD_Y, FRONT_HEAD_Y, s) - GROUND + bob * 1.3 + breathe) * k;
      head.setAttribute("transform", `translate(${f(hx)} ${f(hy)}) scale(${f(k, 4)}) rotate(${f(tilt)} 0 6)`);
      turnHead(Math.max(-1, Math.min(1, look * HEAD_TURN)) * MAX_YAW, eyeOpen, ear);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={VIEWBOX}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      <CatDefs id="cat" />

      <g data-part="cat" style={{ visibility: "hidden" }}>
        <ellipse data-part="shadow" fill={PAINT.shadow} />

        {/* Side view */}
        <CatSide paint={PAINT} furClassName={FUZZ} />

        {/* Front view — seen while it turns towards you */}
        <g data-part="front" strokeLinecap="round" style={{ opacity: 0 }}>
          <g className={FUZZ}>
            <g data-part="front-tail" fill={PAINT.tail}>
              <path d={FRONT_TAIL[0]} />
              <path d={FRONT_TAIL[1]} />
            </g>
            {/* Hindquarters, set back behind the chest */}
            <g fill={FAR_FUR}>
              <ellipse cx="-9.5" cy="112" rx="6" ry="9.5" />
              <ellipse cx="9.5" cy="112" rx="6" ry="9.5" />
            </g>
          </g>
          {[-1, 1].map((sideSign) => (
            <g key={sideSign}>
              <line x1={10 * sideSign} y1="116" x2={10.6 * sideSign} y2="126.5" stroke={FAR_FUR} strokeWidth="4.8" />
              <ellipse cx={11 * sideSign} cy="129.4" rx="3.3" ry="2.3" fill={FAR_WHITE} />
            </g>
          ))}
          <g className={FUZZ}>
            {/* Neck, seen when the head turns aside */}
            <ellipse cy="82" rx="7.5" ry="8" fill={PAINT.fur} />
            <ellipse cy="97" rx="11" ry="14.5" fill={PAINT.fur} />
            <path fill={PAINT.white} d="M-4.5 83.5C-7 92 -6.5 104 0 110.5C6.5 104 7 92 4.5 83.5Z" />
          </g>
          {[-1, 1].map((sideSign, i) => (
            <g key={sideSign} data-part={`front-paw-${i}`}>
              <line x1={4.5 * sideSign} y1="104" x2={4.7 * sideSign} y2="124" stroke={PAINT.fur} strokeWidth="5.8" />
              <line x1={4.7 * sideSign} y1="123.5" x2={4.9 * sideSign} y2="127.3" stroke={PAINT.sock} strokeWidth="5" />
              <ellipse cx={5 * sideSign} cy="129.4" rx="3.5" ry="2.4" fill={PAINT.sock} />
            </g>
          ))}
        </g>

        {/* Head — every feature is placed each frame by the head rig */}
        <CatHead paint={PAINT} furClassName={FUZZ} />
      </g>
    </svg>
  );
}
