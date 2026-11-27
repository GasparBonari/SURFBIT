import { box, ellipse, px, rect, rng, shade, type Ctx } from "./canvas";
import { drawText } from "./font";
import { P } from "./palette";
import type { PropSpec } from "./props";
import { displayTable, drawRackBase } from "./shopDisplays";

/** Unshaped blank, nose up: blunt, nearly parallel outline with a wooden stringer. */
function drawBlank(c: Ctx, x: number, y: number, w: number, h: number, color: string, stringer: string) {
  const edge = shade(color, -0.22);
  const shape = (left: number, top: number, width: number, height: number, fill: string) => {
    for (let i = 0; i < height; i++) {
      const t = i / (height - 1);
      const row = t < 0.12 ? Math.round(width * (0.5 + 0.5 * t / 0.12)) : t > 0.94 ? Math.round(width * 0.8) : width;
      rect(c, left + Math.floor((width - row) / 2), top + i, row, 1, fill);
    }
  };
  shape(x, y, w, h, edge);
  shape(x + 1, y + 1, w - 2, h - 2, color);
  rect(c, x + w - 3, y + 4, 1, h - 7, edge);
  rect(c, x + 2, y + 4, 1, h - 8, shade(color, 0.3));
  rect(c, x + Math.floor(w / 2), y + 1, 1, h - 2, stringer);
}

/** Small deep-blue tag with the station number, so the five stations read as a path. */
function drawBadge(c: Ctx, x: number, y: number, n: number) {
  box(c, x, y, 7, 8, P.deepBlue, P.navyDark);
  drawText(c, String(n), x + 2, y + 2, P.cream);
}

function stationPlacard(n: number): PropSpec {
  return {
    w: 13, h: 22, foot: { w: 1, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 6, 20, 5, 1, P.shadow);
      rect(c, x + 5, 10, 3, 11, P.woodDeep);
      rect(c, x + 5, 10, 1, 10, P.wood);
      box(c, x, 0, 13, 12, P.deepBlue, P.navyDark);
      rect(c, x + 1, 1, 11, 1, P.sky);
      drawText(c, String(n), x + 5, 4, P.cream);
      px(c, x + 2, 9, P.sky);
      px(c, x + 10, 9, P.sky);
    },
  };
}

function drawGlow(c: Ctx, x: number, y: number, rx: number, ry: number, alpha: number) {
  c.save();
  c.globalAlpha = alpha;
  ellipse(c, x, y, rx, ry, P.glow);
  c.restore();
}

// Lit, lit, dim, lit: a slow tube flicker. Ambient freezes it on frame 0 with reduced motion.
const LIGHT_LEVELS = [1, 1, 0, 1];

