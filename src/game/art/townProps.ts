import { type Ctx, box, ellipse, px, rect } from "./canvas";
import { drawText } from "./font";
import { drawBoard, drawPlazaInlay, drawSmallWaveMark } from "./motifs";
import { P } from "./palette";
import type { PropSpec } from "./props";

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
      const color = k < -half / 2 ? top : k <= 0 ? mid : k < Math.ceil(half) ? low : tip;
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

function palm(ctx: Ctx, ox: number, frame: number, height: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(ox, 0, 48, height);
  ctx.clip();
  const short = height === 48;
  const sway = [-1, 0, 1][frame];
  const baseX = ox + 24, baseY = height - 2;
  const topX = baseX + (short ? -4 : 3), topY = short ? 15 : 19;
  ellipse(ctx, ox + 27, baseY - 1, 10, 2, P.shadow);
  for (let y = baseY; y >= topY; y--) {
    const t = (baseY - y) / (baseY - topY);
    const x = Math.round(baseX + (topX - baseX) * t * t);
    const half = t < 0.12 ? 3 : 2;
    rect(ctx, x - half, y, half * 2 + 1, 1, P.trunk);
    px(ctx, x - half, y, P.woodLight);
    px(ctx, x + half, y, P.trunkDark);
    if ((baseY - y) % 3 === 0) {
      rect(ctx, x - half + 1, y, half * 2, 1, P.woodDark);
    }
  }
  const cx = topX + sway, cy = topY;
  for (const f of FRONDS.filter((f) => f.back)) frond(ctx, cx, cy, f, sway * 2);
  // coconut cluster under the crown
  for (const [dx, dy, color] of [[-2, 3, P.trunkDark], [2, 3, P.woodDeep], [0, 5, P.trunkDark]] as const) {
    ellipse(ctx, cx + dx, cy + dy, 2, 2, color);
    px(ctx, cx + dx - 1, cy + dy - 1, P.thatchDark);
  }
  for (const f of FRONDS.filter((f) => !f.back)) {
    const leaf = short
      ? { ...f, length: f.length - 3, width: f.width + 1, angle: f.angle + 8 }
      : f;
    frond(ctx, cx, cy, leaf, sway * 2);
  }
  ellipse(ctx, cx, cy - 1, 2, 1, P.leaf);
  ctx.restore();
}

// Broad leaves are drawn back to front so their tips can break the silhouette.
function leaf(ctx: Ctx, x: number, y: number, dx: number, dy: number, width: number, lit: boolean) {
  const length = Math.max(Math.abs(dx), Math.abs(dy));
  for (let i = 0; i <= length; i++) {
    const t = i / length;
    const half = Math.round(width * Math.sin(Math.PI * t));
    const cx = x + dx * t;
    const cy = y + dy * t;
    rect(ctx, cx - half, cy, half * 2 + 1, 1, lit ? P.leaf : P.leafDark);
    if (half > 0 && lit) px(ctx, cx - half, cy, P.leafLight);
  }
}

function bloom(ctx: Ctx, x: number, y: number, color: string) {
  rect(ctx, x - 1, y - 2, 3, 5, P.coralDark);
  rect(ctx, x - 2, y - 1, 5, 3, color);
  rect(ctx, x - 1, y - 2, 2, 2, P.pink);
  px(ctx, x, y, P.sun);
}

function umbrella(ctx: Ctx, x: number, color: string, shadow: string) {
  ellipse(ctx, x + 19, 41, 12, 2, P.shadow);
  rect(ctx, x + 15, 12, 2, 31, P.woodDark);
  rect(ctx, x + 15, 12, 1, 29, P.woodLight);
  px(ctx, x + 15, 0, P.cream);
  const widths = [3, 7, 11, 15, 19, 23, 25, 27, 29, 31, 31, 31, 29, 27, 23];
  for (const [y, width] of widths.entries()) {
    const left = Math.floor((32 - width) / 2);
    for (let col = 0; col < width; col++) {
      const panel = Math.floor(col * 5 / width);
      const colored = panel % 2 === 0;
      const edge = y > 11 || col === 0 || col === width - 1;
      const fill = colored ? color : P.cream;
      const border = colored ? shadow : P.stoneLight;
      px(ctx, x + left + col, y + 1, edge ? border : fill);
    }
  }
}

