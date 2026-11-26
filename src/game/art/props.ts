import { P } from "./palette";
import { type Ctx, box, ellipse, px, rect, shade } from "./canvas";
import { autoOutline } from "./characters";
import { drawText } from "./font";
import { INTERIOR_PROPS } from "./interiorProps";
import { drawBoard, drawPlazaInlay, drawShirt, drawSmallWaveMark, drawWaveMark } from "./motifs";

export interface Tint {
  color: string;
  accent: string;
}

export interface PropSpec {
  w: number;
  h: number;
  frames?: number;
  animation?: { frameMs: number; pingPong?: boolean };
  /** Footprint in tiles (placement + collision). Defaults to ceil(w/16) × 1. */
  foot?: { w: number; h: number };
  solid?: boolean;
  /** Drawn under characters (rugs, towels). */
  flat?: boolean;
  /** Mounted on a wall: sorted just above the floor, behind characters. */
  wall?: boolean;
  outline?: boolean;
  draw(ctx: Ctx, ox: number, frame: number, tint: Tint): void;
}

interface Frond {
  /** Direction in degrees (0 = east, 90 = south). */
  angle: number;
  length: number;
  width: number;
  droop: number;
  back?: boolean;
}

// Back fronds first (shaded), then the sides, then the drooping front ones on top.
const FRONDS: Frond[] = [
  { angle: -150, length: 17, width: 3, droop: 0.55, back: true },
  { angle: -30, length: 17, width: 3, droop: 0.55, back: true },
  { angle: -100, length: 11, width: 3, droop: 0.35, back: true },
  { angle: 180, length: 22, width: 5, droop: 0.6 },
  { angle: 0, length: 20, width: 5, droop: 0.6 },
  { angle: -125, length: 15, width: 3, droop: 0.5 },
  { angle: -60, length: 15, width: 3, droop: 0.5 },
  { angle: 150, length: 17, width: 3, droop: 0.45 },
  { angle: 30, length: 17, width: 3, droop: 0.45 },
  { angle: 100, length: 9, width: 3, droop: 0.2 },
];

/** A feathery frond: lit upper half, shaded lower half, serrated leaflet tips along the bottom edge. */
function frond(ctx: Ctx, cx: number, cy: number, f: Frond, sway: number) {
  const a = (f.angle * Math.PI) / 180;
  const steps = f.length * 3;
  const [top, mid, low, tip] = f.back
    ? [P.leaf, P.leafDark, P.leafDeep, P.leafDeep]
    : [P.leafLight, P.leaf, P.leafDark, P.leafDeep];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = cx + Math.cos(a) * f.length * t + sway * t * t;
    const y = cy + Math.sin(a) * f.length * t + f.droop * f.length * t * t;
    const half = Math.max(0.5, f.width * Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.08)));
    for (let k = -Math.ceil(half); k <= Math.ceil(half); k++) {
      const color = k < -half / 2 ? top : k <= 0 ? mid : low;
      px(ctx, x, y + k, color);
    }
    // leaflet tips hang below the frond every few pixels
    if (i % 6 === 0 && t > 0.15 && t < 0.92) {
      px(ctx, x, y + Math.ceil(half) + 1, tip);
      px(ctx, x + Math.sign(Math.cos(a)), y + Math.ceil(half) + 2, tip);
    }
    if (!f.back && i % 9 === 4 && t < 0.7) px(ctx, x, y - Math.ceil(half), P.leafGlint);
  }
}

function palm(ctx: Ctx, ox: number, frame: number, height = 64) {
  const sway = [-1, 0, 1][frame];
  const baseX = ox + 23, baseY = height - 1, topX = ox + 27, topY = height === 64 ? 19 : 14;
  // ringed trunk, lit on the left, curving slightly toward the crown
  for (let y = baseY; y >= topY; y--) {
    const t = (baseY - y) / (baseY - topY);
    const x = Math.round(baseX + (topX - baseX) * t * t);
    const half = t < 0.12 ? 3 : 2;
    rect(ctx, x - half, y, half * 2 + 1, 1, P.trunk);
    px(ctx, x - half, y, P.thatchDark);
    px(ctx, x + half, y, P.trunkDark);
    if ((baseY - y) % 3 === 0) {
      rect(ctx, x - half + 1, y, half * 2, 1, P.trunkDark);
      px(ctx, x - half, y, P.trunk);
    }
  }
  const cx = topX + sway, cy = topY;
  for (const f of FRONDS.filter((f) => f.back)) frond(ctx, cx, cy, f, sway * 2);
  // coconut cluster under the crown
  for (const [dx, dy, color] of [[-2, 3, P.trunkDark], [2, 3, P.woodDeep], [0, 5, P.trunkDark]] as const) {
    ellipse(ctx, cx + dx, cy + dy, 2, 2, color);
    px(ctx, cx + dx - 1, cy + dy - 1, P.thatchDark);
  }
  for (const f of FRONDS.filter((f) => !f.back)) frond(ctx, cx, cy, f, sway * 2);
  ellipse(ctx, cx, cy - 1, 2, 1, P.leaf);
}

