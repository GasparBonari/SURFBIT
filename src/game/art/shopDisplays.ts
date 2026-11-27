import { box, ellipse, px, rect, shade, type Ctx } from "./canvas";
import { drawBoard, drawShirt, drawSmallWaveMark } from "./motifs";
import { P } from "./palette";
import type { PropSpec, Tint } from "./props";

function drawCubby(c: Ctx, x: number, y: number, w: number, h: number) {
  box(c, x, y, w, h, P.wood, P.woodDeep);
  rect(c, x + 1, y + 1, w - 2, 1, P.woodLight);
  rect(c, x + 2, y + h - 2, w - 4, 1, P.woodDark);
  rect(c, x + Math.floor(w / 2) - 1, y + 2, 3, 1, P.woodDeep);
}

// Keep the tabletop profile consistent across the floor displays.
export function displayTable(drawGoods: (ctx: Ctx, x: number, tint: Tint) => void): PropSpec {
  return {
    w: 46, h: 24, solid: true, outline: false,
    draw: (c, x, _f, tint) => {
      ellipse(c, x + 23, 21, 22, 2, P.shadow);
      box(c, x + 3, 14, 40, 8, P.woodDark, P.woodDeep);
      for (const left of [7, 19, 31]) drawCubby(c, x + left, 17, 8, 5);
      rect(c, x + 3, 16, 3, 8, P.woodDeep);
      rect(c, x + 40, 16, 3, 8, P.woodDeep);
      box(c, x, 3, 46, 15, P.woodLight, P.woodDeep);
      rect(c, x + 1, 4, 44, 1, P.thatchLight);
      rect(c, x + 1, 10, 44, 1, P.wood);
      rect(c, x + 1, 15, 44, 2, P.wood);
      drawGoods(c, x, tint);
    },
  };
}

function drawCap(c: Ctx, x: number, y: number, color: string) {
  ellipse(c, x + 4, y + 4, 4, 3, shade(color, -0.32));
  ellipse(c, x + 4, y + 3, 3, 2, color);
  rect(c, x + 2, y + 5, 8, 1, color);
  rect(c, x + 2, y + 6, 8, 1, shade(color, -0.3));
  px(c, x + 3, y + 2, shade(color, 0.35));
  px(c, x + 5, y + 3, color === P.cream ? P.navy : P.cream);
}

function drawDisplayBoard(c: Ctx, x: number, y: number, w: number, h: number, tint: Tint) {
  drawBoard(c, x, y, w, h, shade(tint.color, -0.38), shade(tint.color, -0.38));
  drawBoard(c, x + 1, y + 2, w - 2, h - 3, tint.color, tint.accent);
  drawSmallWaveMark(c, x + Math.floor((w - 8) / 2), y + Math.floor(h * 0.59), tint.accent);
}

function drawFin(c: Ctx, x: number, y: number, color: string) {
  const dark = shade(color, -0.42);
  for (let row = 0; row < 8; row++) {
    const left = x + Math.floor((7 - row) / 2);
    const width = row + 1;
    rect(c, left, y + row, width, 1, dark);
    if (row > 1) rect(c, left + 1, y + row, width - 2, 1, color);
    if (row > 3) px(c, left + 1, y + row, shade(color, 0.3));
  }
  rect(c, x, y + 8, 8, 1, dark);
}

function drawFoldedTee(c: Ctx, x: number, y: number, color: string, accent: string) {
  box(c, x, y, 11, 9, color, shade(color, -0.36));
  rect(c, x + 1, y + 1, 8, 1, shade(color, 0.3));
  rect(c, x + 1, y + 7, 9, 1, shade(color, -0.2));
  drawSmallWaveMark(c, x + 1, y + 1, accent);
}

