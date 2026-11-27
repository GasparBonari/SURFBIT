import { P } from "./palette";
import { type Ctx, box, ellipse, px, rect, shade } from "./canvas";
import { autoOutline } from "./characters";
import { INTERIOR_PROPS } from "./interiorProps";
import { drawBoard, drawShirt, drawWaveMark } from "./motifs";
import { TOWN_PROPS } from "./townProps";

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

export const PROPS = {
  ...TOWN_PROPS,
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
  crate: {
    w: 14, h: 14, solid: true,
    draw: (c, ox) => { box(c, ox, 0, 14, 14, P.wood, P.woodDeep); rect(c, ox + 1, 6, 12, 1, P.woodDark); rect(c, ox + 6, 1, 1, 12, P.woodDark); },
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

export function drawMarker(ctx: Ctx) {
  const rows = ["0011100", "0111110", "1111111", "0111110", "0011100", "0001000"];
  rows.forEach((r, y) => [...r].forEach((ch, x) => ch === "1" && px(ctx, x, y, P.cream)));
  autoOutline(ctx, 0, 0, 7, 7, P.outline);
}
