"use client";

import { useEffect, useRef } from "react";

/*
 * A white cat that roams around the bottle: it strolls in from the left behind the glass, comes out on the
 * right, turns round towards you (a curious look at the bottle, a head tilt and a slow blink), then trots back past the
 * front of the bottle and off to the left.
 *
 * The overlay shares <BottleVisual>'s viewBox, so the cat scales with the bottle. While it is behind the bottle the
 * overlay sits under it (z-index −1 inside the isolated bottle container); it moves in front once it has come round.
 *
 * The turn blends two drawings — the side view narrows as the cat faces you while a front view widens — pivoting on
 * the chest, so the hindquarters swing round like a real cat turning. The head is modelled in 3D: its features sit on
 * a rounded skull and are projected for wherever the cat is looking, so it turns from profile to face-on like a real
 * head. A fine displacement filter roughens the edges of the fur.
 *
 * Legs are solved with two-bone IK and the stride advances with distance walked, so planted paws never slide.
 * Everything runs in one requestAnimationFrame loop that writes attributes directly — React never re-renders.
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

// Cat space: the side view is drawn facing right, paws resting on GROUND.
const GROUND = 132;
const PAW_RY = 2.6;
const CHEST_X = 146;
const BODY_X = 114;
const HEAD_AHEAD = 13;
const HEAD_Y = 71; // centre of the skull, walking
const FRONT_HEAD_Y = 74; // … and standing face-on
const NOSE_AHEAD = 33; // chest → front of the head
const TAIL_BEHIND = 110; // chest → end of the tail
const TAIL_ROOT = [78, 81] as const;
const THIGH = [12, 7.5] as const; // half length and half thickness of the thigh muscle
const TAIL_JOINT = [60, 64] as const;

const CYCLE = 40; // cat units travelled per full stride
const DUTY = 0.62; // share of the stride each paw spends on the ground
const STRIDE = CYCLE * DUTY;
const SPEED = 70; // cat units per second — a light trot
const DECEL = 55; // bottle units over which it slows before turning
const ACCEL = 40; // bottle units over which it gets back up to speed
const WALK_LOOK = 0.5; // how far the face turns towards the way it is walking

const FIRST_VISIT_S = 2;
const TURN_S = 1;
const POSE_S = 2.8;

const FUR = "url(#cat-fur)";
const HEAD_FUR = "url(#cat-head)";
const TAIL_FUR = "url(#cat-tail)";
const WHITE = "url(#cat-white)";
const SOCK = "url(#cat-sock)";
const FAR_FUR = "#b4b0a9";
const FAR_WHITE = "#aeaaa3";

type Leg = {
  root: [number, number];
  neutral: number;
  upper: number;
  lower: number;
  paw: number;
  /** 1 = the middle joint points forward (knee), -1 = backward (elbow). */
  bend: 1 | -1;
  /** Phase offset in the stride; touch-down happens when (phase + offset) wraps to 0. */
  offset: number;
  lift: number;
  /** Paw segment angles in degrees (positive curls the toes back): resting, heel up at push-off, curled mid-swing. */
  rest: number;
  push: number;
  curl: number;
  /** The shoulder blade slides down as the leg reaches, so the foreleg can stand straight. */
  slide: number;
  widths: [number, number, number];
  /** How much of the paw segment is white. */
  sock: number;
  far: boolean;
};

const HIND = { upper: 16, lower: 14, paw: 11, bend: 1, lift: 5.5, rest: -8, push: -32, curl: 40, slide: 0, widths: [12, 6.6, 5.4], sock: 0.65 } as const;
const FORE = { upper: 6, lower: 18, paw: 7, bend: -1, lift: 6, rest: 0, push: -28, curl: 70, slide: 4, widths: [8, 6.2, 5.4], sock: 0.55 } as const;

/** Cats walk in a lateral sequence: near hind, near fore, far hind, far fore — a quarter stride apart. */
const LEGS: Leg[] = [
  { ...HIND, widths: [...HIND.widths], root: [87, 95], neutral: 91, offset: 0.5, far: true },
  { ...FORE, widths: [...FORE.widths], root: [141, 99], neutral: 142, offset: 0.25, far: true },
  { ...HIND, widths: [...HIND.widths], root: [84, 96], neutral: 88, offset: 0, far: false },
  { ...FORE, widths: [...FORE.widths], root: [138, 100], neutral: 139, offset: 0.75, far: false },
];

