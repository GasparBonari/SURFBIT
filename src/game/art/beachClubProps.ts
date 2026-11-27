import { box, ellipse, px, rect, shade, type Ctx } from "./canvas";
import { drawText } from "./font";
import { drawSmallWaveMark } from "./motifs";
import { P } from "./palette";
import type { PropSpec } from "./props";

function drawCup(c: Ctx, x: number, y: number, background: string) {
  box(c, x + 6, y + 2, 4, 4, background, P.cream);
  rect(c, x, y + 2, 7, 5, P.parchment);
  rect(c, x, y + 2, 7, 1, P.cream);
  rect(c, x - 1, y + 8, 10, 1, P.sandDark);
  px(c, x + 3, y, P.cream);
}

function drawEasel(c: Ctx, x: number, w: number, h: number) {
  ellipse(c, x + w / 2, h - 2, w / 2 - 1, 2, P.shadow);
  for (const left of [x + 3, x + w - 6]) {
    rect(c, left, 8, 3, h - 9, P.woodDeep);
    rect(c, left, 8, 1, h - 9, P.woodLight);
  }
  rect(c, x + 2, h - 6, w - 4, 2, P.woodDark);
}

export const BEACH_CLUB_PROPS = {
  clubSign: {
    w: 80, h: 27, wall: true, outline: false,
    draw: (c, x) => {
      box(c, x + 1, 5, 78, 21, P.woodLight, P.woodDeep);
      box(c, x + 3, 7, 74, 17, P.navy, P.navyDark);
      box(c, x + 32, 0, 16, 13, P.navy, P.woodDeep);
      rect(c, x + 33, 1, 14, 1, P.woodLight);
      rect(c, x + 33, 9, 14, 4, P.navy);
      drawCup(c, x + 36, 3, P.navy);
      rect(c, x + 5, 9, 25, 1, P.deepBlue);
      rect(c, x + 50, 9, 25, 1, P.deepBlue);
      px(c, x + 6, 17, P.sky);
      px(c, x + 73, 17, P.sky);
      drawText(c, "BEACH CLUB", x + 16, 15, P.cream, 2);
    },
  },
  seaWindow: {
    w: 64, h: 31, wall: true, outline: false,
    draw: (c, x) => {
      box(c, x + 1, 0, 62, 29, P.woodLight, P.woodDeep);
      rect(c, x + 4, 3, 56, 22, P.sky);
      rect(c, x + 4, 9, 56, 4, P.foamShade);
      rect(c, x + 8, 6, 12, 1, P.foam);
      rect(c, x + 37, 8, 17, 1, P.foam);
      rect(c, x + 4, 13, 56, 12, P.water);
      rect(c, x + 4, 13, 56, 1, P.deepBlue);
      for (const [left, y, w] of [[8, 16, 10], [27, 17, 12], [43, 19, 15], [5, 22, 53]]) {
        rect(c, x + left, y, w, 1, P.foamShade);
        rect(c, x + left + 2, y + 1, w - 3, 1, P.waterLight);
      }
      rect(c, x + 33, 20, 10, 1, P.foam);
      rect(c, x + 8, 21, 23, 1, P.foam);
      for (const left of [22, 41]) {
        rect(c, x + left, 2, 2, 25, P.woodDeep);
        rect(c, x + left, 2, 1, 25, P.woodLight);
      }
      box(c, x, 26, 64, 5, P.wood, P.woodDeep);
      rect(c, x + 1, 26, 62, 1, P.thatchLight);
    },
  },
  clubStringLights: {
    w: 288, h: 19, wall: true, outline: false,
    draw: (c, x) => {
      for (let i = 0; i < 288; i++) {
        const y = 2 + Math.round(6 * Math.sin((i % 96) * Math.PI / 96));
        px(c, x + i, y, P.woodDeep);
        if (i % 16 !== 8) continue;
        c.save();
        c.globalAlpha = 0.24;
        ellipse(c, x + i, y + 4, 6, 5, P.glowWarm);
        c.restore();
        px(c, x + i, y + 1, P.ironDark);
        rect(c, x + i - 1, y + 2, 3, 3, P.glowWarm);
        rect(c, x + i - 1, y + 2, 2, 2, P.glow);
      }
    },
  },
  barCounter: {
    w: 64, h: 32, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 32, 29, 31, 3, P.shadow);
      box(c, x + 2, 13, 60, 17, P.wood, P.woodDeep);
      for (let i = 4; i < 60; i += 5) {
        rect(c, x + i, 17, 1, 11, P.woodLight);
        rect(c, x + i + 1, 17, 1, 11, P.woodDark);
      }
      box(c, x, 10, 64, 8, P.woodLight, P.woodDeep);
      rect(c, x + 2, 11, 60, 1, P.thatchLight);
      rect(c, x + 1, 16, 62, 1, P.woodDark);
      box(c, x + 14, 19, 36, 9, P.navy, P.woodDeep);
      drawText(c, "COFFEE", x + 21, 21, P.cream);
      box(c, x + 39, 1, 20, 13, P.iron, P.ironDark);
      rect(c, x + 40, 2, 17, 2, P.bagSilver);
      rect(c, x + 43, 6, 13, 6, P.ironDark);
      rect(c, x + 44, 7, 5, 1, P.iron);
      rect(c, x + 47, 9, 4, 3, P.cream);
      px(c, x + 51, 10, P.parchment);
      drawCup(c, x + 5, 5, P.woodLight);
      drawCup(c, x + 26, 4, P.woodLight);
    },
  },
  beanShelf: {
    w: 32, h: 30, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      box(c, x + 1, 1, 30, 28, P.wood, P.woodDeep);
      rect(c, x + 2, 2, 28, 1, P.woodLight);
      for (const y of [3, 16]) {
        rect(c, x + 3, y, 26, 11, P.woodDeep);
        for (const left of [5, 13, 21]) {
          rect(c, x + left, y + 2, 6, 8, color);
          rect(c, x + left, y + 1, 6, 2, accent);
          rect(c, x + left, y + 5, 4, 3, accent);
          px(c, x + left + 1, y + 6, P.finBrown);
          rect(c, x + left + 5, y + 3, 1, 7, shade(color, -0.2));
        }
        rect(c, x + 2, y + 11, 28, 1, P.woodLight);
        rect(c, x + 2, y + 12, 28, 1, P.woodDark);
      }
    },
  },
  lessonBoard: {
    w: 48, h: 33, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      drawEasel(c, x, 48, 33);
      box(c, x + 1, 1, 46, 27, P.woodLight, P.woodDeep);
      box(c, x + 3, 3, 42, 23, accent, P.woodDark);
      drawText(c, "LESSONS", x + 6, 6, color);
      drawSmallWaveMark(c, x + 35, 5, P.deepBlue);
      rect(c, x + 6, 13, 36, 1, P.sandDark);
      drawText(c, "AM", x + 6, 16, P.navy);
      drawText(c, "PM", x + 25, 16, P.navy);
      rect(c, x + 15, 18, 7, 1, color);
      rect(c, x + 34, 18, 7, 1, color);
      rect(c, x + 7, 23, 33, 1, P.parchment);
    },
  },
  memberBoard: {
    w: 16, h: 24, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      drawEasel(c, x, 16, 24);
      box(c, x, 1, 16, 15, P.woodLight, P.woodDeep);
      box(c, x + 2, 3, 12, 11, color, P.sunDark);
      drawSmallWaveMark(c, x + 4, 3, accent);
      rect(c, x + 5, 11, 6, 1, accent);
    },
  },
  guideRack: {
    w: 16, h: 26, solid: true, outline: false,
    draw: (c, x) => {
      drawEasel(c, x, 16, 26);
      box(c, x, 1, 16, 22, P.wood, P.woodDeep);
      for (const [y, color] of [[3, P.deepBlue], [13, P.teal]] as const) {
        rect(c, x + 2, y, 12, 8, P.woodDark);
        rect(c, x + 4, y, 9, 8, P.cream);
        rect(c, x + 5, y + 1, 7, 6, color);
        drawSmallWaveMark(c, x + 5, y + 1, P.foam);
        rect(c, x + 1, y + 8, 14, 1, P.woodLight);
      }
    },
  },
  storyFrame: {
    w: 30, h: 28, solid: true, outline: false,
    draw: (c, x) => {
      drawEasel(c, x, 30, 28);
      box(c, x + 1, 0, 28, 21, P.woodLight, P.woodDeep);
      rect(c, x + 3, 2, 24, 17, P.parchment);
      rect(c, x + 4, 3, 22, 14, P.sandDark);
      rect(c, x + 4, 11, 22, 2, P.finBrown);
      rect(c, x + 13, 8, 10, 8, P.woodDark);
      rect(c, x + 16, 11, 3, 5, P.woodDeep);
      rect(c, x + 11, 7, 13, 2, P.woodDeep);
      for (const left of [6, 9, 12]) rect(c, x + left, 9, 2, 7, P.cream);
      rect(c, x + 5, 13, 9, 1, P.woodDark);
      rect(c, x + 10, 18, 10, 1, P.finBrown);
    },
  },
  dropCrate: {
    w: 32, h: 26, solid: true, outline: false,
    draw: (c, x) => {
      ellipse(c, x + 16, 24, 15, 2, P.shadow);
      box(c, x + 2, 8, 28, 16, P.wood, P.woodDeep);
      rect(c, x + 3, 18, 26, 1, P.woodDark);
      rect(c, x + 3, 19, 25, 1, P.woodLight);
      box(c, x, 5, 32, 10, P.teal, P.signTealDark);
      rect(c, x + 4, 2, 24, 5, P.signTealDark);
      rect(c, x + 5, 3, 22, 4, P.teal);
      rect(c, x + 6, 3, 19, 1, P.sky);
      rect(c, x + 2, 7, 3, 6, P.sky);
      rect(c, x + 26, 7, 3, 7, P.tealDark);
      box(c, x + 6, 8, 20, 15, P.cream, P.woodDeep);
      drawText(c, "SURF", x + 8, 10, P.navy);
      drawText(c, "KIT", x + 10, 16, P.navy);
    },
  },
} satisfies Record<string, PropSpec>;