export const WORKSHOP_PROPS = {
  toolWall: {
    w: 48, h: 28, wall: true, outline: false,
    draw: (c, x) => {
      box(c, x, 0, 48, 26, P.thatchDark, P.woodDeep);
      box(c, x + 2, 2, 44, 22, P.sandDark, P.woodDark);
      for (let y = 4; y <= 22; y += 3) {
        for (let i = 4; i <= 44; i += 4) px(c, x + i, y, P.woodDark);
      }
      // Planer
      rect(c, x + 8, 4, 6, 2, P.ironDark);
      box(c, x + 4, 6, 14, 6, P.iron, P.ironDark);
      rect(c, x + 5, 7, 12, 1, P.bagSilver);
      rect(c, x + 6, 10, 3, 1, P.coral);
      // Sander
      rect(c, x + 10, 13, 2, 4, P.ironDark);
      ellipse(c, x + 11, 19, 5, 3, P.ironDark);
      ellipse(c, x + 11, 18, 4, 2, P.sun);
      px(c, x + 9, 17, P.thatchLight);
      // Rasps and a surform
      for (const left of [21, 25]) {
        rect(c, x + left, 4, 2, 13, P.iron);
        px(c, x + left, 6, P.bagSilver);
        px(c, x + left + 1, 10, P.bagSilver);
        rect(c, x + left, 17, 2, 5, P.woodLight);
      }
      box(c, x + 29, 5, 5, 16, P.bagSilver, P.iron);
      rect(c, x + 30, 18, 3, 3, P.coral);
      // Calipers
      rect(c, x + 36, 4, 7, 2, P.ironDark);
      rect(c, x + 37, 5, 1, 15, P.ironDark);
      rect(c, x + 42, 5, 1, 15, P.ironDark);
      px(c, x + 38, 19, P.ironDark);
      px(c, x + 41, 19, P.ironDark);
      rect(c, x + 1, 24, 46, 2, P.woodLight);
    },
  },
  blankRack: {
    w: 32, h: 44, foot: { w: 2, h: 1 }, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      ellipse(c, x + 16, 42, 15, 2, P.shadow);
      box(c, x + 1, 20, 30, 20, P.wood, P.woodDeep);
      rect(c, x + 2, 21, 28, 1, P.woodLight);
      drawBlank(c, x + 2, 7, 9, 33, P.parchment, accent);
      drawBlank(c, x + 21, 9, 9, 31, P.parchment, accent);
      drawBlank(c, x + 10, 1, 12, 39, color, accent);
      drawRackBase(c, x, 38, 32);
    },
  },
  stationPlacard1: stationPlacard(1),
  stationPlacard5: stationPlacard(5),
  templateRack: {
    w: 32, h: 38, foot: { w: 2, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 16, 36, 15, 2, P.shadow);
      for (const post of [1, 28]) {
        box(c, x + post, 4, 3, 32, P.wood, P.woodDeep);
        rect(c, x + post + 1, 5, 1, 29, P.woodLight);
      }
      rect(c, x + 2, 9, 28, 2, P.woodDark);
      rect(c, x + 2, 9, 28, 1, P.woodLight);
      // Half-outline templates: a straight stringer edge and a curved rail edge.
      for (const [left, top, length, fill] of [[6, 12, 22, P.parchment], [13, 11, 24, P.woodLight], [20, 12, 22, P.sandDark]] as const) {
        rect(c, x + left + 1, top - 2, 1, 2, P.iron);
        for (let i = 0; i < length; i++) {
          const width = 1 + Math.round(4 * Math.sin(Math.PI * (0.08 + 0.84 * i / (length - 1))));
          rect(c, x + left, top + i, width, 1, fill);
          px(c, x + left + width, top + i, P.woodDeep);
        }
        rect(c, x + left, top, 1, length, shade(fill, -0.2));
      }
      drawBadge(c, x + 12, 0, 2);
    },
  },
  shapingStand: {
    w: 48, h: 26, foot: { w: 3, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 24, 24, 22, 2, P.shadow);
      for (const stand of [9, 36]) {
        rect(c, x + stand, 13, 3, 11, P.woodDark);
        rect(c, x + stand, 13, 1, 10, P.wood);
        rect(c, x + stand - 4, 22, 11, 2, P.woodDeep);
        box(c, x + stand - 3, 10, 9, 4, P.coral, P.woodDeep);
      }
      // Blank lying flat, nose to the right, half shaped.
      for (let i = 0; i < 44; i++) {
        const t = i / 43;
        const half = t > 0.72 ? Math.max(1, Math.round(5 * Math.sqrt((1 - t) / 0.28))) : t < 0.06 ? 4 : 5;
        rect(c, x + 2 + i, 7 - half, 1, half * 2 + 1, P.cream);
        px(c, x + 2 + i, 7 - half, P.foam);
        px(c, x + 2 + i, 7 + half, P.sandDark);
        if (i % 3 === 0 && t < 0.55) px(c, x + 2 + i, 3 - Math.min(1, half - 4), P.deepBlue);
      }
      rect(c, x + 3, 7, 41, 1, P.finBrown);
      for (const [dx, dy] of [[14, 4], [22, 10], [30, 5]]) px(c, x + dx, dy, P.parchment);
      drawBadge(c, x + 20, 15, 3);
    },
  },
  shapingLight: {
    w: 16, h: 44, foot: { w: 1, h: 1 }, solid: true, outline: false,
    frames: LIGHT_LEVELS.length, animation: { frameMs: 220 },
    draw: (c, x, frame) => {
      const lit = LIGHT_LEVELS[frame] === 1;
      drawGlow(c, x + 8, 15, 7, 14, lit ? 0.3 : 0.14);
      ellipse(c, x + 8, 42, 6, 1, P.shadow);
      rect(c, x + 7, 27, 2, 14, P.ironDark);
      rect(c, x + 8, 28, 1, 12, P.iron);
      rect(c, x + 4, 40, 8, 2, P.ironDark);
      box(c, x + 5, 2, 6, 26, P.iron, P.ironDark);
      rect(c, x + 6, 3, 4, 24, lit ? P.glow : P.glowWarm);
      rect(c, x + 6, 3, 1, 24, lit ? P.foam : P.glow);
      rect(c, x + 5, 0, 6, 2, P.ironDark);
    },
  },
  foamDust: {
    w: 48, h: 28, foot: { w: 3, h: 2 }, flat: true, outline: false,
    draw: (c, x) => {
      const random = rng(31);
      const colors = [P.foam, P.cream, P.parchment];
      for (let i = 0; i < 260; i++) {
        const angle = random() * Math.PI * 2;
        const r = Math.sqrt(random());
        const dx = Math.round(Math.cos(angle) * r * 22);
        const dy = Math.round(Math.sin(angle) * r * 11);
        px(c, x + 24 + dx, 14 + dy, colors[Math.floor(random() * colors.length)]);
      }
      // A few curled shavings.
      for (const [dx, dy] of [[9, 8], [33, 17], [17, 21], [39, 9]]) {
        rect(c, x + dx, dy, 2, 1, P.cream);
        px(c, x + dx + 2, dy + 1, P.parchment);
      }
    },
  },
  glassingRack: {
    w: 32, h: 42, foot: { w: 2, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 16, 40, 15, 2, P.shadow);
      for (const post of [1, 28]) {
        box(c, x + post, 10, 3, 30, P.wood, P.woodDeep);
        rect(c, x + post + 1, 11, 1, 27, P.woodLight);
      }
      rect(c, x + 2, 24, 28, 2, P.woodDark);
      // Freshly glassed board: glossy sky deck with a cloth-edge line.
      drawBlank(c, x + 9, 0, 14, 37, P.sky, P.deepBlue);
      for (const [dx, dy, h] of [[12, 5, 6], [12, 14, 3], [19, 9, 4]]) rect(c, x + dx, dy, 1, h, P.foam);
      rect(c, x + 10, 30, 12, 1, P.foamShade);
      // Cloth roll and a resin bucket.
      box(c, x + 2, 33, 14, 5, P.foam, P.bagSilver);
      rect(c, x + 2, 34, 1, 3, P.foamShade);
      box(c, x + 21, 30, 8, 9, P.sun, P.woodDeep);
      rect(c, x + 22, 31, 6, 1, P.thatchLight);
      rect(c, x + 22, 34, 6, 2, P.sunDark);
      drawBadge(c, x + 2, 12, 4);
    },
  },
  sandingTable: displayTable((c, x, { color, accent }) => {
    // Orbital sander on a sanding sheet.
    rect(c, x + 3, 9, 14, 5, P.parchment);
    ellipse(c, x + 10, 10, 6, 3, P.ironDark);
    ellipse(c, x + 10, 9, 5, 2, accent);
    rect(c, x + 8, 3, 4, 6, color);
    px(c, x + 8, 4, shade(color, 0.4));
    // Fin plug cards.
    for (const left of [20, 31]) {
      box(c, x + left, 4, 10, 10, P.cream, P.woodDark);
      for (const [dx, dy] of [[2, 2], [6, 2], [2, 6], [6, 6]]) {
        rect(c, x + left + dx, 4 + dy, 2, 2, color);
        px(c, x + left + dx, 4 + dy, accent);
      }
    }
  }),
  materialsBoard: {
    w: 16, h: 38, foot: { w: 1, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 8, 36, 7, 1, P.shadow);
      box(c, x + 1, 0, 14, 34, P.woodDark, P.woodDeep);
      rect(c, x + 2, 1, 12, 1, P.woodLight);
      drawText(c, "PU", x + 5, 3, P.cream);
      box(c, x + 3, 9, 10, 7, P.parchment, P.sandDark);
      rect(c, x + 4, 13, 8, 2, P.sun);
      drawText(c, "EPS", x + 3, 18, P.cream);
      box(c, x + 3, 24, 10, 7, P.foam, P.bagSilver);
      for (const [dx, dy] of [[1, 1], [4, 2], [7, 1], [2, 3]]) px(c, x + 3 + dx, 24 + dy, P.foamShade);
      rect(c, x + 4, 28, 8, 2, P.sky);
      rect(c, x + 2, 34, 3, 4, P.woodDeep);
      rect(c, x + 11, 34, 3, 4, P.woodDeep);
    },
  },
  classBoard: {
    w: 30, h: 34, foot: { w: 2, h: 1 }, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      ellipse(c, x + 15, 32, 14, 2, P.shadow);
      rect(c, x + 3, 22, 2, 11, P.woodDeep);
      rect(c, x + 25, 22, 2, 11, P.woodDeep);
      box(c, x, 0, 30, 24, P.wood, P.woodDeep);
      box(c, x + 2, 2, 26, 20, P.sandDark, P.woodDark);
      for (const [dx, dy] of [[4, 19], [12, 20], [25, 18], [26, 10]]) px(c, x + dx, dy, P.thatchDark);
      rect(c, x + 3, 3, 24, 7, color);
      drawText(c, "CLASS", x + 6, 4, accent);
      box(c, x + 4, 11, 12, 10, P.cream, P.sandDark);
      for (const y of [13, 15, 17, 19]) rect(c, x + 6, y, y === 17 ? 5 : 8, 1, P.woodDark);
      box(c, x + 18, 12, 8, 7, accent, color);
      rect(c, x + 20, 14, 4, 1, color);
      px(c, x + 22, 12, P.coral);
    },
  },
  workbench: {
    w: 48, h: 28, foot: { w: 3, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 24, 26, 23, 2, P.shadow);
      for (const leg of [3, 42]) {
        rect(c, x + leg, 14, 3, 13, P.woodDeep);
        rect(c, x + leg, 14, 1, 12, P.wood);
      }
      rect(c, x + 5, 21, 38, 3, P.woodDark);
      rect(c, x + 5, 21, 38, 1, P.woodLight);
      box(c, x + 9, 16, 9, 5, P.sun, P.woodDeep);
      box(c, x, 8, 48, 7, P.woodLight, P.woodDeep);
      rect(c, x + 1, 9, 46, 1, P.thatchLight);
      rect(c, x + 1, 13, 46, 1, P.wood);
      // C-clamps
      for (const left of [5, 13]) {
        rect(c, x + left, 4, 5, 2, P.coral);
        rect(c, x + left, 4, 2, 12, P.coral);
        rect(c, x + left, 14, 5, 2, P.coral);
        rect(c, x + left + 3, 6, 1, 3, P.iron);
      }
      // Hand plane and pencil.
      box(c, x + 22, 4, 10, 5, P.woodDark, P.woodDeep);
      rect(c, x + 25, 2, 3, 2, P.ironDark);
      rect(c, x + 23, 5, 8, 1, P.wood);
      rect(c, x + 33, 8, 5, 1, P.sun);
      px(c, x + 38, 8, P.ink);
      // Vice
      box(c, x + 39, 5, 8, 6, P.iron, P.ironDark);
      rect(c, x + 40, 6, 6, 1, P.bagSilver);
    },
  },
} satisfies Record<string, PropSpec>;