function drawBottle(c: Ctx, x: number, y: number, color: string, accent: string) {
  rect(c, x + 1, y, 4, 2, P.woodDeep);
  box(c, x, y + 2, 6, 6, color, shade(color, -0.35));
  rect(c, x + 1, y + 4, 4, 2, accent);
  px(c, x + 1, y + 3, P.cream);
}

function drawDayPack(c: Ctx, x: number, y: number, { color, accent }: Tint) {
  rect(c, x + 4, y, 4, 3, P.navyDark);
  rect(c, x + 2, y + 3, 8, 1, P.navyDark);
  box(c, x, y + 4, 12, 15, color, P.navyDark);
  rect(c, x + 1, y + 5, 1, 10, P.fishBlue);
  rect(c, x + 2, y + 4, 5, 1, P.fishBlue);
  rect(c, x + 2, y + 7, 7, 1, P.navyDark);
  px(c, x + 8, y + 8, accent);
  box(c, x + 2, y + 11, 9, 6, color, P.navyDark);
  rect(c, x + 3, y + 12, 6, 1, accent);
  px(c, x + 8, y + 13, P.cream);
  rect(c, x + 4, y + 19, 2, 2, P.navyDark);
  rect(c, x + 8, y + 19, 2, 2, P.navyDark);
}

function drawGarment(c: Ctx, x: number, y: number, { color, accent }: Tint, hoodie = false) {
  const dark = shade(color, -0.32);
  if (hoodie) {
    ellipse(c, x + 5, y, 4, 3, dark);
    ellipse(c, x + 5, y + 1, 2, 2, shade(color, 0.13));
  }
  drawShirt(c, x, y + 2, color, accent, hoodie);
  rect(c, x + 7, y + 7, 1, 5, dark);
  rect(c, x + 2, y + 11, 6, 1, dark);
  rect(c, x + 2, y + 3, 2, 1, shade(color, 0.35));
  if (hoodie) {
    rect(c, x + 3, y + 9, 4, 2, shade(color, 0.14));
    px(c, x + 4, y + 4, P.cream);
    px(c, x + 6, y + 5, P.cream);
  }
}

export function drawRackBase(c: Ctx, x: number, y: number, w: number) {
  box(c, x, y, w, 6, P.wood, P.woodDeep);
  rect(c, x + 1, y + 1, w - 2, 1, P.thatchLight);
  rect(c, x + 2, y + 4, w - 4, 1, P.woodDark);
}

function rack(drawItem: (ctx: Ctx, x: number, y: number, tint: Tint) => void, count: number): PropSpec {
  return {
    w: 16 * count, h: 37, solid: true, outline: false,
    draw: (c, x, _f, tint) => {
      const width = 16 * count;
      ellipse(c, x + width / 2, 34, width / 2 - 1, 2, P.shadow);
      rect(c, x + 2, 6, width - 4, 2, P.ironDark);
      rect(c, x + 3, 6, width - 6, 1, P.bagSilver);
      for (let i = 0; i < count; i++) {
        const left = x + i * 16 + 3;
        rect(c, left + 4, 8, 2, 3, P.iron);
        rect(c, left + 1, 11, 8, 1, P.woodLight);
        drawItem(c, left, 13, i === 0 ? tint : { color: i === 1 ? P.coral : P.signTeal, accent: P.cream });
      }
      for (const post of [x + 1, x + width - 5]) {
        box(c, post, 3, 4, 29, P.wood, P.woodDeep);
        rect(c, post + 1, 5, 1, 25, P.woodLight);
      }
      drawRackBase(c, x, 30, width);
    },
  };
}

