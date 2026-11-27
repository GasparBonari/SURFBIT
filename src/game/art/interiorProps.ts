import { box, ellipse, px, rect, rng, shade, type Ctx } from "./canvas";
import { drawText, textWidth } from "./font";
import { drawSmallWaveMark, drawWaveMark } from "./motifs";
import { P } from "./palette";
import type { PropSpec } from "./props";
import { drawPalmFrond } from "./townProps";

function shopSign(label: string, trim: string): PropSpec {
  return {
    w: 90, h: 30, wall: true, outline: false,
    draw: (c, x) => {
      rect(c, x + 8, 5, 74, 24, P.woodDeep);
      rect(c, x + 2, 9, 86, 17, P.woodDeep);
      rect(c, x + 30, 0, 30, 10, P.woodDeep);
      rect(c, x + 9, 6, 72, 22, trim);
      rect(c, x + 3, 10, 84, 15, trim);
      rect(c, x + 31, 1, 28, 9, trim);
      rect(c, x + 10, 7, 70, 20, P.navy);
      rect(c, x + 4, 11, 82, 13, P.navy);
      rect(c, x + 32, 2, 26, 9, P.navy);
      rect(c, x + 11, 19, 68, 1, P.navyDark);
      px(c, x + 7, 15, trim);
      px(c, x + 82, 15, trim);
      drawWaveMark(c, x + 37, -3, P.cream);
      drawText(c, "SURFBIT", x + 18, 9, P.cream, 1, 2);
      const spacing = 2;
      drawText(c, label, x + (90 - textWidth(label, spacing)) / 2, 20, P.cream, spacing);
      rect(c, x + 11, 22, 12, 1, trim);
      rect(c, x + 67, 22, 12, 1, trim);
    },
  };
}

function waveRug(w: number, h: number, scale: number): PropSpec {
  return {
    w, h, flat: true, outline: false, foot: { w: Math.ceil(w / 16), h: Math.ceil(h / 16) },
    draw: (c, x, _f, { color, accent }) => {
      weaveRug(c, x, w, h, color);
      rect(c, x + 3, 3, w - 6, 1, accent);
      rect(c, x + 3, h - 4, w - 6, 1, accent);
      drawWaveMark(c, x + (w - 16 * scale) / 2, (h - 16 * scale) / 2, accent, scale);
    },
  };
}

function weaveRug(c: Ctx, x: number, w: number, h: number, color: string) {
  const dark = shade(color, -0.24);
  const light = shade(color, 0.24);
  box(c, x + 1, 1, w - 2, h - 2, color, dark);
  for (let y = 2; y < h - 1; y += 2) {
    for (let i = 2 + y % 4; i < w - 2; i += 3) px(c, x + i, y, light);
  }
  for (let i = 2; i < w - 1; i += 2) {
    rect(c, x + i, 0, 1, 3, light);
    rect(c, x + i, h - 3, 1, 3, light);
  }
  rect(c, x + 2, 3, 1, h - 6, light);
  rect(c, x + w - 3, 3, 1, h - 6, light);
}

function mirror(standing: boolean): PropSpec {
  return {
    w: 16, h: 31, wall: !standing, solid: standing, outline: false,
    draw: (c, x) => {
      if (standing) {
        ellipse(c, x + 8, 13, 7, 13, P.woodDeep);
        ellipse(c, x + 8, 13, 6, 12, P.woodLight);
        ellipse(c, x + 8, 13, 5, 11, P.sky);
        rect(c, x + 3, 25, 10, 3, P.woodDark);
        rect(c, x + 1, 29, 14, 2, P.woodDeep);
      } else {
        box(c, x + 1, 0, 14, 30, P.wood, P.woodDeep);
        box(c, x + 2, 1, 12, 28, P.sky, P.woodLight);
      }
      for (let i = 0; i < 7; i++) {
        rect(c, x + 11 - i, 6 + i, 2, 1, P.foam);
        rect(c, x + 11 - i, 8 + i, 2, 1, P.foamShade);
        px(c, x + 11 - i, 17 + i, P.deepBlue);
      }
    },
  };
}