type Foot = { x: number; y: number; angle: number };
type Stage = "away" | "enter" | "turn1" | "pose" | "turn2" | "leave";
type Point = readonly [number, number];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
const ease = (v: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (deg: number) => (deg * Math.PI) / 180;
const pulse = (t: number, start: number, length: number) => Math.sin(Math.PI * clamp01((t - start) / length));
const f = (n: number, digits = 2) => n.toFixed(digits);

/** A cubic Bézier drawn as an outline that narrows from `from` to `to` wide and ends in a round cap — a tail. */
function taper([p0, p1, p2, p3]: Point[], from: number, to: number) {
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const u = 1 - t;
    const at = (k: 0 | 1) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k];
    const slope = (k: 0 | 1) => 3 * u * u * (p1[k] - p0[k]) + 6 * u * t * (p2[k] - p1[k]) + 3 * t * t * (p3[k] - p2[k]);
    const dx = slope(0);
    const dy = slope(1);
    // sqrt rather than hypot: exact in every engine, so the server and browser agree on the path
    const r = mix(from, to, t) / 2 / Math.sqrt(dx * dx + dy * dy);
    left.push(`${f(at(0) - dy * r)} ${f(at(1) + dx * r)}`);
    right.unshift(`${f(at(0) + dy * r)} ${f(at(1) - dx * r)}`);
  }
  const cap = f(to / 2);
  return `M${left.join("L")}A${cap} ${cap} 0 0 0 ${right[0]}L${right.join("L")}Z`;
}

// A short question-mark tail: up from the rump, the tip hooked forward.
const SIDE_TAIL = [
  taper([TAIL_ROOT, [69, 80], [62, 74], TAIL_JOINT], 7.4, 6.2),
  taper([TAIL_JOINT, [58.5, 55], [61, 47.5], [67.5, 45]], 6.2, 3.6),
];
const FRONT_TAIL = [
  taper([[0, 100], [1, 91], [-2, 82], [0, 74]], 7, 6),
  taper([[0, 74], [2.5, 66], [8, 61.5], [13.5, 62]], 6, 3.6),
];

/*
 * Head space: origin at the centre of the skull, z towards you when the cat faces you. Paired features are given for
 * the side on your right; surfaces that foreshorten carry the direction they face as [x, z].
 */
const SKULL = { halfWidth: 11, halfHeight: 9.8, halfDepth: 8.5 };
const SNOUT = { y: 3, z: 6.5, halfWidth: 7.5, halfDepth: 6 }; // the face juts forward of the round skull
const NECK = 3.5; // the head turns about the top of the neck, this far behind the centre of the skull
const CHEEK = [7, 3.8, 3.2] as const;
const MUZZLE = [2.8, 4.8, 9.4] as const;
const PAD = [4, 4.6, 9] as const; // where the whiskers grow
const EYE = [4.5, -1.2, 8.3] as const;
const EYE_FACING = [0.25, 0.97] as const;
const EAR = [6.6, -7.2, 0.5] as const;
const EAR_FACING = [0.35, 0.94] as const;
const NOSE = [0, 2.3, 12.3] as const;
const CHIN = [0, 7.8, 7.8] as const;
const BLAZE = [0, 0.8, 10] as const;
/** `look` → head yaw: while walking it looks mostly where it is going; looking at the bottle is a full profile. */
const HEAD_TURN = 1.2;
const MAX_YAW = rad(85);

// Drawn for the ear and eye on your right (outer corner of the eye up, ear leaning out); mirrored for the other.
const EAR_SHAPE = "M-4.6 1.5C-3.9 -3 -1.2 -8 1.8 -10.6C2.4 -11.1 3.1 -10.9 3.4 -10.2C4.6 -6.6 5.4 -2.6 5.2 1.5Z";
const EAR_INSIDE = "M-2.9 0.8C-2.3 -2.6 -0.2 -6.4 2 -8.6C3 -6 3.7 -2.6 3.6 0.8Z";
const EYE_SHAPE = "M-2.6 0.4C-1.9 -1.6 1 -2.3 2.6 -0.7C2 1.4 -0.5 2.1 -2.6 0.4Z";