function towel(ctx: Ctx, x: number, fabric: string, stripe: string) {
  rect(ctx, x + 2, 2, 12, 23, P.shadow);
  rect(ctx, x + 1, 1, 12, 23, fabric);
  rect(ctx, x + 2, 1, 2, 23, stripe);
  rect(ctx, x + 9, 1, 2, 23, stripe);
  rect(ctx, x + 11, 1, 2, 23, P.shadow);
  for (let col = 2; col < 13; col += 2) {
    px(ctx, x + col, 0, P.cream);
    px(ctx, x + col, 24, P.cream);
  }
}

function rockFace(ctx: Ctx, x: number, y: number, w: number, h: number) {
  for (let row = 0; row < h; row++) {
    const foot = Math.max(0, row - h + 3);
    const left = Math.max(0, Math.ceil((h - row * 2) / 3)) + foot;
    const right = Math.max(0, Math.ceil((h - row * 1.3) / 3)) + foot;
    const width = w - left - right;
    rect(ctx, x + left, y + row, width, 1, row < h - 2 ? P.rockDark : P.rockDeep);
    if (row < h - 2) {
      const facet = Math.floor(width * (row < h / 2 ? 0.65 : 0.42));
      rect(ctx, x + left + 1, y + row, facet, 1, P.rock);
    }
    if (row < h / 3) rect(ctx, x + left + 1, y + row, 2, 1, P.wallStone);
  }
}

function rocks(ctx: Ctx, x: number, scattered: boolean) {
  ellipse(ctx, x + 24, 21, 21, 3, P.shadow);
  if (scattered) {
    rockFace(ctx, x + 4, 12, 15, 10);
    rockFace(ctx, x + 28, 7, 15, 14);
    rockFace(ctx, x + 16, 15, 14, 9);
  } else {
    rockFace(ctx, x + 5, 12, 14, 10);
    rockFace(ctx, x + 13, 2, 23, 21);
    rockFace(ctx, x + 32, 13, 12, 10);
  }
  px(ctx, x + 3, 23, P.rock);
  px(ctx, x + 40, 23, P.wallStone);
}

const palmSway = { frameMs: 450, pingPong: true };
const flagWave = { frameMs: 160 };