function pottedPlant(flowering: boolean): PropSpec {
  return {
    w: flowering ? 23 : 34, h: flowering ? 29 : 44, foot: { w: 1, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      const center = x + (flowering ? 11 : 17);
      const ground = flowering ? 29 : 44;
      ellipse(c, center, ground - 3, 9, 2, P.shadow);
      box(c, center - 5, ground - 10, 11, 9, P.terracotta, P.woodDeep);
      rect(c, center + 2, ground - 7, 3, 5, P.terracottaDark);
      rect(c, center - 3, ground - 7, 2, 4, P.terracottaLight);
      box(c, center - 6, ground - 12, 13, 5, P.terracottaLight, P.woodDeep);
      rect(c, center - 4, ground - 12, 9, 1, P.woodDark);
      rect(c, center, 11, 2, ground - 22, P.trunkDark);
      for (let y = 14; y < ground - 12; y += 3) px(c, center, y, P.woodLight);
      if (flowering) {
        for (const [dx, y] of [[-6, 13], [4, 9], [-2, 8], [7, 15], [0, 15]]) {
          ellipse(c, center + dx, y, 4, 3, P.leafDeep);
          ellipse(c, center + dx - 1, y - 1, 3, 2, P.leaf);
          px(c, center + dx - 2, y - 2, P.leafLight);
        }
        for (const [dx, y] of [[-5, 9], [0, 5], [6, 13]]) {
          ellipse(c, center + dx, y + 1, 3, 2, P.coralDark);
          ellipse(c, center + dx, y, 3, 2, P.hibiscus);
          px(c, center + dx, y, P.sun);
          px(c, center + dx - 1, y - 1, P.pink);
        }
      } else {
        for (const [angle, length, width, droop, back] of [
          [-142, 13, 2, 0.4, true],
          [-48, 12, 2, 0.45, true],
          [-105, 13, 2, 0.35, false],
          [177, 15, 3, 0.58, false],
          [-8, 16, 3, 0.62, false],
          [148, 12, 2, 0.5, false],
          [32, 12, 2, 0.48, false],
        ] as const) {
          drawPalmFrond(c, center, 12, { angle, length, width, droop, back });
        }
      }
    },
  };
}

function drawBeachView(c: Ctx, x: number, y: number, w: number, h: number) {
  const horizon = y + Math.floor(h / 2);
  rect(c, x, y, w, h, P.sky);
  rect(c, x + 2, horizon - 2, w - 4, 2, P.foamShade);
  ellipse(c, x + w - 7, horizon - 4, 3, 3, P.cream);
  rect(c, x, horizon, w, h - (horizon - y), P.water);
  rect(c, x, horizon, w, 1, P.waterDeep);
  rect(c, x + 2, horizon + 2, w - 5, 1, P.waterLight);
  rect(c, x, y + h - 3, w, 3, P.sand);
  rect(c, x + 1, y + h - 4, w - 2, 1, P.foam);
}