function umbrella(ctx: Ctx, a: string, b: string) {
  rect(ctx, 15, 10, 2, 34, P.cream);
  rect(ctx, 16, 10, 1, 34, P.stoneDark);
  for (let y = 0; y < 12; y++) {
    const half = Math.round(4 + y * 1.1);
    for (let x = -half; x <= half; x++) {
      const seg = Math.floor(((x + half) / (half * 2 + 1)) * 6);
      px(ctx, 16 + x, 2 + y, seg % 2 ? a : b);
    }
  }
  for (let x = 2; x < 31; x += 4) px(ctx, x, 14, P.outline);
  rect(ctx, 15, 0, 2, 2, P.cream);
}

const palmSway = { frameMs: 450, pingPong: true };
const flagWave = { frameMs: 160 };

export const PROPS = {
  palm: { w: 48, h: 64, frames: 3, animation: palmSway, foot: { w: 1, h: 1 }, solid: true, draw: (c, ox, f) => palm(c, ox, f) },
  palmSmall: { w: 48, h: 48, frames: 3, animation: palmSway, foot: { w: 1, h: 1 }, solid: true, draw: (c, ox, f) => palm(c, ox, f, 48) },
  bush: {
    w: 16, h: 15, solid: true,
    draw: (c, ox) => {
      ellipse(c, ox + 8, 9, 7, 5, P.leafDark);
      ellipse(c, ox + 7, 7, 5, 4, P.leaf);
      px(c, ox + 5, 5, P.leafLight); px(c, ox + 9, 6, P.leafLight); px(c, ox + 11, 9, P.leafLight);
      px(c, ox + 4, 9, P.pink); px(c, ox + 10, 4, P.pink);
    },
  },
  hibiscusBush: {
    w: 22, h: 19, foot: { w: 1, h: 1 }, solid: true, outline: false,
    draw: (c, ox) => {
      ellipse(c, ox + 11, 12, 10, 6, P.leafDeep);
      ellipse(c, ox + 8, 9, 7, 6, P.leafDark);
      ellipse(c, ox + 14, 8, 7, 6, P.leaf);
      for (const [x, y] of [[4, 10], [10, 5], [14, 10], [18, 8]]) {
        rect(c, ox + x - 1, y, 3, 2, P.hibiscus);
        px(c, ox + x, y - 1, P.pink);
        px(c, ox + x, y, P.sun);
      }
    },
  },
  flowers: {
    w: 16, h: 10, flat: true, outline: false,
    draw: (c, ox) => {
      const spots: [number, number, string][] = [[3, 3, P.pink], [8, 6, P.sun], [12, 2, P.cream], [5, 8, P.lilac], [13, 7, P.coral]];
      for (const [x, y, col] of spots) {
        px(c, ox + x, y + 1, P.leafDark);
        px(c, ox + x - 1, y, col); px(c, ox + x + 1, y, col); px(c, ox + x, y - 1, col); px(c, ox + x, y, P.sun);
      }
    },
  },
  bench: {
    w: 32, h: 18, foot: { w: 2, h: 1 }, solid: true,
    draw: (c, ox) => {
      rect(c, ox + 2, 2, 28, 3, P.woodLight);
      rect(c, ox + 2, 5, 28, 1, P.woodDark);
      rect(c, ox + 1, 8, 30, 4, P.wood);
      rect(c, ox + 1, 11, 30, 1, P.woodDark);
      rect(c, ox + 3, 5, 2, 12, P.ink); rect(c, ox + 27, 5, 2, 12, P.ink);
    },
  },
  umbrellaCoral: { w: 32, h: 44, foot: { w: 2, h: 1 }, solid: false, draw: (c, ox) => { c.save(); c.translate(ox, 0); umbrella(c, P.coral, P.cream); c.restore(); } },
  umbrellaTeal: { w: 32, h: 44, foot: { w: 2, h: 1 }, solid: false, draw: (c, ox) => { c.save(); c.translate(ox, 0); umbrella(c, P.teal, P.cream); c.restore(); } },
  umbrellaBlue: { w: 32, h: 44, foot: { w: 2, h: 1 }, draw: (c, ox) => { c.save(); c.translate(ox, 0); umbrella(c, P.flagBlue, P.cream); c.restore(); } },
  towelCoral: {
    w: 14, h: 26, flat: true,
    draw: (c, ox) => { rect(c, ox + 1, 1, 12, 24, P.cream); for (let y = 3; y < 24; y += 5) rect(c, ox + 1, y, 12, 2, P.coral); },
  },
  towelTeal: {
    w: 14, h: 26, flat: true,
    draw: (c, ox) => { rect(c, ox + 1, 1, 12, 24, P.sun); for (let x = 3; x < 13; x += 4) rect(c, ox + x, 1, 2, 24, P.teal); },
  },
  lamp: {
    w: 10, h: 36, foot: { w: 1, h: 1 }, solid: true,
    draw: (c, ox) => {
      rect(c, ox + 4, 8, 2, 26, P.ink);
      rect(c, ox + 3, 33, 4, 3, P.ink);
      box(c, ox + 1, 1, 8, 8, P.sun, P.ink);
      rect(c, ox + 3, 3, 4, 4, P.cream);
      rect(c, ox + 2, 0, 6, 1, P.ink);
    },
  },
  sign: {
    w: 18, h: 22, foot: { w: 1, h: 1 }, solid: true,
    draw: (c, ox) => {
      rect(c, ox + 8, 10, 2, 12, P.woodDark);
      box(c, ox + 1, 1, 16, 11, P.woodLight, P.woodDeep);
      rect(c, ox + 4, 4, 10, 1, P.woodDeep); rect(c, ox + 4, 7, 7, 1, P.woodDeep);
    },
  },
  rock: {
    w: 16, h: 12, solid: true,
    draw: (c, ox) => { ellipse(c, ox + 8, 7, 7, 4, P.stoneDark); ellipse(c, ox + 7, 6, 5, 3, P.stone); px(c, ox + 5, 4, P.stoneLight); },
  },
  surfRack: {
    w: 32, h: 34, foot: { w: 2, h: 1 }, solid: true,
    draw: (c, ox) => {
      drawBoard(c, ox + 3, 2, 7, 28, P.coral, P.cream);
      drawBoard(c, ox + 12, 0, 7, 30, P.sky, P.coral);
      drawBoard(c, ox + 21, 4, 7, 26, P.sun, P.woodDark);
      rect(c, ox + 1, 22, 30, 3, P.woodDark);
      rect(c, ox + 1, 22, 30, 1, P.woodLight);
      rect(c, ox + 2, 25, 2, 9, P.woodDark); rect(c, ox + 28, 25, 2, 9, P.woodDark);
    },
  },
  boardsInSand: {
    w: 24, h: 35, solid: true,
    draw: (c, ox) => {
      drawBoard(c, ox + 1, 0, 10, 34, P.sun, P.cream);
      drawBoard(c, ox + 12, 4, 11, 30, P.flagBlue, P.cream);
      rect(c, ox, 33, 24, 2, P.sandDark);
    },
  },
  tower: {
    w: 34, h: 56, foot: { w: 2, h: 1 }, solid: true,
    draw: (c, ox) => {
      rect(c, ox + 4, 24, 2, 32, P.woodDark); rect(c, ox + 28, 24, 2, 32, P.woodDark);
      for (let y = 30; y < 54; y += 8) rect(c, ox + 4, y, 26, 1, P.woodDark);
      box(c, ox + 2, 14, 30, 12, P.cream, P.outline);
      rect(c, ox + 3, 15, 28, 3, P.coral);
      for (let x = 2; x < 32; x += 4) rect(c, ox + x, 0, 2, 2, P.coral);
      for (let y = 0; y < 8; y++) rect(c, ox + 2 + y, 2 + y, 30 - y * 2, 1, y % 2 ? P.coral : P.cream);
      rect(c, ox + 16, 18, 2, 6, P.outline);
      ellipse(c, ox + 25, 22, 4, 4, P.coral);
      ellipse(c, ox + 25, 22, 2, 2, P.woodDark);
      rect(c, ox + 24, 18, 2, 2, P.cream);
      rect(c, ox + 24, 25, 2, 2, P.cream);
    },
  },
  statue: {
    w: 28, h: 56, foot: { w: 2, h: 1 }, solid: true,
    draw: (c, ox) => {
      box(c, ox + 2, 42, 24, 14, P.stoneLight, P.stoneDark);
      rect(c, ox + 3, 48, 22, 1, P.stoneDark);
      drawBoard(c, ox + 8, 0, 12, 46, P.coral, P.sun);
    },
  },
  crate: {
    w: 14, h: 14, solid: true,
    draw: (c, ox) => { box(c, ox, 0, 14, 14, P.wood, P.woodDeep); rect(c, ox + 1, 6, 12, 1, P.woodDark); rect(c, ox + 6, 1, 1, 12, P.woodDark); },
  },
  flag: {
    w: 16, h: 38, frames: 3, animation: flagWave, foot: { w: 1, h: 1 }, solid: true,
    draw: (c, ox, f) => {
      rect(c, ox + 3, 0, 2, 38, P.ink);
      for (let x = 0; x < 10; x++) {
        const dy = Math.round(Math.sin(x * 0.7 + f * 2) * 1);
        rect(c, ox + 5 + x, 2 + dy, 1, 7, x < 5 ? P.coral : P.cream);
        if (x === 4) rect(c, ox + 5 + x, 4 + dy, 1, 3, P.sun);
      }
    },
  },
  beachFlag: {
    w: 28, h: 43, frames: 3, animation: flagWave, foot: { w: 1, h: 1 }, solid: true, outline: false,
    draw: (c, ox, frame) => {
      rect(c, ox + 12, 0, 2, 43, P.ironDark);
      rect(c, ox + 14, 3, 14, 11, P.flagBlue);
      rect(c, ox + 24, 3 + frame, 4, 9, P.navy);
      drawSmallWaveMark(c, ox + 15, 5, P.cream);
    },
  },
  plazaLogo: {
    w: 96, h: 44, foot: { w: 6, h: 3 }, flat: true, outline: false,
    draw: (c, ox) => drawPlazaInlay(c, ox + 7),
  },
  signpost: {
    w: 31, h: 46, foot: { w: 1, h: 1 }, solid: true, outline: false,
    draw: (c, ox) => {
      rect(c, ox + 13, 2, 5, 44, P.woodDeep);
      for (const [row, label] of ["SURF", "SHOP", "BEACH"].entries()) {
        const y = row * 11;
        box(c, ox, y, 31, 10, P.woodDark, P.woodDeep);
        drawText(c, label, ox + 2, y + 2, P.cream);
        const x = ox + 25;
        if (row === 2) {
          rect(c, x, y + 2, 1, 5, P.cream);
          rect(c, x - 1, y + 5, 3, 1, P.cream);
        } else {
          rect(c, x - 2, y + 4, 5, 1, P.cream);
          rect(c, x + (row === 0 ? -1 : 1), y + 3, 1, 3, P.cream);
        }
      }
    },
  },
  noticeBoard: {
    w: 30, h: 29, solid: true, outline: false,
    draw: (c, ox) => {
      rect(c, ox + 3, 6, 3, 23, P.woodDeep);
      rect(c, ox + 24, 6, 3, 23, P.woodDeep);
      box(c, ox, 3, 30, 20, P.wood, P.woodDark);
      rect(c, ox, 1, 30, 3, P.woodLight);
      rect(c, ox + 5, 8, 8, 10, P.cream);
      rect(c, ox + 17, 7, 7, 8, P.sandLight);
      rect(c, ox + 7, 11, 4, 1, P.teal);
      rect(c, ox + 19, 11, 3, 1, P.coral);
    },
  },
  trashBin: {
    w: 12, h: 16, solid: true, outline: false,
    draw: (c, ox) => {
      rect(c, ox + 1, 4, 10, 11, P.ironDark);
      rect(c, ox + 2, 5, 8, 9, P.iron);
      ellipse(c, ox + 6, 4, 5, 3, P.wallStoneDark);
      ellipse(c, ox + 6, 4, 3, 1, P.ironDark);
    },
  },
  lounger: {
    w: 14, h: 23, solid: true, outline: false,
    draw: (c, ox) => {
      rect(c, ox + 1, 7, 12, 15, P.woodDark);
      rect(c, ox + 2, 1, 10, 18, P.woodLight);
      for (let y = 3; y < 18; y += 4) rect(c, ox + 2, y, 10, 1, P.wood);
      rect(c, ox, 18, 14, 2, P.woodDeep);
    },
  },
  volleyballNet: {
    w: 64, h: 24, outline: false,
    draw: (c, ox) => {
      rect(c, ox + 8, 2, 48, 2, P.cream);
      for (let y = 6; y <= 14; y += 4) rect(c, ox + 8, y, 48, 1, P.sandWetDark);
      for (let x = 12; x < 56; x += 4) rect(c, ox + x, 4, 1, 11, P.sandWetDark);
      rect(c, ox + 8, 15, 48, 1, P.cream);
    },
  },
  volleyballPost: {
    w: 6, h: 24, solid: true, outline: false,
    draw: (c, ox) => { rect(c, ox + 1, 1, 4, 23, P.woodDark); rect(c, ox + 1, 1, 1, 22, P.woodLight); },
  },
  rockCluster: {
    w: 46, h: 25, solid: true, outline: false,
    draw: (c, ox) => {
      ellipse(c, ox + 23, 20, 22, 4, P.rockDeep);
      ellipse(c, ox + 22, 13, 11, 11, P.rockDark);
      ellipse(c, ox + 18, 10, 6, 6, P.rock);
      ellipse(c, ox + 6, 18, 5, 5, P.rock);
      ellipse(c, ox + 37, 17, 8, 7, P.rockDark);
      ellipse(c, ox + 35, 14, 5, 3, P.rock);
    },
  },
  fence: {
    w: 48, h: 17, solid: true, outline: false,
    draw: (c, ox) => {
      rect(c, ox, 5, 48, 3, P.woodLight);
      rect(c, ox, 11, 48, 3, P.woodDark);
      for (let x = 3; x < 48; x += 14) rect(c, ox + x, 1, 3, 16, P.wood);
    },
  },
  cafeTable: {
    w: 29, h: 22, solid: true, outline: false,
    draw: (c, ox) => {
      rect(c, ox + 13, 8, 3, 14, P.woodDeep);
      ellipse(c, ox + 14, 9, 10, 5, P.woodDark);
      ellipse(c, ox + 14, 7, 10, 5, P.woodLight);
      rect(c, ox + 5, 15, 5, 5, P.wood);
      rect(c, ox + 20, 15, 5, 5, P.wood);
      rect(c, ox + 14, 4, 3, 3, P.cream);
    },
  },
  stringLights: {
    w: 48, h: 25, outline: false,
    draw: (c, ox) => {
      for (let x = 0; x < 48; x++) {
        const y = 3 + Math.round(Math.sin(x / 47 * Math.PI) * 6);
        px(c, ox + x, y, P.woodDark);
        if (x % 8 === 3) rect(c, ox + x, y + 1, 2, 3, P.glow);
      }
    },
  },
  chalkboard: {
    w: 14, h: 22, solid: true, outline: false,
    draw: (c, ox) => {
      rect(c, ox + 2, 12, 2, 10, P.woodDeep);
      rect(c, ox + 10, 12, 2, 10, P.woodDeep);
      box(c, ox, 0, 14, 18, P.navyDark, P.woodLight);
      for (const y of [4, 7, 10, 13]) rect(c, ox + 3, y, 7, 1, P.cream);
    },
  },
  // ---------------------------------------------------------- interiors
  counter: {
    w: 48, h: 28, foot: { w: 3, h: 1 }, solid: true,
    draw: (c, ox) => {
      box(c, ox, 6, 48, 22, P.wood, P.woodDeep);
      rect(c, ox + 1, 7, 46, 3, P.woodLight);
      for (let x = 6; x < 46; x += 8) rect(c, ox + x, 12, 1, 15, P.woodDark);
      rect(c, ox + 12, 13, 24, 11, P.cream);
      drawWaveMark(c, ox + 16, 11, P.signTeal);
      box(c, ox + 30, 0, 12, 8, P.ink, P.outline);
      rect(c, ox + 32, 2, 8, 3, P.teal);
      rect(c, ox + 6, 3, 6, 4, P.cream);
    },
  },
  plant: {
    w: 16, h: 28, solid: true,
    draw: (c, ox) => {
      box(c, ox + 3, 18, 10, 10, P.coral, P.coralDark);
      ellipse(c, ox + 5, 10, 4, 5, P.leafDark);
      ellipse(c, ox + 11, 9, 4, 6, P.leaf);
      ellipse(c, ox + 8, 5, 3, 5, P.leafLight);
      rect(c, ox + 8, 10, 1, 8, P.leafDark);
    },
  },
  fittingRoom: {
    w: 32, h: 44, foot: { w: 2, h: 2 }, solid: true, outline: false,
    draw: (c, ox) => {
      box(c, ox + 1, 1, 30, 42, P.wood, P.woodDeep);
      rect(c, ox + 2, 2, 28, 2, P.woodLight);
      for (let x = 5; x < 27; x++) {
        rect(c, ox + x, 9, 1, 31, x % 4 < 2 ? P.cream : P.sandLight);
      }
      rect(c, ox + 5, 8, 22, 2, P.woodDeep);
      drawWaveMark(c, ox + 8, 18, P.navy);
    },
  },
  window: {
    w: 28, h: 18, wall: true,
    draw: (c, ox) => {
      box(c, ox, 0, 28, 18, P.sky, P.woodDeep);
      rect(c, ox + 1, 10, 26, 7, P.water);
      rect(c, ox + 1, 10, 26, 1, P.foam);
      ellipse(c, ox + 20, 5, 2, 2, P.cream);
      rect(c, ox + 13, 1, 2, 16, P.woodDeep);
    },
  },
  poster: {
    w: 16, h: 20, wall: true,
    draw: (c, ox, _f, t) => {
      box(c, ox, 0, 16, 20, P.cream, P.outline);
      rect(c, ox + 2, 2, 12, 10, t.color);
      ellipse(c, ox + 8, 8, 3, 3, P.sun);
      rect(c, ox + 2, 10, 12, 2, P.water);
      rect(c, ox + 3, 14, 10, 1, P.ink); rect(c, ox + 4, 16, 8, 1, P.ink);
    },
  },
  rug: {
    w: 48, h: 32, foot: { w: 3, h: 2 }, flat: true, outline: false,
    draw: (c, ox, _f, t) => {
      rect(c, ox + 1, 1, 46, 30, t.accent);
      rect(c, ox + 3, 3, 42, 26, t.color);
      for (let x = 6; x < 44; x += 6) rect(c, ox + x, 3, 2, 26, shade(t.color, 0.15));
    },
  },
  // product displays (tinted per product color)
  boardDisplay: {
    w: 14, h: 48, foot: { w: 1, h: 1 }, solid: true,
    draw: (c, ox, _f, t) => { drawBoard(c, ox + 2, 0, 10, 44, t.color, t.accent); rect(c, ox + 1, 44, 12, 4, P.woodDark); },
  },
  clothesRack: {
    w: 32, h: 30, foot: { w: 2, h: 1 }, solid: true,
    draw: (c, ox, _f, t) => {
      rect(c, ox + 2, 2, 28, 2, P.ink);
      rect(c, ox + 2, 2, 2, 26, P.ink); rect(c, ox + 28, 2, 2, 26, P.ink);
      rect(c, ox, 27, 8, 2, P.ink); rect(c, ox + 24, 27, 8, 2, P.ink);
      for (const [index, color] of [P.deepBlue, P.signTeal, t.color].entries()) {
        drawShirt(c, ox + 3 + index * 8, 6, color, t.accent);
      }
      rect(c, ox + 2, 24, 28, 3, P.wood);
    },
  },
  mannequin: {
    w: 16, h: 34, foot: { w: 1, h: 1 }, solid: true,
    draw: (c, ox, _f, t) => {
      ellipse(c, ox + 8, 3, 3, 3, P.stoneLight);
      drawShirt(c, ox + 3, 7, t.color, t.accent, true);
      rect(c, ox + 5, 17, 6, 6, shade(t.color, -0.3));
      rect(c, ox + 7, 23, 2, 8, P.ink);
      rect(c, ox + 3, 31, 10, 2, P.ink);
    },
  },
  shelf: {
    w: 32, h: 32, foot: { w: 2, h: 1 }, solid: true,
    draw: (c, ox, _f, t) => {
      box(c, ox, 0, 32, 32, P.woodLight, P.woodDeep);
      for (const y of [10, 20]) rect(c, ox + 1, y, 30, 2, P.woodDark);
      for (let i = 0; i < 4; i++) {
        box(c, ox + 3 + i * 7, 3, 5, 7, i % 2 ? t.accent : t.color, P.outline);
        box(c, ox + 3 + i * 7, 13, 5, 7, i % 2 ? t.color : t.accent, P.outline);
        box(c, ox + 3 + i * 7, 23, 5, 7, t.color, P.outline);
      }
    },
  },
  pegboard: {
    w: 30, h: 28, foot: { w: 2, h: 1 }, solid: true,
    draw: (c, ox, _f, t) => {
      box(c, ox, 0, 30, 22, P.sandDark, P.woodDeep);
      for (let y = 3; y < 20; y += 4) for (let x = 3; x < 28; x += 4) px(c, ox + x, y, P.woodDark);
      for (let i = 0; i < 3; i++) {
        const x = ox + 4 + i * 9;
        for (let r = 0; r < 9; r++) rect(c, x + Math.floor(r / 3), 5 + r, 5 - Math.floor(r / 2), 1, i === 1 ? t.accent : t.color);
      }
      rect(c, ox + 2, 22, 2, 6, P.woodDeep); rect(c, ox + 26, 22, 2, 6, P.woodDeep);
    },
  },
  wetsuitHanger: {
    w: 16, h: 36, foot: { w: 1, h: 1 }, solid: true,
    draw: (c, ox, _f, t) => {
      rect(c, ox + 7, 0, 2, 3, P.ink);
      rect(c, ox + 2, 3, 12, 2, P.ink);
      drawShirt(c, ox + 3, 4, t.color, t.accent, false);
      rect(c, ox + 5, 14, 6, 7, t.color);
      rect(c, ox + 5, 18, 2, 3, t.accent);
      rect(c, ox + 7, 21, 2, 12, P.ink);
      rect(c, ox + 3, 33, 10, 2, P.ink);
    },
  },
  ...INTERIOR_PROPS,
} satisfies Record<string, PropSpec>;

