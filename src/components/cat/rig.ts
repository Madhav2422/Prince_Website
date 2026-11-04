/*
 * The white cat shared by <WalkingCat> (customise page) and <NavCat> (header): its proportions, gait, head model and
 * the runtime rigs that pose it. Drawing lives in ./CatParts.tsx.
 *
 * Cat space: the side view is drawn facing right with its paws resting on GROUND; front views are centred on x = 0.
 *
 * The head is modelled in 3D: its features sit on a rounded skull and are projected for wherever the cat is looking,
 * so it turns from profile to face-on like a real head. Legs are solved with two-bone IK and the stride advances with
 * distance walked, so planted paws never slide. Rigs write SVG attributes directly — React never re-renders.
 */

// ------------------------------------------------------------------ helpers

export type Point = readonly [number, number];

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
export const ease = (v: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const rad = (deg: number) => (deg * Math.PI) / 180;
export const pulse = (t: number, start: number, length: number) => Math.sin(Math.PI * clamp01((t - start) / length));
export const f = (n: number, digits = 2) => n.toFixed(digits);

/** A cubic Bézier drawn as an outline that narrows from `from` to `to` wide and ends in a round cap — a tail. */
export function taper([p0, p1, p2, p3]: Point[], from: number, to: number) {
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

// ------------------------------------------------------------------ body

export const GROUND = 132;
export const PAW_RY = 2.6;
export const CHEST_X = 146;
export const BODY_X = 114;
export const HEAD_AHEAD = 13;
export const HEAD_Y = 71; // centre of the skull, walking
export const FRONT_HEAD_Y = 74; // … and standing face-on
export const NOSE_AHEAD = 33; // chest → front of the head
export const TAIL_BEHIND = 110; // chest → end of the tail
export const TAIL_ROOT = [78, 81] as const;
export const THIGH = [12, 7.5] as const; // half length and half thickness of the thigh muscle
export const TAIL_JOINT = [60, 64] as const;

export const CYCLE = 40; // cat units travelled per full stride
export const DUTY = 0.62; // share of the stride each paw spends on the ground
export const STRIDE = CYCLE * DUTY;
export const WALK_LOOK = 0.5; // how far the face turns towards the way it is walking

export const FAR_FUR = "#b4b0a9";
export const FAR_WHITE = "#aeaaa3";

export type Leg = {
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
export const LEGS: Leg[] = [
  { ...HIND, widths: [...HIND.widths], root: [87, 95], neutral: 91, offset: 0.5, far: true },
  { ...FORE, widths: [...FORE.widths], root: [141, 99], neutral: 142, offset: 0.25, far: true },
  { ...HIND, widths: [...HIND.widths], root: [84, 96], neutral: 88, offset: 0, far: false },
  { ...FORE, widths: [...FORE.widths], root: [138, 100], neutral: 139, offset: 0.75, far: false },
];

type Foot = { x: number; y: number; angle: number };

// A short question-mark tail: up from the rump, the tip hooked forward.
export const SIDE_TAIL = [
  taper([TAIL_ROOT, [69, 80], [62, 74], TAIL_JOINT], 7.4, 6.2),
  taper([TAIL_JOINT, [58.5, 55], [61, 47.5], [67.5, 45]], 6.2, 3.6),
];
export const FRONT_TAIL = [
  taper([[0, 100], [1, 91], [-2, 82], [0, 74]], 7, 6),
  taper([[0, 74], [2.5, 66], [8, 61.5], [13.5, 62]], 6, 3.6),
];

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

// ------------------------------------------------------------------ head

/*
 * Head space: origin at the centre of the skull, z towards you when the cat faces you. Paired features are given for
 * the side on your right; surfaces that foreshorten carry the direction they face as [x, z].
 */
export const SKULL = { halfWidth: 11, halfHeight: 9.8, halfDepth: 8.5 };
export const SNOUT = { y: 3, z: 6.5, halfWidth: 7.5, halfDepth: 6 }; // the face juts forward of the round skull
const NECK = 3.5; // the head turns about the top of the neck, this far behind the centre of the skull
export const CHEEK = [7, 3.8, 3.2] as const;
export const MUZZLE = [2.8, 4.8, 9.4] as const;
const PAD = [4, 4.6, 9] as const; // where the whiskers grow
const EYE = [4.5, -1.2, 8.3] as const;
const EYE_FACING = [0.25, 0.97] as const;
const EAR = [6.6, -7.2, 0.5] as const;
const EAR_FACING = [0.35, 0.94] as const;
const NOSE = [0, 2.3, 12.3] as const;
export const CHIN = [0, 7.8, 7.8] as const;
export const BLAZE = [0, 0.8, 10] as const;
/** `look` → head yaw: while walking it looks mostly where it is going; looking at the bottle is a full profile. */
export const HEAD_TURN = 1.2;
export const MAX_YAW = rad(85);

// Drawn for the ear and eye on your right (outer corner of the eye up, ear leaning out); mirrored for the other.
export const EAR_SHAPE = "M-4.6 1.5C-3.9 -3 -1.2 -8 1.8 -10.6C2.4 -11.1 3.1 -10.9 3.4 -10.2C4.6 -6.6 5.4 -2.6 5.2 1.5Z";
export const EAR_INSIDE = "M-2.9 0.8C-2.3 -2.6 -0.2 -6.4 2 -8.6C3 -6 3.7 -2.6 3.6 0.8Z";
export const EYE_SHAPE = "M-2.6 0.4C-1.9 -1.6 1 -2.3 2.6 -0.7C2 1.4 -0.5 2.1 -2.6 0.4Z";

// ------------------------------------------------------------------ rigs

const finder = (svg: SVGSVGElement) => (name: string) => svg.querySelector(`[data-part="${name}"]`) as SVGElement;

/** Poses the side view drawn by <CatSide>. */
export function createSideRig(svg: SVGSVGElement) {
  const part = finder(svg);
  const sideBody = part("side-body");
  const tailBase = part("tail-base");
  const tailTip = part("tail-tip");
  const legs = LEGS.map((_, i) => {
    const g = svg.querySelector(`[data-leg="${i}"]`) as SVGGElement;
    return { g, lines: [...g.querySelectorAll("line")], paw: g.querySelector("[data-paw]")!, thigh: g.querySelector("[data-thigh]") };
  });

  return {
    /** Bobs the body, swings the tail and places every leg for this point of the stride. */
    pose(phase: number, bob: number, speed: number, clock: number) {
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
    },
    /** Front views bring their own forelegs, so the side view's fade out as one appears. */
    fadeForelegs(opacity: number) {
      legs[1].g.style.opacity = legs[3].g.style.opacity = f(opacity);
    },
  };
}

/**
 * Turns the head drawn by <CatHead>: every feature is projected from head space for this direction.
 * yaw: 0 = facing you, + = to your right. pitch: 0 = level, + = looking down.
 */
export function createHeadRig(svg: SVGSVGElement) {
  const part = finder(svg);
  const pair = (name: string) => [part(`${name}-0`), part(`${name}-1`)];
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

  return (yaw: number, eyeOpen: number, earFlick: number, pitch = 0) => {
    const yc = Math.cos(yaw);
    const ys = Math.sin(yaw);
    const pc = Math.cos(pitch);
    const ps = Math.sin(pitch);
    // Pitch nods the face about the centre of the skull; yaw then turns the whole head about the top of the neck.
    const depth = (y: number, z: number) => z * pc - y * ps;
    const across = (x: number, z: number, y = 0) => f(x * yc + (depth(y, z) + NECK) * ys);
    const down = (y: number, z: number) => f(y * pc + z * ps);
    const facing = (x: number, z: number) => z * pc * yc - x * ys;

    skull.setAttribute("cx", across(0, 0));
    skull.setAttribute("ry", f(Math.hypot(SKULL.halfHeight * pc, SKULL.halfDepth * ps)));
    headShadow.setAttribute("cx", across(0, 0));
    skull.setAttribute("rx", f(Math.hypot(SKULL.halfWidth * yc, SKULL.halfDepth * ys)));
    snout.setAttribute("cx", across(0, SNOUT.z, SNOUT.y));
    snout.setAttribute("cy", down(SNOUT.y, SNOUT.z));
    snout.setAttribute("rx", f(Math.hypot(SNOUT.halfWidth * yc, SNOUT.halfDepth * ys)));
    blaze.setAttribute("cx", across(0, BLAZE[2], BLAZE[1]));
    blaze.setAttribute("cy", down(BLAZE[1], BLAZE[2]));
    blaze.setAttribute("rx", f(2 * Math.max(0, yc)));
    chin.setAttribute("cx", across(0, CHIN[2], CHIN[1]));
    chin.setAttribute("cy", down(CHIN[1], CHIN[2]));
    nose.setAttribute(
      "transform",
      `translate(${across(0, NOSE[2], NOSE[1])} ${down(NOSE[1], NOSE[2])}) scale(${f(Math.max(0.35, yc), 3)} 1)`,
    );
    earTwitch.setAttribute("transform", `rotate(${f(-earFlick)})`);
    [0, 1].forEach((i) => {
      const m = i ? 1 : -1;
      cheeks[i].setAttribute("cx", across(m * CHEEK[0], CHEEK[2], CHEEK[1]));
      cheeks[i].setAttribute("cy", down(CHEEK[1], CHEEK[2]));
      muzzles[i].setAttribute("cx", across(m * MUZZLE[0], MUZZLE[2], MUZZLE[1]));
      muzzles[i].setAttribute("cy", down(MUZZLE[1], MUZZLE[2]));
      // Eyes foreshorten as they turn away and vanish round the side of the head.
      const eyeWidth = f(m * clamp01(facing(m * EYE_FACING[0], EYE_FACING[1])), 3);
      const eyeAt = `translate(${across(m * EYE[0], EYE[2], EYE[1])} ${down(EYE[1], EYE[2])})`;
      eyes[i].setAttribute("transform", `${eyeAt} scale(${eyeWidth} ${f(Math.max(0.06, eyeOpen * pc), 3)})`);
      lids[i].setAttribute("transform", `${eyeAt} scale(${eyeWidth} 1)`);
      // Ears narrow edge-on; past that you see their furry backs.
      const ear = facing(m * EAR_FACING[0], EAR_FACING[1]);
      ears[i].setAttribute(
        "transform",
        `translate(${across(m * EAR[0], EAR[2], EAR[1])} ${down(EAR[1], EAR[2])}) scale(${f(m * Math.max(0.55, Math.abs(ear)), 3)} 1)`,
      );
      earInsides[i].style.opacity = f(smooth(ear / 0.3));
      whiskers[i].setAttribute(
        "transform",
        `translate(${across(m * PAD[0], PAD[2], PAD[1])} ${down(PAD[1], PAD[2])}) scale(${f(m * yc + 0.35 * ys, 3)} 1)`,
      );
    });
    // The far ear goes behind the near one.
    const farEar = ears[yaw > 0 ? 1 : 0];
    if (earSlot.firstChild !== farEar) earSlot.insertBefore(farEar, earSlot.firstChild);
    closedEyes.style.opacity = f(1 - smooth(eyeOpen / 0.35));
  };
}