export const INTERIOR_PROPS = {
  boardsSign: shopSign("BOARDS", P.woodLight),
  wearSign: shopSign("WEAR", P.woodLight),
  gearSign: shopSign("GEAR", P.sun),
  goodsSign: shopSign("GOODS", P.woodLight),
  counter: {
    w: 48, h: 28, foot: { w: 3, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 24, 25, 23, 2, P.shadow);
      box(c, x + 1, 8, 46, 18, P.wood, P.woodDeep);
      for (let i = 4; i < 44; i += 5) {
        rect(c, x + i, 11, 1, 13, P.woodDark);
        rect(c, x + i + 1, 11, 1, 13, P.woodLight);
      }
      box(c, x, 5, 48, 7, P.woodLight, P.woodDeep);
      rect(c, x + 2, 6, 44, 1, P.thatchLight);
      rect(c, x + 1, 10, 46, 1, P.woodDark);
      box(c, x + 12, 12, 24, 12, P.cream, P.woodDark);
      rect(c, x + 13, 13, 1, 10, P.sandDark);
      drawWaveMark(c, x + 16, 10, P.signTeal);
      box(c, x + 30, 0, 12, 7, P.iron, P.ironDark);
      rect(c, x + 32, 2, 8, 1, P.bagSilver);
      rect(c, x + 34, 6, 4, 3, P.ironDark);
      rect(c, x + 32, 8, 8, 1, P.iron);
      box(c, x + 5, 4, 9, 5, P.cream, P.signTealDark);
      rect(c, x + 7, 6, 5, 1, P.productTeal);
    },
  },
  plant: {
    w: 16, h: 28, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 8, 26, 7, 1, P.shadow);
      box(c, x + 3, 19, 10, 8, P.terracotta, P.woodDeep);
      rect(c, x + 4, 21, 2, 4, P.terracottaLight);
      rect(c, x + 2, 18, 12, 2, P.woodDark);
      rect(c, x + 7, 6, 2, 14, P.leafDeep);
      for (const [dx, y, fill] of [[10, 10, P.leafDark], [8, 5, P.leaf], [4, 11, P.leaf], [10, 15, P.leafLight]] as const) {
        ellipse(c, x + dx, y, 4, 4, P.leafDeep);
        ellipse(c, x + dx - 1, y - 1, 3, 3, fill);
        px(c, x + dx - 1, y - 2, P.leafLight);
        c.clearRect(x + dx - 4, y + 1, 2, 1);
      }
    },
  },
  fittingRoom: {
    w: 32, h: 44, foot: { w: 2, h: 2 }, solid: true, outline: false,
    draw: (c, x) => {
      box(c, x + 1, 1, 30, 42, P.wood, P.woodDeep);
      rect(c, x + 2, 2, 28, 5, P.woodLight);
      rect(c, x + 2, 2, 28, 1, P.thatchLight);
      rect(c, x + 5, 8, 22, 34, P.woodDeep);
      rect(c, x + 2, 8, 1, 33, P.woodLight);
      rect(c, x + 28, 8, 2, 33, P.woodDark);
      rect(c, x + 4, 10, 24, 1, P.iron);
      for (let i = 6; i < 26; i++) {
        const fold = i % 4;
        rect(c, x + i, 13, 1, 26 + Number(fold > 0), fold === 0 ? P.sandDark : fold === 1 ? P.sandLight : P.cream);
        if (fold === 1) rect(c, x + i, 10, 1, 3, P.sunDark);
      }
      drawWaveMark(c, x + 8, 18, P.navy);
    },
  },
  fittingSign: {
    w: 62, h: 13, wall: true, outline: false,
    draw: (c, x) => {
      box(c, x, 0, 62, 13, P.woodDark, P.woodDeep);
      rect(c, x + 2, 2, 58, 1, P.woodLight);
      drawText(c, "FITTING", x + 18, 4, P.cream);
      rect(c, x + 6, 8, 8, 1, P.cream);
      for (let i = 0; i < 4; i++) {
        px(c, x + 7 + i, 7 - i, P.cream);
        px(c, x + 12 - i, 7 - i, P.cream);
      }
    },
  },
  blindsWindow: {
    w: 43, h: 37, wall: true, outline: false,
    draw: (c, x) => {
      box(c, x, 0, 43, 37, P.woodLight, P.woodDeep);
      box(c, x + 3, 3, 37, 31, P.sky, P.woodDeep);
      drawBeachView(c, x + 4, 14, 35, 19);
      rect(c, x + 7, 14, 2, 16, P.trunkDark);
      ellipse(c, x + 12, 16, 6, 2, P.leaf);
      ellipse(c, x + 7, 19, 2, 4, P.leafDark);
      rect(c, x + 20, 9, 2, 24, P.woodDeep);
      rect(c, x + 4, 22, 35, 2, P.woodDeep);
      for (const y of [4, 7, 10, 13]) {
        rect(c, x + 4, y, 35, 2, P.wood);
        rect(c, x + 4, y, 35, 1, P.woodLight);
        rect(c, x + 4, y + 2, 35, 1, P.woodDark);
      }
      rect(c, x + 8, 5, 1, 11, P.parchment);
      rect(c, x + 33, 5, 1, 11, P.parchment);
      rect(c, x + 1, 34, 41, 2, P.wood);
    },
  },
  window: {
    w: 28, h: 18, wall: true, outline: false,
    draw: (c, x) => {
      box(c, x, 0, 28, 18, P.woodLight, P.woodDeep);
      drawBeachView(c, x + 2, 2, 24, 13);
      rect(c, x + 13, 2, 2, 13, P.woodDark);
      rect(c, x + 2, 8, 24, 1, P.woodDark);
      rect(c, x + 1, 15, 26, 1, P.thatchLight);
      rect(c, x + 1, 16, 26, 1, P.wood);
    },
  },
  sideWindow: {
    w: 16, h: 43, wall: true, outline: false,
    draw: (c, x) => {
      box(c, x, 0, 16, 43, P.woodLight, P.woodDeep);
      box(c, x + 2, 2, 12, 39, P.sky, P.woodDeep);
      drawBeachView(c, x + 3, 3, 10, 37);
      rect(c, x + 7, 3, 2, 37, P.woodDeep);
      rect(c, x + 2, 15, 12, 2, P.woodDeep);
      rect(c, x + 2, 29, 12, 2, P.woodDeep);
      rect(c, x + 1, 40, 14, 2, P.wood);
    },
  },
  surfPoster: {
    w: 30, h: 25, wall: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      box(c, x, 0, 30, 25, P.woodLight, P.woodDeep);
      rect(c, x + 2, 2, 26, 21, color);
      ellipse(c, x + 20, 8, 5, 5, accent);
      rect(c, x + 2, 15, 26, 8, P.navy);
      drawWaveMark(c, x + 7, 4, P.foam);
      drawWaveMark(c, x + 6, 6, P.sky);
      for (const [left, y, w] of [[4, 19, 9], [17, 20, 8], [12, 22, 6]]) {
        rect(c, x + left, y, w, 1, P.foamShade);
      }
    },
  },
  sunsetPoster: {
    w: 30, h: 25, wall: true, outline: false,
    draw: (c, x) => {
      box(c, x, 0, 30, 25, P.woodLight, P.woodDeep);
      rect(c, x + 2, 2, 26, 14, P.coral);
      rect(c, x + 2, 11, 26, 5, P.thatch);
      ellipse(c, x + 17, 10, 5, 5, P.sun);
      rect(c, x + 2, 14, 26, 9, P.tealDark);
      rect(c, x + 13, 15, 11, 1, P.sun);
      rect(c, x + 14, 17, 6, 1, P.thatchLight);
      rect(c, x + 9, 21, 16, 1, P.foamShade);
      rect(c, x + 3, 8, 2, 15, P.navyDark);
      ellipse(c, x + 6, 7, 4, 2, P.navyDark);
      rect(c, x + 7, 8, 4, 1, P.navyDark);
    },
  },
  poster: {
    w: 16, h: 20, wall: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      box(c, x, 0, 16, 20, P.woodLight, P.woodDeep);
      rect(c, x + 2, 2, 12, 16, P.parchment);
      rect(c, x + 3, 3, 10, 10, color);
      drawSmallWaveMark(c, x + 4, 5, accent);
      rect(c, x + 3, 14, 9, 1, P.woodDark);
      rect(c, x + 3, 16, 6, 1, P.wood);
    },
  },
  pendant: {
    w: 28, h: 30, foot: { w: 1, h: 1 }, wall: true, outline: false,
    frames: 3, animation: { frameMs: 520, pingPong: true },
    draw: (c, x, frame) => {
      c.save();
      c.globalAlpha = [0.24, 0.19, 0.22][frame];
      ellipse(c, x + 14, 21, 13, 8, P.glowWarm);
      ellipse(c, x + 14, 21, 9, 6, P.glowWarm);
      c.restore();
      rect(c, x + 13, 0, 2, 13, P.woodDeep);
      ellipse(c, x + 14, 20, 5, 4, P.glowWarm);
      ellipse(c, x + 14, 20, 4, 3, P.glow);
      rect(c, x + 11, 12, 6, 3, P.woodDark);
      rect(c, x + 9, 14, 10, 3, P.iron);
      rect(c, x + 7, 16, 14, 3, P.ironDark);
      rect(c, x + 8, 16, 7, 1, P.bagSilver);
      rect(c, x + 8, 18, 12, 1, P.sunDark);
    },
  },
  vines: {
    w: 23, h: 25, wall: true, outline: false,
    draw: (c, x) => {
      const random = rng(42);
      for (const [left, height] of [[5, 17], [11, 23], [17, 13]]) {
        rect(c, x + left, 0, 1, height, P.leafDeep);
        for (let y = 2; y < height; y += 3) {
          const dx = y % 2 === 0 ? -2 : 2;
          const size = random() > 0.5 ? 3 : 2;
          ellipse(c, x + left + dx, y + 1, size, 2, P.leafDeep);
          ellipse(c, x + left + dx, y, size, 1, P.leaf);
          px(c, x + left + dx - 1, y - 1, P.leafLight);
        }
      }
    },
  },
  pottedPalm: pottedPlant(false),
  hibiscusPot: pottedPlant(true),
  logPost: {
    w: 12, h: 21, solid: true, outline: false,
    draw: (c, x) => {
      box(c, x + 1, 3, 10, 18, P.wood, P.woodDeep);
      rect(c, x + 8, 5, 2, 14, P.woodDark);
      ellipse(c, x + 6, 3, 5, 3, P.woodLight);
      ellipse(c, x + 6, 3, 3, 1, P.sandDark);
    },
  },
  ropePosts: {
    w: 32, h: 21, outline: false,
    draw: (c, x) => {
      for (let i = 5; i <= 26; i++) {
        const y = 6 + Math.round(4 - (i - 15) ** 2 / 32);
        rect(c, x + i, y, 1, 2, P.woodDeep);
        px(c, x + i, y, i % 3 === 0 ? P.sandDark : P.parchment);
      }
      for (const left of [2, 25]) {
        box(c, x + left, 4, 5, 17, P.wood, P.woodDeep);
        rect(c, x + left + 1, 5, 1, 13, P.woodLight);
        rect(c, x + left + 1, 3, 3, 1, P.thatchLight);
        rect(c, x + left, 7, 5, 2, P.parchment);
      }
    },
  },
  waveMat: waveRug(32, 16, 1),
  waveRug: waveRug(60, 30, 2),
  roundRug: {
    w: 29, h: 18, flat: true,
    draw: (c, x) => {
      ellipse(c, x + 14, 9, 14, 8, P.thatchDark);
      for (const [rx, ry, color] of [[13, 7, P.sandLight], [11, 6, P.sandDark], [9, 5, P.sand], [7, 4, P.sandDark], [5, 3, P.sandLight], [3, 2, P.sandDark]] as const) {
        ellipse(c, x + 14, 8, rx, ry, color);
      }
      rect(c, x + 12, 8, 5, 1, P.thatchDark);
    },
  },
  rug: {
    w: 48, h: 32, foot: { w: 3, h: 2 }, flat: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      weaveRug(c, x, 48, 32, color);
      for (const y of [4, 27]) rect(c, x + 4, y, 40, 1, accent);
      for (const left of [4, 43]) rect(c, x + left, 5, 1, 22, accent);
    },
  },
  wickerChair: {
    w: 21, h: 24, foot: { w: 1, h: 1 }, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 10, 10, 10, 10, P.woodDark);
      ellipse(c, x + 10, 9, 9, 8, P.sandDark);
      for (let y = 5; y < 14; y += 2) {
        for (let i = y % 4 === 1 ? 4 : 5; i < 17; i += 2) px(c, x + i, y, P.woodLight);
      }
      box(c, x + 2, 13, 17, 8, P.thatch, P.woodDark);
      box(c, x + 5, 9, 10, 8, P.cream, P.sandDark);
      drawSmallWaveMark(c, x + 6, 9, P.signTeal);
      rect(c, x + 3, 16, 2, 3, P.thatchLight);
      rect(c, x + 16, 16, 2, 3, P.thatchLight);
      rect(c, x + 6, 19, 9, 1, P.wood);
      rect(c, x + 3, 21, 2, 3, P.woodDeep);
      rect(c, x + 16, 21, 2, 3, P.woodDeep);
    },
  },
  pouf: {
    w: 14, h: 11, solid: true, outline: false,
    draw: (c, x) => {
      box(c, x + 1, 3, 12, 8, P.thatch, P.woodDark);
      ellipse(c, x + 7, 3, 6, 3, P.sandDark);
      ellipse(c, x + 7, 3, 4, 1, P.sandLight);
      for (let i = 3; i < 12; i += 2) {
        px(c, x + i, 7, P.sandDark);
        px(c, x + i - 1, 9, P.thatchDark);
      }
    },
  },
  towelBench: {
    w: 32, h: 19, solid: true, outline: false,
    draw: (c, x) => {
      box(c, x + 1, 1, 30, 10, P.wood, P.woodDeep);
      box(c, x + 1, 10, 30, 5, P.woodLight, P.woodDeep);
      rect(c, x + 3, 14, 2, 5, P.woodDeep);
      rect(c, x + 27, 14, 2, 5, P.woodDeep);
      rect(c, x + 8, 0, 11, 12, P.teal);
      rect(c, x + 10, 0, 2, 12, P.cream);
      rect(c, x + 15, 0, 2, 12, P.cream);
      rect(c, x + 8, 10, 11, 2, P.tealDark);
      for (let i = 8; i < 19; i += 2) px(c, x + i, 12, P.parchment);
    },
  },
  wallMirror: mirror(false),
  standingMirror: mirror(true),
} satisfies Record<string, PropSpec>;