export const SHOP_DISPLAYS = {
  crate: {
    w: 14, h: 14, solid: true, outline: false,
    draw: (c, x) => {
      drawCubby(c, x, 3, 14, 11);
      box(c, x, 0, 14, 5, P.woodLight, P.woodDeep);
      rect(c, x + 2, 1, 9, 1, P.thatchLight);
      rect(c, x + 2, 5, 1, 7, P.woodDeep);
      rect(c, x + 11, 5, 1, 7, P.woodDeep);
    },
  },
  coffeeTable: displayTable((c, x) => {
    box(c, x + 5, 4, 13, 10, P.deepBlue, P.navyDark);
    drawSmallWaveMark(c, x + 7, 4, P.sky);
    rect(c, x + 6, 12, 10, 1, P.parchment);
    box(c, x + 25, 6, 7, 8, P.cream, P.woodDark);
    rect(c, x + 26, 7, 5, 2, P.woodDark);
    box(c, x + 31, 8, 4, 4, P.woodLight, P.parchment);
  }),
  boardDisplay: {
    w: 14, h: 48, foot: { w: 1, h: 1 }, solid: true, outline: false,
    draw: (c, x, _f, tint) => {
      rect(c, x, 30, 14, 4, P.woodDeep);
      rect(c, x, 30, 14, 1, P.woodLight);
      rect(c, x + 1, 31, 2, 15, P.woodDark);
      rect(c, x + 11, 31, 2, 15, P.woodDark);
      drawDisplayBoard(c, x + 1, 0, 12, 45, tint);
      drawRackBase(c, x, 42, 14);
    },
  },
  wallBoardRack: {
    w: 32, h: 42, foot: { w: 2, h: 1 }, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      box(c, x + 1, 18, 30, 21, P.wood, P.woodDeep);
      rect(c, x + 2, 19, 28, 1, P.woodLight);
      drawDisplayBoard(c, x + 2, 4, 9, 34, { color: P.sun, accent: P.cream });
      drawDisplayBoard(c, x + 11, 0, 10, 38, { color, accent });
      drawDisplayBoard(c, x + 21, 6, 9, 32, { color: P.coral, accent: P.parchment });
      drawRackBase(c, x, 36, 32);
    },
  },
  boardRack: {
    w: 47, h: 52, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      ellipse(c, x + 23, 44, 23, 4, P.shadow);
      box(c, x + 1, 22, 45, 21, P.wood, P.woodDeep);
      rect(c, x + 2, 23, 43, 1, P.woodLight);
      drawDisplayBoard(c, x + 6, 6, 12, 36, { color: P.cream, accent: P.signTeal });
      drawDisplayBoard(c, x + 29, 5, 12, 37, { color: color === P.coral ? P.sun : P.signTeal, accent: P.sandLight });
      drawDisplayBoard(c, x + 16, 0, 15, 43, { color, accent });
      for (const left of [2, 40]) {
        box(c, x + left, 18, 5, 26, P.wood, P.woodDeep);
        rect(c, x + left + 1, 16, 3, 3, P.woodLight);
        rect(c, x + left + 1, 20, 1, 21, P.woodLight);
        rect(c, x + left, 24, 5, 2, P.sandDark);
      }
      drawRackBase(c, x + 2, 40, 43);
      rect(c, x + 24, 40, 2, 12, P.woodDeep);
      rect(c, x + 21, 50, 8, 2, P.woodDark);
      box(c, x + 17, 33, 15, 12, P.cream, P.woodDeep);
      ellipse(c, x + 20, 38, 1, 3, P.signTeal);
      rect(c, x + 24, 36, 6, 1, P.woodDark);
      rect(c, x + 24, 39, 5, 1, P.woodDark);
    },
  },
  finTable: displayTable((c, x, { color, accent }) => {
    rect(c, x + 3, 11, 40, 2, P.woodDark);
    for (const [index, fill] of [color, accent, P.navy, P.cream].entries()) {
      drawFin(c, x + 3 + index * 10, 3, fill);
      rect(c, x + 6 + index * 10, 13, 4, 1, P.parchment);
    }
  }),
  shelf: {
    w: 32, h: 32, foot: { w: 2, h: 1 }, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      box(c, x, 0, 32, 32, P.woodDark, P.woodDeep);
      for (const [i, left] of [3, 10, 17, 24].entries()) {
        drawBottle(c, x + left, 3 + i % 2, i % 2 === 0 ? color : accent, i % 2 === 0 ? accent : color);
        drawBottle(c, x + left, 13, i % 2 === 0 ? accent : color, P.cream);
        ellipse(c, x + left + 2, 25, 3, 2, shade(color, -0.25));
        ellipse(c, x + left + 2, 24, 3, 1, color);
      }
      for (const y of [1, 12, 22, 29]) rect(c, x + 1, y, 30, 1, P.woodLight);
    },
  },
  foldedShelf: {
    w: 32, h: 32, foot: { w: 2, h: 1 }, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      box(c, x, 0, 32, 32, P.woodDark, P.woodDeep);
      for (const y of [2, 12]) {
        drawFoldedTee(c, x + 3, y, color, accent);
        drawFoldedTee(c, x + 17, y, y === 2 ? P.coral : P.teal, P.cream);
        rect(c, x + 1, y + 9, 30, 1, P.woodLight);
      }
      drawCubby(c, x + 3, 24, 12, 6);
      drawCubby(c, x + 17, 24, 12, 6);
    },
  },
  capShelf: {
    w: 37, h: 33, solid: true, outline: false,
    draw: (c, x) => {
      box(c, x + 1, 2, 35, 31, P.woodDark, P.woodDeep);
      for (const y of [3, 13]) {
        drawCap(c, x + 3, y, P.cream);
        drawCap(c, x + 13, y, P.navy);
        drawCap(c, x + 23, y, P.coral);
        rect(c, x + 2, y + 7, 33, 2, P.woodLight);
      }
      drawCubby(c, x + 4, 24, 13, 7);
      drawCubby(c, x + 19, 24, 13, 7);
    },
  },
  clothesRack: {
    w: 32, h: 30, foot: { w: 2, h: 1 }, solid: true, outline: false,
    draw: (c, x, _f, tint) => {
      rect(c, x + 2, 4, 28, 2, P.ironDark);
      rect(c, x + 3, 4, 26, 1, P.bagSilver);
      for (const [index, item] of [{ color: P.deepBlue, accent: P.cream }, { color: P.signTeal, accent: P.cream }, tint].entries()) {
        const left = x + 3 + index * 8;
        rect(c, left + 4, 5, 2, 3, P.iron);
        rect(c, left + 2, 7, 6, 1, P.woodLight);
        drawGarment(c, left, 7 + index * 2, item);
      }
      for (const left of [0, 29]) {
        box(c, x + left, 2, 3, 25, P.wood, P.woodDeep);
        rect(c, x + left + 1, 3, 1, 22, P.woodLight);
      }
      drawRackBase(c, x, 24, 32);
    },
  },
  hoodieRack: rack((c, x, y, tint) => drawGarment(c, x, y, tint, true), 3),
  swimRack: rack((c, x, y, { color, accent }) => {
    rect(c, x + 2, y, 2, 9, color);
    rect(c, x + 6, y, 2, 9, color);
    rect(c, x + 3, y + 4, 4, 10, color);
    rect(c, x + 3, y + 4, 1, 8, shade(color, 0.32));
    rect(c, x + 6, y + 4, 1, 9, shade(color, -0.28));
    rect(c, x + 2, y + 11, 6, 1, accent);
    rect(c, x + 4, y + 14, 2, 2, color);
  }, 2),
  shortsMannequin: {
    w: 16, h: 37, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      ellipse(c, x + 8, 6, 3, 4, P.stoneLight);
      box(c, x + 5, 0, 7, 6, P.cream, P.sandDark);
      rect(c, x + 3, 5, 11, 2, P.parchment);
      px(c, x + 8, 3, P.navy);
      drawGarment(c, x + 3, 8, { color: P.cream, accent: P.navy });
      box(c, x + 4, 19, 8, 9, color, shade(color, -0.3));
      rect(c, x + 7, 24, 2, 4, shade(color, -0.3));
      px(c, x + 5, 22, accent);
      px(c, x + 6, 23, P.sun);
      px(c, x + 9, 21, accent);
      px(c, x + 10, 24, accent);
      rect(c, x + 7, 28, 2, 6, P.woodDark);
      ellipse(c, x + 8, 34, 5, 2, P.woodDeep);
    },
  },
  mannequin: {
    w: 16, h: 34, foot: { w: 1, h: 1 }, solid: true, outline: false,
    draw: (c, x, _f, tint) => {
      ellipse(c, x + 8, 31, 7, 2, P.shadow);
      ellipse(c, x + 8, 4, 3, 4, P.stoneDark);
      ellipse(c, x + 7, 3, 2, 3, P.stoneLight);
      drawGarment(c, x + 3, 8, tint, true);
      box(c, x + 4, 19, 8, 7, P.parchment, P.sandWetDark);
      rect(c, x + 7, 22, 2, 4, P.sandWetDark);
      rect(c, x + 7, 26, 2, 5, P.woodDark);
      ellipse(c, x + 8, 31, 5, 2, P.woodDeep);
      rect(c, x + 5, 30, 6, 1, P.woodLight);
    },
  },
  teeTable: displayTable((c, x, { color, accent }) => {
    for (const [index, fill] of [color, P.signTeal, P.deepBlue].entries()) {
      drawFoldedTee(c, x + 4 + index * 13, 5, fill, index === 0 ? accent : P.cream);
    }
  }),
  capTable: displayTable((c, x) => {
    drawCap(c, x + 4, 4, P.cream);
    drawCap(c, x + 17, 4, P.navy);
    drawCap(c, x + 30, 4, P.coral);
    rect(c, x + 9, 12, 11, 3, P.sun);
    rect(c, x + 9, 14, 11, 1, P.sunDark);
    rect(c, x + 24, 12, 12, 3, P.deepBlue);
    rect(c, x + 24, 14, 12, 1, P.navyDark);
  }),
  pegboard: {
    w: 30, h: 28, foot: { w: 2, h: 1 }, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      box(c, x, 0, 30, 24, P.thatchDark, P.woodDeep);
      box(c, x + 2, 2, 26, 19, P.sandDark, P.woodDark);
      for (let y = 4; y <= 18; y += 3) {
        for (let i = 4; i <= 25; i += 3) px(c, x + i, y, P.woodDark);
      }
      for (const [i, fill] of [color, accent, P.teal].entries()) {
        const left = x + 3 + i * 8;
        rect(c, left + 3, 5, 2, 3, P.iron);
        drawFin(c, left, 8, fill);
        rect(c, left + 1, 18, 4, 1, P.parchment);
      }
      rect(c, x + 1, 22, 28, 1, P.woodLight);
      rect(c, x + 2, 24, 3, 4, P.woodDeep);
      rect(c, x + 25, 24, 3, 4, P.woodDeep);
    },
  },
  wetsuitHanger: {
    w: 16, h: 36, foot: { w: 1, h: 1 }, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      const dark = shade(color, -0.27);
      rect(c, x + 7, 24, 2, 9, P.iron);
      ellipse(c, x + 8, 33, 7, 2, P.ironDark);
      rect(c, x + 5, 32, 5, 1, P.iron);
      rect(c, x + 7, 0, 2, 6, P.ironDark);
      rect(c, x + 3, 4, 10, 1, P.woodLight);
      rect(c, x + 4, 5, 8, 22, dark);
      rect(c, x + 4, 6, 7, 18, color);
      rect(c, x + 1, 7, 14, 6, dark);
      rect(c, x + 2, 7, 11, 4, color);
      rect(c, x + 5, 7, 1, 12, shade(color, 0.3));
      rect(c, x + 10, 8, 1, 12, accent);
      rect(c, x + 7, 6, 2, 2, P.ironDark);
      rect(c, x + 7, 20, 2, 7, P.woodDark);
      rect(c, x + 4, 25, 3, 1, accent);
      rect(c, x + 9, 25, 3, 1, accent);
    },
  },
  leashHooks: {
    w: 30, h: 27, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      box(c, x, 0, 30, 25, P.sandDark, P.woodDeep);
      rect(c, x + 1, 1, 28, 2, P.woodLight);
      rect(c, x + 1, 22, 28, 2, P.wood);
      for (const left of [5, 15, 25]) {
        rect(c, x + left, 4, 2, 3, P.iron);
        ellipse(c, x + left, 14, 4, 8, shade(color, -0.35));
        ellipse(c, x + left, 13, 3, 7, color);
        ellipse(c, x + left, 14, 2, 6, P.sandDark);
        rect(c, x + left - 3, 5, 6, 4, accent);
        px(c, x + left - 2, 6, P.parchment);
      }
      rect(c, x + 2, 24, 3, 3, P.woodDeep);
      rect(c, x + 25, 24, 3, 3, P.woodDeep);
    },
  },
  padTable: displayTable((c, x, { color, accent }) => {
    for (const left of [5, 17, 29]) {
      rect(c, x + left, 6, 10, 7, P.ironDark);
      rect(c, x + left + 1, 4, 8, 11, color);
      rect(c, x + left + 2, 15, 6, 1, P.ironDark);
      rect(c, x + left + 4, 5, 2, 9, P.ink);
      for (let y = 6; y < 13; y += 2) {
        px(c, x + left + 2, y, shade(color, 0.35));
        px(c, x + left + 7, y + 1, shade(color, 0.35));
      }
      px(c, x + left + 4, 14, accent);
    }
  }),
  bagRack: {
    w: 32, h: 44, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      box(c, x + 1, 22, 30, 20, P.woodLight, P.woodDeep);
      for (const [left, top, fill] of [[3, 0, shade(color, -0.2)], [15, 4, color]] as const) {
        drawBoard(c, x + left, top, 13, 41 - top, P.iron, P.iron);
        drawBoard(c, x + left + 1, top + 2, 11, 38 - top, fill, fill);
        rect(c, x + left + 10, top + 10, 1, 27 - top, P.iron);
        rect(c, x + left + 2, top + 15, 8, 2, accent);
        rect(c, x + left + 10, 17, 4, 7, accent);
        rect(c, x + left + 11, 19, 2, 3, P.iron);
        px(c, x + left + 10, top + 10, P.cream);
      }
      drawRackBase(c, x + 1, 38, 30);
    },
  },
  shadesStand: {
    w: 32, h: 33, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      box(c, x + 21, 1, 10, 16, P.sky, P.woodDeep);
      rect(c, x + 22, 2, 7, 1, P.cream);
      rect(c, x + 23, 5, 4, 2, P.foamShade);
      rect(c, x + 25, 17, 2, 9, P.woodDark);
      rect(c, x + 22, 25, 8, 2, P.wood);
      box(c, x + 2, 5, 17, 25, P.parchment, P.woodDeep);
      rect(c, x + 3, 6, 15, 1, P.cream);
      for (const [y, frame] of [[9, color], [16, P.woodDark], [23, color]] as const) {
        rect(c, x + 4, y, 13, 2, frame);
        rect(c, x + 5, y + 2, 4, 2, frame);
        rect(c, x + 12, y + 2, 4, 2, frame);
        rect(c, x + 5, y + 1, 3, 1, accent);
        rect(c, x + 12, y + 1, 3, 1, accent);
      }
      drawRackBase(c, x, 27, 32);
    },
  },
  bottleFridge: {
    w: 30, h: 41, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      ellipse(c, x + 15, 39, 14, 1, P.shadow);
      box(c, x + 1, 0, 28, 39, P.bagSilver, P.ironDark);
      rect(c, x + 2, 1, 24, 1, P.foam);
      rect(c, x + 25, 2, 3, 35, P.iron);
      box(c, x + 3, 4, 21, 28, P.signTealDark, P.ironDark);
      rect(c, x + 4, 5, 18, 1, P.foamShade);
      for (const y of [7, 20]) {
        drawBottle(c, x + 5, y, color, accent);
        drawBottle(c, x + 11, y + 2, P.navy, accent);
        drawBottle(c, x + 17, y + 1, color, accent);
        rect(c, x + 4, y + 10, 19, 1, P.sky);
      }
      rect(c, x + 4, 8, 1, 19, P.foamShade);
      rect(c, x + 22, 13, 2, 10, P.ironDark);
      px(c, x + 22, 14, P.foam);
      for (const y of [34, 36]) rect(c, x + 6, y, 15, 1, P.iron);
    },
  },
  packHooks: {
    w: 30, h: 36, solid: true, outline: false,
    draw: (c, x, _f, tint) => {
      box(c, x, 2, 30, 30, P.sandDark, P.woodDeep);
      rect(c, x + 1, 3, 28, 2, P.woodLight);
      rect(c, x + 14, 5, 1, 26, P.wood);
      rect(c, x + 2, 30, 26, 1, P.woodDark);
      rect(c, x + 7, 6, 2, 4, P.iron);
      rect(c, x + 21, 6, 2, 4, P.iron);
      drawDayPack(c, x + 2, 10, tint);
      drawDayPack(c, x + 16, 8, { color: P.signTeal, accent: P.cream });
      rect(c, x + 2, 32, 3, 4, P.woodDeep);
      rect(c, x + 25, 32, 3, 4, P.woodDeep);
    },
  },
  towelLadder: {
    w: 16, h: 38, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      box(c, x + 1, 0, 3, 36, P.woodLight, P.woodDeep);
      box(c, x + 12, 2, 3, 36, P.woodLight, P.woodDeep);
      for (const y of [4, 15, 26, 34]) rect(c, x + 3, y, 10, 2, P.woodDark);
      for (const [y, fill, dark] of [[4, color, P.coralDark], [16, P.teal, P.tealDark], [27, color, P.coralDark]] as const) {
        rect(c, x + 3, y + 1, 10, 9, dark);
        rect(c, x + 3, y, 9, 8, fill);
        rect(c, x + 3, y, 9, 1, accent);
        rect(c, x + 5, y + 2, 2, 7, accent);
        rect(c, x + 9, y + 2, 1, 7, accent);
        for (const left of [4, 7, 10]) px(c, x + left, y + 10, P.parchment);
      }
    },
  },
  stickerRack: {
    w: 28, h: 37, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      ellipse(c, x + 14, 34, 11, 2, P.shadow);
      ellipse(c, x + 14, 33, 8, 2, P.ironDark);
      rect(c, x + 13, 4, 3, 28, P.ironDark);
      rect(c, x + 13, 5, 1, 27, P.bagSilver);
      box(c, x + 6, 0, 16, 8, P.navy, P.navyDark);
      drawSmallWaveMark(c, x + 10, 0, color);
      for (const [y, inset] of [[9, 2], [20, 0]]) {
        rect(c, x + inset, y + 8, 28 - inset * 2, 2, P.ironDark);
        for (const [i, mark] of [accent, P.navy, P.signTeal].entries()) {
          const left = x + 2 + inset + i * 7;
          box(c, left, y + i % 2, 8, 9, color, P.woodDark);
          px(c, left + 3, y + i % 2 + 2, P.sandDark);
          rect(c, left + 2, y + i % 2 + 4, 4, 2, mark);
          px(c, left + 3, y + i % 2 + 3, mark);
        }
      }
    },
  },
} satisfies Record<string, PropSpec>;