// ------------------------------------------------------------- effects

export function drawGull(ctx: Ctx, ox: number, frame: number) {
  const up = frame === 0;
  rect(ctx, ox + 5, 3, 3, 2, P.white);
  px(ctx, ox + 8, 3, P.sun);
  for (let i = 0; i < 5; i++) {
    const dy = up ? -Math.floor(i / 2) : Math.floor(i / 3);
    px(ctx, ox + 4 - i, 3 + dy, P.white);
    px(ctx, ox + 8 + i, 3 + dy, P.white);
  }
  autoOutline(ctx, ox, 0, 13, 8, P.ink);
}

export function drawSurfer(ctx: Ctx, ox: number, frame: number) {
  const y = frame;
  rect(ctx, ox + 1, 9 + y, 14, 2, P.sun);
  rect(ctx, ox + 6, 4 + y, 4, 5, P.ink);
  rect(ctx, ox + 6, 1 + y, 4, 3, P.skin2);
  rect(ctx, ox + 5, 5 + y, 1, 3, P.ink);
  rect(ctx, ox + 10, 5 + y, 1, 3, P.ink);
  autoOutline(ctx, ox, 0, 16, 13, P.outline);
}

export function drawWave(ctx: Ctx) {
  for (let x = 0; x < 28; x++) {
    const y = Math.round(12 - x / 3 - Math.sin((x / 27) * Math.PI) * 3);
    px(ctx, x, y, P.foam);
    if (x > 2 && x < 25) px(ctx, x, y + 1, P.foamShade);
  }
}

export function drawFootprint(ctx: Ctx) {
  rect(ctx, 0, 1, 2, 3, P.sandWetDark);
  rect(ctx, 3, 0, 2, 3, P.sandWetDark);
}

export function drawMarker(ctx: Ctx) {
  const rows = ["0011100", "0111110", "1111111", "0111110", "0011100", "0001000"];
  rows.forEach((r, y) => [...r].forEach((ch, x) => ch === "1" && px(ctx, x, y, P.cream)));
  autoOutline(ctx, 0, 0, 7, 7, P.outline);
}