/** Where a paw sits at a given point of the stride, in cat space. */
function gaitFoot(leg: Leg, phase: number): Foot {
  const p = (((phase + leg.offset) % 1) + 1) % 1;
  const ground = GROUND - PAW_RY;
  if (p < DUTY) {
    // Planted: the body walks over the paw, and the heel peels up just before lift-off.
    const s = p / DUTY;
    return {
      x: leg.neutral + STRIDE / 2 - s * STRIDE,
      y: ground,
      angle: mix(leg.rest, leg.push, smooth((s - 0.55) / 0.45)),
    };
  }
  // Swinging forward: lifted in an arc, toes curled back, flat again before landing.
  const u = (p - DUTY) / (1 - DUTY);
  return {
    x: leg.neutral - STRIDE / 2 + STRIDE * smooth(u),
    y: ground - leg.lift * Math.sin(Math.PI * u),
    angle: mix(leg.push, leg.rest, u) + leg.curl * Math.sin(Math.PI * Math.min(1, u * 1.15)),
  };
}

/** Two-bone IK from the hip/shoulder to the ankle, with the paw segment hanging below at `foot.angle`. */
function solveLeg(leg: Leg, foot: Foot, bob: number) {
  const a = rad(foot.angle);
  const ankle = [foot.x + leg.paw * Math.sin(a), foot.y - leg.paw * Math.cos(a)];
  const reach = (foot.x - leg.neutral) / (STRIDE / 2);
  const root = [leg.root[0], leg.root[1] + bob + leg.slide * Math.min(1, reach * reach)];
  const dx = ankle[0] - root[0];
  const dy = ankle[1] - root[1];
  const dist = Math.min(Math.hypot(dx, dy), leg.upper + leg.lower - 0.01);
  const cos = (leg.upper ** 2 + dist ** 2 - leg.lower ** 2) / (2 * leg.upper * dist);
  const angle = Math.atan2(dy, dx) - leg.bend * Math.acos(Math.max(-1, Math.min(1, cos)));
  const joint = [root[0] + leg.upper * Math.cos(angle), root[1] + leg.upper * Math.sin(angle)];
  return [root, joint, ankle, [foot.x, foot.y]];
}

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
    const pair = (name: string) => [part(`${name}-0`), part(`${name}-1`)];
    const cat = part("cat");
    const shadow = part("shadow");
    const side = part("side");
    const sideBody = part("side-body");
    const tailBase = part("tail-base");
    const tailTip = part("tail-tip");
    const front = part("front");
    const frontTail = part("front-tail");
    const frontPaws = pair("front-paw");
    const head = part("head");
    const skull = part("skull");
    const headShadow = part("head-shadow");
    const snout = part("snout");
    const blaze = part("blaze");
    const chin = part("chin");
    const nose = part("nose");
    const earSlot = part("ears");
    const earTwitch = part("ear-twitch");
    const ears = pair("ear");
    const earInsides = pair("ear-inside");
    const cheeks = pair("cheek");
    const muzzles = pair("muzzle");
    const eyes = pair("eye");
    const lids = pair("lid");
    const closedEyes = part("eyes-closed");
    const whiskers = pair("whiskers");
    const legs = LEGS.map((_, i) => {
      const g = svg.querySelector(`[data-leg="${i}"]`) as SVGGElement;
      return { g, lines: [...g.querySelectorAll("line")], paw: g.querySelector("[data-paw]")!, thigh: g.querySelector("[data-thigh]") };
    });

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

    /** Turns the head: every feature is projected from head space for this yaw (0 = facing you, + = to your right). */
    const turnHead = (yaw: number, eyeOpen: number, earFlick: number) => {
      const yc = Math.cos(yaw);
      const ys = Math.sin(yaw);
      const across = (x: number, z: number) => f(x * yc + (z + NECK) * ys);
      const facing = (x: number, z: number) => z * yc - x * ys;

      skull.setAttribute("cx", across(0, 0));
      headShadow.setAttribute("cx", across(0, 0));
      skull.setAttribute("rx", f(Math.hypot(SKULL.halfWidth * yc, SKULL.halfDepth * ys)));
      snout.setAttribute("cx", across(0, SNOUT.z));
      snout.setAttribute("rx", f(Math.hypot(SNOUT.halfWidth * yc, SNOUT.halfDepth * ys)));
      blaze.setAttribute("cx", across(0, BLAZE[2]));
      blaze.setAttribute("rx", f(2 * Math.max(0, yc)));
      chin.setAttribute("cx", across(0, CHIN[2]));
      nose.setAttribute("transform", `translate(${across(0, NOSE[2])} ${NOSE[1]}) scale(${f(Math.max(0.35, yc), 3)} 1)`);
      earTwitch.setAttribute("transform", `rotate(${f(-earFlick)})`);
      [0, 1].forEach((i) => {
        const m = i ? 1 : -1;
        cheeks[i].setAttribute("cx", across(m * CHEEK[0], CHEEK[2]));
        muzzles[i].setAttribute("cx", across(m * MUZZLE[0], MUZZLE[2]));
        // Eyes foreshorten as they turn away and vanish round the side of the head.
        const eyeWidth = f(m * clamp01(facing(m * EYE_FACING[0], EYE_FACING[1])), 3);
        const eyeAt = `translate(${across(m * EYE[0], EYE[2])} ${EYE[1]})`;
        eyes[i].setAttribute("transform", `${eyeAt} scale(${eyeWidth} ${f(Math.max(0.06, eyeOpen), 3)})`);
        lids[i].setAttribute("transform", `${eyeAt} scale(${eyeWidth} 1)`);
        // Ears narrow edge-on; past that you see their furry backs.
        const ear = facing(m * EAR_FACING[0], EAR_FACING[1]);
        ears[i].setAttribute("transform", `translate(${across(m * EAR[0], EAR[2])} ${EAR[1]}) scale(${f(m * Math.max(0.55, Math.abs(ear)), 3)} 1)`);
        earInsides[i].style.opacity = f(smooth(ear / 0.3));
        whiskers[i].setAttribute("transform", `translate(${across(m * PAD[0], PAD[2])} ${PAD[1]}) scale(${f(m * yc + 0.35 * ys, 3)} 1)`);
      });
      // The far ear goes behind the near one.
      const farEar = ears[yaw > 0 ? 1 : 0];
      if (earSlot.firstChild !== farEar) earSlot.insertBefore(farEar, earSlot.firstChild);
      closedEyes.style.opacity = f(1 - smooth(eyeOpen / 0.35));
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
        sideBody.setAttribute("transform", `translate(0 ${f(bob)})`);
        const sway = 2 * Math.PI * 0.45 * clock;
        tailBase.setAttribute("transform", `rotate(${f(-3 + 5 * Math.sin(sway) + 3 * Math.sin(2 * Math.PI * phase) * speed)} ${TAIL_ROOT})`);
        tailTip.setAttribute("transform", `rotate(${f(10 * Math.sin(sway - 1.1))} ${TAIL_JOINT})`);
        LEGS.forEach((leg, i) => {
          const foot = gaitFoot(leg, phase);
          const [root, joint, ankle, toe] = solveLeg(leg, foot, bob);
          // The thigh muscle rides along the upper bone. Drawn as a rotated-ellipse path rather than with a transform,
          // so it shades from the same user-space gradient as the body.
          if (legs[i].thigh) {
            const ux = (joint[0] - root[0]) / leg.upper;
            const uy = (joint[1] - root[1]) / leg.upper;
            const mx = (root[0] + joint[0]) / 2 - 2 * ux;
            const my = (root[1] + joint[1]) / 2 - 2 * uy;
            const ends = [`${f(mx - THIGH[0] * ux)} ${f(my - THIGH[0] * uy)}`, `${f(mx + THIGH[0] * ux)} ${f(my + THIGH[0] * uy)}`];
            const arc = `A${THIGH[0]} ${THIGH[1]} ${f((Math.atan2(uy, ux) * 180) / Math.PI)} 1 0`;
            legs[i].thigh.setAttribute("d", `M${ends[0]}${arc} ${ends[1]}${arc} ${ends[0]}Z`);
          }
          // The white sock covers the lower part of the paw segment.
          const sockTop = [mix(toe[0], ankle[0], leg.sock), mix(toe[1], ankle[1], leg.sock)];
          [[root, joint], [joint, ankle], [ankle, toe], [sockTop, toe]].forEach(([from, to], seg) => {
            const line = legs[i].lines[seg];
            line.setAttribute("x1", f(from[0]));
            line.setAttribute("y1", f(from[1]));
            line.setAttribute("x2", f(to[0]));
            line.setAttribute("y2", f(to[1]));
          });
          legs[i].paw.setAttribute("transform", `translate(${f(foot.x)} ${f(foot.y)}) rotate(${f(foot.angle * 0.8)})`);
        });
        // The front view brings its own forelegs, so these fade out as it appears.
        legs[1].g.style.opacity = legs[3].g.style.opacity = f(1 - frontAlpha);
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

  const leg = (i: number) => {
    const { widths, far, bend } = LEGS[i];
    const fur = far ? FAR_FUR : FUR;
    const sock = far ? FAR_WHITE : SOCK;
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
    <svg
      ref={svgRef}
      viewBox={VIEWBOX}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      <defs>
        {/* White fur, lit from above and shaded warm grey underneath; shared in user space so every body part shades as one */}
        <linearGradient id="cat-fur" gradientUnits="userSpaceOnUse" x1="0" y1="74" x2="0" y2="118">
          <stop offset="0" stopColor="#f6f4f0" />
          <stop offset="0.5" stopColor="#e6e3dd" />
          <stop offset="1" stopColor="#cfcbc4" />
        </linearGradient>
        <linearGradient id="cat-tail" gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="90">
          <stop offset="0" stopColor="#f1eee9" />
          <stop offset="1" stopColor="#d6d2cb" />
        </linearGradient>
        <linearGradient id="cat-head" gradientUnits="userSpaceOnUse" x1="0" y1="-14" x2="0" y2="12">
          <stop offset="0" stopColor="#f8f6f2" />
          <stop offset="1" stopColor="#d9d5ce" />
        </linearGradient>
        <linearGradient id="cat-white" gradientUnits="userSpaceOnUse" x1="0" y1="80" x2="0" y2="116">
          <stop offset="0" stopColor="#fdfcfa" />
          <stop offset="1" stopColor="#dedad4" />
        </linearGradient>
        <linearGradient id="cat-sock" gradientUnits="userSpaceOnUse" x1="0" y1="112" x2="0" y2="132">
          <stop offset="0" stopColor="#f4f2ee" />
          <stop offset="1" stopColor="#d3cfc8" />
        </linearGradient>
        <linearGradient id="cat-muzzle" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="10">
          <stop offset="0" stopColor="#fdfcfa" />
          <stop offset="1" stopColor="#e0ddd7" />
        </linearGradient>
        <linearGradient id="cat-ear" gradientUnits="userSpaceOnUse" x1="0" y1="-9" x2="0" y2="1">
          <stop offset="0" stopColor="#f1c3c6" />
          <stop offset="1" stopColor="#cc959a" />
        </linearGradient>
        <radialGradient id="cat-iris">
          <stop offset="0" stopColor="#e2d774" />
          <stop offset="0.35" stopColor="#d6b44a" />
          <stop offset="0.8" stopColor="#a8742a" />
          <stop offset="1" stopColor="#4a3313" />
        </radialGradient>
        <radialGradient id="cat-shadow">
          <stop offset="0" stopColor="#000" stopOpacity="0.5" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <clipPath id="cat-eye">
          <path d={EYE_SHAPE} />
        </clipPath>
        {/* Roughens edges into fur; the grain lives in each part's own space, so it moves with the cat */}
        <filter id="cat-fuzz" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      <g data-part="cat" style={{ visibility: "hidden" }}>
        <ellipse data-part="shadow" fill="url(#cat-shadow)" />

        {/* Side view */}
        <g data-part="side" strokeLinecap="round">
          {leg(0)}
          {leg(1)}
          <g data-part="side-body" filter="url(#cat-fuzz)">
            <g data-part="tail-base" fill={TAIL_FUR}>
              <path d={SIDE_TAIL[0]} />
              <g data-part="tail-tip">
                <circle cx={TAIL_JOINT[0]} cy={TAIL_JOINT[1]} r="3.1" />
                <path d={SIDE_TAIL[1]} />
              </g>
            </g>
            <g fill={FUR}>
              {/* Neck, mostly hidden by the head */}
              <path d="M138 82C140 75 145 69 152 66L164 70C165 78 162 86 156 90Z" />
              {/* Deep chest, level back, belly tucked up in front of the thigh */}
              <path d="M76 90C75 83 80 77.5 88 76.5C102 75.5 112 79.5 124 79C134 78.5 142 76.5 149 78.5C157 81 160 89 158 96C156 102.5 149 106 141 105.5C131 105 120 101.5 110 100C103 99 98 100 95 103C88 109 77 103 76 90Z" />
              <ellipse cx="87.5" cy="93.5" rx="12" ry="12.5" />
              <ellipse cx="147" cy="93.5" rx="11" ry="11.5" />
            </g>
            {/* White throat and chest */}
            <path fill={WHITE} d="M151.5 81C156.5 83 159.5 89 158.3 95.5C157.3 100.5 153.5 104.5 148.5 105C147.5 98 147.5 88 151.5 81Z" />
          </g>
          {leg(2)}
          {leg(3)}
        </g>

        {/* Front view — seen while it turns towards you */}
        <g data-part="front" strokeLinecap="round" style={{ opacity: 0 }}>
          <g filter="url(#cat-fuzz)">
            <g data-part="front-tail" fill={TAIL_FUR}>
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
          <g filter="url(#cat-fuzz)">
            {/* Neck, seen when the head turns aside */}
            <ellipse cy="82" rx="7.5" ry="8" fill={FUR} />
            <ellipse cy="97" rx="11" ry="14.5" fill={FUR} />
            <path fill={WHITE} d="M-4.5 83.5C-7 92 -6.5 104 0 110.5C6.5 104 7 92 4.5 83.5Z" />
          </g>
          {[-1, 1].map((sideSign, i) => (
            <g key={sideSign} data-part={`front-paw-${i}`}>
              <line x1={4.5 * sideSign} y1="104" x2={4.7 * sideSign} y2="124" stroke={FUR} strokeWidth="5.8" />
              <line x1={4.7 * sideSign} y1="123.5" x2={4.9 * sideSign} y2="127.3" stroke={SOCK} strokeWidth="5" />
              <ellipse cx={5 * sideSign} cy="129.4" rx="3.5" ry="2.4" fill={SOCK} />
            </g>
          ))}
        </g>

        {/* Head — every feature is placed each frame by turnHead() */}
        <g data-part="head">
          <ellipse data-part="head-shadow" cy="7" rx="12" ry="9.5" fill="url(#cat-shadow)" />
          <g filter="url(#cat-fuzz)">
            <g data-part="ears" fill={HEAD_FUR}>
              {[0, 1].map((i) => (
                <g key={i} data-part={`ear-${i}`}>
                  <g data-part={i ? "ear-twitch" : undefined}>
                    <path d={EAR_SHAPE} />
                    <g data-part={`ear-inside-${i}`}>
                      <path d={EAR_INSIDE} fill="url(#cat-ear)" />
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
            <g fill={HEAD_FUR}>
              <ellipse data-part="cheek-0" cy={CHEEK[1]} rx="6" ry="5.4" />
              <ellipse data-part="cheek-1" cy={CHEEK[1]} rx="6" ry="5.4" />
              <ellipse data-part="skull" ry={SKULL.halfHeight} />
              <ellipse data-part="snout" cy={SNOUT.y} ry="6" />
            </g>
            <g fill="url(#cat-muzzle)">
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
              <g clipPath="url(#cat-eye)">
                <circle cx="0.1" cy="-0.15" r="2.15" fill="url(#cat-iris)" />
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
      </g>
    </svg>
  );
}