export const TOWN_PROPS = {
  palm: { w: 48, h: 64, frames: 3, animation: palmSway, foot: { w: 1, h: 1 }, solid: true, outline: false, draw: (c, x, f) => palm(c, x, f, 64) },
  palmSmall: { w: 48, h: 48, frames: 3, animation: palmSway, foot: { w: 1, h: 1 }, solid: true, outline: false, draw: (c, x, f) => palm(c, x, f, 48) },
  bush: {
    w: 16, h: 15, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 8, 12, 7, 2, P.leafDeep);
      leaf(c, x + 7, 12, -5, -8, 2, true);
      leaf(c, x + 8, 12, 1, -11, 2, true);
      leaf(c, x + 8, 13, 5, -8, 2, false);
      leaf(c, x + 8, 13, -4, -5, 2, true);
      leaf(c, x + 8, 13, 6, -4, 2, true);
    },
  },
  shrubFan: {
    w: 22, h: 19, foot: { w: 1, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 11, 16, 10, 2, P.leafDeep);
      const center = x + 11;
      for (const [dx, dy] of [[-9, -8], [9, -8], [-6, -13], [6, -13], [0, -15]]) {
        leaf(c, center, 16, dx, dy, 2, dx <= 0);
      }
      leaf(c, center, 17, -7, -5, 2, true);
      leaf(c, center, 17, 7, -6, 2, true);
    },
  },
  shrubBroadleaf: {
    w: 22, h: 19, foot: { w: 1, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 11, 16, 10, 2, P.leafDeep);
      ellipse(c, x + 6, 12, 6, 4, P.leafDark);
      leaf(c, x + 10, 15, -5, -12, 3, true);
      leaf(c, x + 10, 15, 7, -13, 4, false);
      leaf(c, x + 10, 16, 9, -8, 3, true);
      leaf(c, x + 8, 16, -6, -7, 3, true);
      leaf(c, x + 10, 16, 0, -9, 3, true);
      px(c, x + 9, 10, P.leafGlint);
    },
  },
  hibiscusBush: {
    w: 22, h: 19, foot: { w: 1, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 11, 15, 10, 3, P.leafDeep);
      leaf(c, x + 11, 16, 5, -13, 4, false);
      leaf(c, x + 10, 16, -6, -12, 3, true);
      leaf(c, x + 10, 17, -7, -6, 3, true);
      leaf(c, x + 11, 17, 8, -6, 3, true);
      bloom(c, x + 6, 8, P.hibiscus);
      bloom(c, x + 12, 5, P.coral);
      bloom(c, x + 16, 11, P.hibiscus);
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
    w: 32, h: 18, foot: { w: 2, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 16, 15, 15, 2, P.shadow);
      for (const side of [x + 2, x + 27]) {
        rect(c, side + 1, 1, 2, 14, P.ironDark);
        rect(c, side, 11, 3, 6, P.iron);
        rect(c, side + 1, 12, 2, 5, P.ironDark);
      }
      for (const y of [2, 6]) {
        rect(c, x + 2, y, 28, 3, P.woodDark);
        rect(c, x + 3, y, 26, 1, P.woodLight);
        rect(c, x + 3, y + 1, 26, 1, P.wood);
        for (const dx of [4, 27]) px(c, x + dx, y + 1, P.woodDeep);
      }
      rect(c, x + 1, 10, 30, 4, P.woodDeep);
      rect(c, x + 2, 10, 28, 2, P.woodLight);
      rect(c, x + 2, 12, 28, 1, P.wood);
      rect(c, x + 1, 8, 4, 2, P.iron);
      rect(c, x + 27, 8, 4, 2, P.iron);
    },
  },
  umbrellaCoral: { w: 32, h: 44, foot: { w: 2, h: 1 }, outline: false, draw: (c, x) => umbrella(c, x, P.coral, P.coralDark) },
  umbrellaTeal: { w: 32, h: 44, foot: { w: 2, h: 1 }, outline: false, draw: (c, x) => umbrella(c, x, P.teal, P.tealDark) },
  umbrellaBlue: { w: 32, h: 44, foot: { w: 2, h: 1 }, outline: false, draw: (c, x) => umbrella(c, x, P.sky, P.deepBlue) },
  towelCoral: {
    w: 14, h: 26, flat: true,
    draw: (c, x) => towel(c, x, P.coral, P.cream),
  },
  towelTeal: {
    w: 14, h: 26, flat: true,
    draw: (c, x) => towel(c, x, P.tealDark, P.sky),
  },
  lamp: {
    w: 10, h: 36, foot: { w: 1, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 5, 34, 4, 1, P.shadow);
      rect(c, x + 4, 9, 2, 24, P.ironDark);
      rect(c, x + 4, 13, 1, 16, P.iron);
      rect(c, x + 3, 30, 4, 4, P.iron);
      rect(c, x + 2, 34, 6, 2, P.ironDark);
      rect(c, x + 1, 5, 8, 6, P.ironDark);
      rect(c, x + 2, 10, 6, 2, P.iron);
      rect(c, x + 2, 5, 6, 4, P.glowWarm);
      rect(c, x + 3, 5, 4, 4, P.glow);
      rect(c, x + 5, 5, 1, 5, P.woodDark);
      rect(c, x, 4, 10, 1, P.ironDark);
      rect(c, x + 2, 2, 6, 2, P.iron);
      rect(c, x + 4, 0, 2, 2, P.ironDark);
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
  boardsInSand: {
    w: 24, h: 35, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 11, 32, 11, 2, P.sandWet);
      drawBoard(c, x + 1, 0, 10, 33, P.sunDark, P.cream);
      rect(c, x + 3, 7, 2, 24, P.sun);
      drawBoard(c, x + 10, 3, 12, 31, P.flagBlue, P.cream);
      rect(c, x + 18, 20, 3, 11, P.navy);
      drawSmallWaveMark(c, x + 12, 8, P.cream);
      rect(c, x + 2, 33, 8, 1, P.sandDark);
      rect(c, x + 12, 34, 9, 1, P.sandDark);
    },
  },
  tower: {
    w: 34, h: 56, foot: { w: 2, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 18, 52, 15, 3, P.shadow);
      rect(c, x + 9, 31, 3, 18, P.woodDeep);
      rect(c, x + 29, 31, 3, 18, P.woodDeep);
      for (let y = 34; y < 52; y++) {
        rect(c, x + 7 + Math.floor((y - 34) / 2), y, 2, 1, P.woodDark);
        rect(c, x + 25 - Math.floor((y - 34) / 2), y, 2, 1, P.woodDeep);
      }
      for (const dx of [4, 25]) {
        rect(c, x + dx, 32, 3, 24, P.woodDark);
        rect(c, x + dx, 34, 1, 20, P.woodLight);
      }
      box(c, x + 2, 14, 29, 22, P.wood, P.woodDeep);
      rect(c, x + 5, 17, 17, 9, P.navyDark);
      rect(c, x + 6, 19, 15, 4, P.signTeal);
      rect(c, x + 12, 17, 2, 9, P.woodLight);
      rect(c, x + 25, 17, 5, 8, P.signTealDark);
      rect(c, x + 22, 16, 2, 19, P.woodDark);
      rect(c, x + 3, 27, 27, 1, P.woodLight);
      rect(c, x + 3, 31, 27, 1, P.woodDark);
      ellipse(c, x + 18, 30, 5, 5, P.cream);
      ellipse(c, x + 18, 30, 2, 2, P.woodDark);
      for (const dx of [-4, 3]) rect(c, x + 18 + dx, 29, 2, 3, P.coralDark);
      rect(c, x + 17, 25, 3, 2, P.coral);
      rect(c, x + 17, 33, 3, 2, P.coral);
      for (let row = 0; row < 15; row++) {
        const half = Math.min(16, 1 + row);
        const width = 2 * half;
        rect(c, x + 17 - half, row + 1, width, 1, row % 4 === 3 ? P.woodDark : P.thatch);
        if (row % 4 !== 3) rect(c, x + 17 - half, row + 1, half, 1, P.thatchLight);
        if (row > 1) px(c, x + 18, row + 1, P.thatchDark);
      }
      rect(c, x + 1, 16, 32, 2, P.woodDark);
      rect(c, x + 1, 16, 31, 1, P.woodLight);
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
    draw: (c, x, frame) => {
      ellipse(c, x + 14, 41, 5, 1, P.shadow);
      rect(c, x + 11, 40, 5, 3, P.ironDark);
      rect(c, x + 12, 2, 2, 38, P.ironDark);
      rect(c, x + 12, 2, 1, 38, P.bagSilver);
      rect(c, x + 12, 0, 2, 2, P.glow);
      for (let col = 0; col < 14; col++) {
        const lift = Math.round(Math.sin(col / 4 + frame * 2) * col / 8);
        rect(c, x + 14 + col, 4 + lift, 1, 11, P.navy);
        rect(c, x + 14 + col, 4 + lift, 1, 10, col > 9 ? P.deepBlue : P.flagBlue);
        px(c, x + 14 + col, 4 + lift, P.sky);
      }
      drawSmallWaveMark(c, x + 15, 5, P.cream);
    },
  },
  plazaLogo: {
    w: 96, h: 44, foot: { w: 6, h: 3 }, flat: true, outline: false,
    draw: (c, ox) => drawPlazaInlay(c, ox + 7),
  },
  signpost: {
    w: 31, h: 46, foot: { w: 1, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 17, 44, 7, 1, P.shadow);
      rect(c, x + 13, 2, 5, 44, P.woodDeep);
      rect(c, x + 14, 2, 2, 43, P.woodLight);
      for (const [row, label] of ["SURF", "SHOP", "BEACH"].entries()) {
        const y = row * 11 + 3;
        box(c, x, y, 31, 10, P.woodDark, P.woodDeep);
        rect(c, x + 1, y + 1, 29, 1, P.woodLight);
        drawText(c, label, x + 2, y + 3, P.cream);
        const arrow = x + 25;
        if (row === 2) {
          rect(c, arrow, y + 3, 1, 5, P.cream);
          rect(c, arrow - 1, y + 6, 3, 1, P.cream);
        } else {
          rect(c, arrow - 2, y + 5, 5, 1, P.cream);
          rect(c, arrow + (row === 0 ? -1 : 1), y + 4, 1, 3, P.cream);
        }
      }
    },
  },
  noticeBoard: {
    w: 30, h: 29, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 15, 27, 13, 1, P.shadow);
      for (const side of [x + 3, x + 24]) {
        rect(c, side, 6, 3, 23, P.woodDeep);
        rect(c, side, 9, 1, 19, P.woodLight);
      }
      box(c, x + 1, 4, 28, 19, P.wood, P.woodDeep);
      rect(c, x + 2, 10, 26, 1, P.woodDark);
      rect(c, x + 2, 16, 26, 1, P.woodDark);
      rect(c, x + 1, 1, 28, 4, P.woodLight);
      for (let col = 5; col < 28; col += 6) rect(c, x + col, 2, 1, 3, P.woodDark);
      rect(c, x, 5, 30, 2, P.woodDark);
      for (const [dx, y, color] of [[5, 9, P.signTeal], [13, 10, P.coral], [21, 8, P.flagBlue]] as const) {
        rect(c, x + dx + 1, y + 1, 6, 9, P.woodDark);
        rect(c, x + dx, y, 6, 9, P.cream);
        rect(c, x + dx + 1, y + 2, 4, 2, color);
        rect(c, x + dx + 1, y + 6, 3, 1, P.stoneDark);
        px(c, x + dx + 2, y, P.woodDeep);
      }
    },
  },
  trashBin: {
    w: 12, h: 16, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 6, 14, 5, 1, P.shadow);
      rect(c, x + 1, 4, 10, 9, P.ironDark);
      rect(c, x + 2, 12, 8, 3, P.ironDark);
      for (const col of [2, 4, 7, 9]) rect(c, x + col, 5, 1, 8, P.iron);
      ellipse(c, x + 6, 4, 5, 3, P.sunDark);
      ellipse(c, x + 5, 3, 4, 2, P.sun);
      ellipse(c, x + 6, 3, 3, 1, P.ironDark);
    },
  },
  lounger: {
    w: 14, h: 23, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 7, 20, 6, 2, P.shadow);
      for (const col of [2, 10]) {
        rect(c, x + col, 6, 2, 6, P.woodDark);
        rect(c, x + col, 15, 2, 7, P.woodDeep);
      }
      rect(c, x + 2, 1, 10, 8, P.woodDeep);
      rect(c, x + 2, 1, 9, 8, P.wood);
      rect(c, x + 1, 9, 12, 10, P.woodDark);
      rect(c, x + 1, 9, 10, 9, P.wood);
      for (const y of [2, 4, 6, 9, 12, 15, 18]) {
        rect(c, x + 2, y, y < 9 ? 8 : 10, 1, P.woodLight);
      }
      rect(c, x + 2, 19, 10, 1, P.woodDeep);
    },
  },
  volleyballNet: {
    w: 64, h: 24, outline: false,
    draw: (c, x) => {
      for (let col = 8; col <= 56; col++) {
        const sag = Math.round(Math.sin((col - 8) * Math.PI / 48) * 3);
        for (const y of [7, 10, 13]) px(c, x + col, y + sag, P.sandWetDark);
        if (col % 4 === 0) rect(c, x + col, 6 + sag, 1, 9, P.parchment);
        rect(c, x + col, 4 + sag, 1, 2, P.cream);
        px(c, x + col, 15 + sag, P.cream);
      }
    },
  },
  volleyballPost: {
    w: 6, h: 24, solid: true, outline: false,
    draw: (c, x) => {
      rect(c, x + 1, 1, 4, 23, P.woodDeep);
      rect(c, x + 1, 1, 2, 22, P.woodLight);
      rect(c, x + 1, 4, 4, 2, P.parchment);
      rect(c, x + 1, 15, 4, 1, P.thatchDark);
    },
  },
  rockCluster: {
    w: 46, h: 25, solid: true, outline: false,
    draw: (c, x) => rocks(c, x, false),
  },
  rockClusterLow: {
    w: 46, h: 25, solid: true, outline: false,
    draw: (c, x) => rocks(c, x, true),
  },
  fence: {
    w: 48, h: 17, solid: true, outline: false,
    draw: (c, x) => {
      for (const y of [5, 10]) {
        rect(c, x, y, 48, 4, P.woodDark);
        rect(c, x, y, 48, 1, P.woodLight);
        rect(c, x, y + 1, 48, 2, P.wood);
      }
      for (let col = 2; col < 48; col += 14) {
        rect(c, x + col, 2, 4, 15, P.woodDeep);
        rect(c, x + col, 2, 3, 13, P.wood);
        rect(c, x + col + 1, 1, 2, 2, P.woodLight);
        px(c, x + col + 1, 6, P.woodDark);
        px(c, x + col + 1, 11, P.woodDark);
      }
    },
  },
  cafeTable: {
    w: 29, h: 22, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 14, 19, 14, 2, P.shadow);
      for (const col of [0, 21]) {
        rect(c, x + col + 1, 6, 6, 7, P.woodDeep);
        rect(c, x + col + 2, 7, 4, 4, P.woodLight);
        rect(c, x + col + 1, 12, 6, 8, P.woodDark);
        rect(c, x + col + 1, 16, 1, 5, P.woodDeep);
        rect(c, x + col + 6, 16, 1, 5, P.woodDeep);
        rect(c, x + col, 13, 8, 3, P.woodLight);
        rect(c, x + col, 15, 8, 1, P.woodDark);
      }
      rect(c, x + 13, 9, 3, 11, P.woodDeep);
      rect(c, x + 10, 19, 9, 2, P.woodDark);
      ellipse(c, x + 14, 8, 9, 5, P.woodDeep);
      ellipse(c, x + 14, 6, 9, 5, P.woodLight);
      rect(c, x + 9, 8, 11, 1, P.wood);
      rect(c, x + 14, 4, 6, 2, P.woodDark);
      rect(c, x + 14, 3, 5, 3, P.cream);
      rect(c, x + 15, 3, 3, 1, P.woodDark);
      px(c, x + 19, 4, P.cream);
    },
  },
  stringLights: {
    w: 48, h: 25, outline: false,
    draw: (c, x) => {
      for (const col of [0, 46]) {
        rect(c, x + col, 4, 2, 21, P.woodDeep);
        rect(c, x + col, 4, 1, 18, P.woodLight);
      }
      for (let col = 0; col < 48; col++) {
        const y = 5 + Math.round(Math.sin(col / 47 * Math.PI) * 5);
        px(c, x + col, y, P.woodDeep);
        if (col % 8 !== 4) continue;
        rect(c, x + col - 1, y + 1, 3, 2, P.glowWarm);
        rect(c, x + col, y + 1, 1, 3, P.glow);
      }
    },
  },
  chalkboard: {
    w: 14, h: 22, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 7, 20, 6, 1, P.shadow);
      rect(c, x + 1, 9, 2, 13, P.woodDeep);
      rect(c, x + 11, 9, 2, 13, P.woodDeep);
      box(c, x + 1, 0, 12, 18, P.navyDark, P.woodDark);
      rect(c, x + 1, 0, 12, 1, P.woodLight);
      rect(c, x + 2, 1, 1, 16, P.woodLight);
      drawSmallWaveMark(c, x + 3, 1, P.cream);
      for (const [y, w] of [[9, 6], [11, 4], [13, 5]]) rect(c, x + 4, y, w, 1, P.sky);
    },
  },
} satisfies Record<string, PropSpec>;

export function drawGull(ctx: Ctx, ox: number, frame: number) {
  const wingY = frame === 0 ? [3, 2, 1, 0, 0] : [3, 4, 5, 5, 6];
  for (let i = 0; i < 5; i++) {
    const y = wingY[i];
    const color = i > 2 ? P.deepBlue : P.foam;
    rect(ctx, ox + 4 - i, y, 1, 2, color);
    rect(ctx, ox + 8 + i, y, 1, 2, color);
  }
  rect(ctx, ox + 4, 3, 5, 2, P.foam);
  rect(ctx, ox + 5, 5, 3, 1, P.foamShade);
  px(ctx, ox + 9, 4, P.sunDark);
}

export function drawFootprint(ctx: Ctx, x: number) {
  px(ctx, x + 1, 1, P.sandWetDark);
  rect(ctx, x, 2, 2, 1, P.sandWet);
  px(ctx, x, 3, P.sandWetDark);
  px(ctx, x + 4, 0, P.sandWetDark);
  rect(ctx, x + 3, 1, 2, 1, P.sandWet);
  px(ctx, x + 3, 2, P.sandWetDark);
}
