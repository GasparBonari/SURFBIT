import { box, ellipse, px, rect, rng, shade, type Ctx } from "./canvas";
import { drawText, textWidth } from "./font";
import { drawBoard, drawShirt, drawWaveMark } from "./motifs";
import { P } from "./palette";
import type { PropSpec, Tint } from "./props";

function shopSign(label: string, trim: string): PropSpec {
  return {
    w: 90, h: 30, wall: true, outline: false,
    draw: (c, x) => {
      box(c, x + 1, 7, 88, 22, P.signTeal, P.woodDeep);
      box(c, x + 24, 1, 42, 10, P.signTeal, P.woodDeep);
      rect(c, x + 2, 8, 86, 1, trim);
      rect(c, x + 25, 2, 40, 1, trim);
      rect(c, x + 25, 7, 40, 3, P.signTeal);
      rect(c, x + 3, 26, 84, 2, P.signTealDark);
      drawWaveMark(c, x + 34, 4, P.cream);
      drawText(c, "SURFBIT", x + 32, 13, P.cream);
      drawText(c, label, x + (90 - textWidth(label)) / 2, 20, P.cream);
      rect(c, x + 11, 22, 12, 1, trim);
      rect(c, x + 67, 22, 12, 1, trim);
    },
  };
}

function waveRug(w: number, h: number, scale: number): PropSpec {
  return {
    w, h, flat: true, outline: false, foot: { w: Math.ceil(w / 16), h: Math.ceil(h / 16) },
    draw: (c, x, _f, { color, accent }) => {
      box(c, x + 1, 1, w - 2, h - 2, color, shade(color, -0.3));
      for (let i = 3; i < w - 2; i += 2) {
        px(c, x + i, 2, accent);
        px(c, x + i, h - 3, accent);
      }
      drawWaveMark(c, x + (w - 22 * scale) / 2, (h - 8 * scale) / 2, accent, scale);
    },
  };
}

// Displays share a table frame so the objects on top distinguish their purpose.
function displayTable(drawGoods: (ctx: Ctx, x: number, tint: Tint) => void): PropSpec {
  return {
    w: 46, h: 24, solid: true, outline: false,
    draw: (c, x, _f, tint) => {
      box(c, x + 1, 3, 44, 21, P.woodDark, P.woodDeep);
      rect(c, x + 2, 7, 42, 10, P.woodLight);
      rect(c, x + 4, 21, 4, 3, P.woodDeep);
      rect(c, x + 38, 21, 4, 3, P.woodDeep);
      drawGoods(c, x, tint);
      rect(c, x + 2, 17, 42, 1, P.sandDark);
    },
  };
}

function drawCap(c: Ctx, x: number, y: number, color: string) {
  ellipse(c, x + 4, y + 4, 4, 3, shade(color, -0.2));
  ellipse(c, x + 4, y + 3, 3, 2, color);
  rect(c, x + 2, y + 5, 8, 2, color);
  px(c, x + 4, y + 3, color === P.cream ? P.navy : P.cream);
}

function mirror(standing: boolean): PropSpec {
  return {
    w: 16, h: 31, wall: !standing, solid: standing, outline: false,
    draw: (c, x) => {
      if (standing) {
        ellipse(c, x + 8, 13, 7, 13, P.woodDeep);
        ellipse(c, x + 8, 13, 5, 11, P.sky);
        rect(c, x + 3, 25, 10, 3, P.woodDark);
        rect(c, x + 1, 29, 14, 2, P.woodDeep);
      } else {
        box(c, x + 1, 0, 14, 30, P.wood, P.woodDeep);
        box(c, x + 3, 2, 10, 26, P.sky, P.woodLight);
      }
      for (let i = 0; i < 7; i++) {
        rect(c, x + 10 - i, 7 + i, 2, 1, P.foam);
        px(c, x + 10 - i, 17 + i, P.foamShade);
      }
    },
  };
}

function rack(drawItem: (ctx: Ctx, x: number, y: number, tint: Tint) => void, count: number): PropSpec {
  return {
    w: 16 * count, h: 37, solid: true, outline: false,
    draw: (c, x, _f, tint) => {
      const width = 16 * count;
      box(c, x + 1, 4, width - 2, 5, P.woodLight, P.woodDeep);
      box(c, x + 2, 3, 4, 31, P.wood, P.woodDeep);
      box(c, x + width - 6, 3, 4, 31, P.wood, P.woodDeep);
      for (let i = 0; i < count; i++) {
        const left = x + i * 16 + 3;
        rect(c, left + 4, 8, 2, 3, P.iron);
        drawItem(c, left, 11, i === 0 ? tint : { color: shade(tint.color, i * -0.14), accent: tint.accent });
      }
      box(c, x, 31, width, 5, P.wood, P.woodDeep);
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
      box(c, center - 5, ground - 10, 10, 9, P.terracotta, P.woodDeep);
      rect(c, center - 6, ground - 10, 12, 2, P.woodLight);
      rect(c, center, 12, 2, ground - 22, P.trunkDark);
      const reach = flowering ? 8 : 15;
      for (const direction of [-1, 1]) {
        for (let i = 0; i < reach; i++) {
          const left = center + i * direction;
          const curve = Math.floor((i - reach / 4) ** 2 / reach);
          const thickness = i > reach - 4 ? 2 : 4;
          rect(c, left, 5 + curve, 1, thickness, P.leafDark);
          px(c, left, 5 + curve, i % 3 === 0 ? P.leafGlint : P.leafLight);
          rect(c, left, 11 + Math.floor(curve / 2), 1, thickness, P.leaf);
          px(c, left, 11 + Math.floor(curve / 2) + thickness, P.leafDeep);
          if (!flowering && i < reach - 4) {
            rect(c, left, 16 + curve, 1, thickness, P.leafDark);
            px(c, left, 16 + curve, P.leafLight);
          }
        }
      }
      ellipse(c, center, 7, 2, 6, P.leaf);
      if (flowering) {
        for (const [dx, y] of [[-5, 9], [0, 5], [6, 13]]) {
          ellipse(c, center + dx, y, 3, 2, P.hibiscus);
          px(c, center + dx, y, P.sun);
        }
      }
    },
  };
}

export const INTERIOR_PROPS = {
  boardsSign: shopSign("BOARDS", P.woodLight),
  wearSign: shopSign("WEAR", P.woodLight),
  gearSign: shopSign("GEAR", P.sun),
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
      ellipse(c, x + 30, 18, 4, 2, P.cream);
      rect(c, x + 4, 24, 35, 9, P.water);
      rect(c, x + 4, 25, 35, 1, P.foam);
      rect(c, x + 4, 30, 35, 3, P.sand);
      rect(c, x + 20, 9, 2, 24, P.woodDeep);
      rect(c, x + 4, 22, 35, 2, P.woodDeep);
      for (const y of [4, 7, 10, 13]) {
        rect(c, x + 4, y, 35, 3, P.wood);
        rect(c, x + 4, y, 35, 1, P.woodLight);
      }
    },
  },
  sideWindow: {
    w: 16, h: 43, wall: true, outline: false,
    draw: (c, x) => {
      box(c, x, 0, 16, 43, P.woodLight, P.woodDeep);
      box(c, x + 2, 2, 12, 39, P.sky, P.woodDeep);
      rect(c, x + 3, 17, 10, 23, P.water);
      rect(c, x + 3, 26, 10, 1, P.foam);
      rect(c, x + 3, 34, 10, 6, P.sand);
      rect(c, x + 7, 3, 2, 37, P.woodDeep);
      rect(c, x + 2, 15, 12, 2, P.woodDeep);
      rect(c, x + 2, 29, 12, 2, P.woodDeep);
    },
  },
  surfPoster: {
    w: 30, h: 25, wall: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      box(c, x, 0, 30, 25, P.cream, P.woodDeep);
      rect(c, x + 2, 2, 26, 21, color);
      ellipse(c, x + 20, 8, 4, 4, accent);
      rect(c, x + 2, 13, 26, 10, P.navy);
      drawWaveMark(c, x + 4, 12, P.sky);
      rect(c, x + 3, 21, 24, 1, P.foamShade);
    },
  },
  pendant: {
    w: 28, h: 30, foot: { w: 1, h: 1 }, wall: true, outline: false,
    frames: 3, animation: { frameMs: 520, pingPong: true },
    draw: (c, x, frame) => {
      c.globalAlpha = [0.18, 0.14, 0.17][frame];
      ellipse(c, x + 14, 21, 13, 8, P.glowWarm);
      c.globalAlpha = 1;
      rect(c, x + 13, 0, 2, 13, P.woodDeep);
      ellipse(c, x + 14, 20, 4, 4, P.glowWarm);
      ellipse(c, x + 14, 20, 3, 3, P.glow);
      rect(c, x + 11, 12, 6, 3, P.woodDark);
      rect(c, x + 8, 15, 12, 3, P.woodDeep);
      rect(c, x + 7, 18, 14, 1, P.sunDark);
    },
  },
  vines: {
    w: 23, h: 25, wall: true, outline: false,
    draw: (c, x) => {
      const random = rng(42);
      for (const [left, height] of [[4, 17], [11, 24], [17, 12]]) {
        for (let y = 1; y < height; y += 3) {
          const dx = Math.floor(random() * 5) - 2;
          rect(c, x + left, y - 1, 1, 4, P.leafDeep);
          ellipse(c, x + left + dx, y, 2, 1, P.leaf);
          px(c, x + left + dx, y - 1, P.leafLight);
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
  waveMat: waveRug(32, 16, 1),
  waveRug: waveRug(60, 30, 2),
  roundRug: {
    w: 29, h: 18, flat: true,
    draw: (c, x) => {
      ellipse(c, x + 14, 9, 14, 8, P.sandDark);
      ellipse(c, x + 14, 9, 12, 7, P.sandLight);
      ellipse(c, x + 14, 9, 10, 5, P.sandDark);
      ellipse(c, x + 14, 9, 7, 4, P.sandLight);
      ellipse(c, x + 14, 9, 5, 2, P.sandDark);
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
    },
  },
  coffeeTable: displayTable((c, x) => {
    box(c, x + 5, 4, 13, 10, P.deepBlue, P.navyDark);
    rect(c, x + 7, 7, 7, 1, P.cream);
    box(c, x + 25, 6, 7, 7, P.cream, P.woodDark);
    px(c, x + 32, 9, P.cream);
  }),
  boardRack: {
    w: 47, h: 52, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      box(c, x + 1, 21, 45, 23, P.woodLight, P.woodDeep);
      box(c, x + 2, 17, 4, 28, P.wood, P.woodDeep);
      box(c, x + 41, 17, 4, 28, P.wood, P.woodDeep);
      drawBoard(c, x + 6, 6, 10, 35, P.cream, P.signTeal);
      drawBoard(c, x + 30, 5, 10, 36, color === P.coral ? P.sun : P.signTeal, P.sandLight);
      drawBoard(c, x + 17, 0, 13, 42, color, accent);
      rect(c, x + 3, 43, 41, 2, P.woodDark);
      rect(c, x + 24, 40, 2, 12, P.woodDeep);
      box(c, x + 17, 33, 15, 12, P.cream, P.woodDeep);
      rect(c, x + 19, 36, 3, 5, P.signTeal);
      rect(c, x + 24, 36, 6, 1, P.woodDark);
      rect(c, x + 24, 39, 5, 1, P.woodDark);
    },
  },
  finTable: displayTable((c, x, { color, accent }) => {
    for (const [index, fill] of [color, accent, P.navy, P.cream].entries()) {
      for (let y = 0; y < 9; y++) {
        rect(c, x + 5 + index * 9 + (8 - y) / 3, 4 + y, Math.floor(y / 2) + 1, 1, fill);
      }
    }
  }),
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
      box(c, x + 4, 24, 13, 7, P.sandDark, P.woodDeep);
      box(c, x + 19, 24, 13, 7, P.sandDark, P.woodDeep);
    },
  },
  wallMirror: mirror(false),
  standingMirror: mirror(true),
  hoodieRack: rack((c, x, y, { color, accent }) => {
    ellipse(c, x + 5, y + 1, 4, 3, shade(color, -0.15));
    drawShirt(c, x, y + 4, color, accent, true);
    rect(c, x + 3, y + 10, 4, 3, shade(color, 0.12));
  }, 3),
  swimRack: rack((c, x, y, { color, accent }) => {
    rect(c, x + 2, y, 2, 9, color);
    rect(c, x + 6, y, 2, 9, color);
    rect(c, x + 3, y + 4, 4, 10, color);
    rect(c, x + 2, y + 11, 6, 1, accent);
    rect(c, x + 4, y + 14, 2, 2, color);
  }, 2),
  shortsMannequin: {
    w: 16, h: 37, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      ellipse(c, x + 8, 6, 3, 4, P.stoneLight);
      drawCap(c, x + 3, 0, P.cream);
      drawShirt(c, x + 3, 10, P.cream, P.navy);
      box(c, x + 4, 19, 8, 9, color, shade(color, -0.3));
      rect(c, x + 7, 24, 2, 4, shade(color, -0.3));
      px(c, x + 5, 22, accent);
      px(c, x + 10, 24, accent);
      rect(c, x + 7, 28, 2, 6, P.woodDark);
      ellipse(c, x + 8, 34, 5, 2, P.woodDeep);
    },
  },
  teeTable: displayTable((c, x, { color, accent }) => {
    for (const [index, fill] of [color, P.signTeal, P.deepBlue].entries()) {
      const left = x + 5 + index * 12;
      box(c, left, 5, 10, 8, fill, shade(fill, -0.25));
      rect(c, left + 3, 7, 4, 2, accent);
    }
  }),
  capTable: displayTable((c, x) => {
    drawCap(c, x + 4, 4, P.cream);
    drawCap(c, x + 17, 4, P.navy);
    drawCap(c, x + 30, 4, P.coral);
    rect(c, x + 9, 13, 13, 3, P.sun);
    rect(c, x + 25, 13, 13, 3, P.deepBlue);
  }),
  leashHooks: {
    w: 30, h: 27, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      box(c, x, 0, 30, 25, P.sandDark, P.woodDeep);
      for (const left of [5, 15, 25]) {
        ellipse(c, x + left, 14, 4, 8, color);
        ellipse(c, x + left, 14, 2, 6, P.sandDark);
        ellipse(c, x + left, 6, 3, 2, accent);
      }
    },
  },
  padTable: displayTable((c, x, { color, accent }) => {
    for (const left of [5, 17, 29]) {
      box(c, x + left, 4, 9, 12, color, P.woodDeep);
      for (let y = 6; y < 15; y += 2) px(c, x + left + 4, y, accent);
    }
  }),
  bagRack: {
    w: 32, h: 44, solid: true, outline: false,
    draw: (c, x, _f, { color, accent }) => {
      box(c, x + 1, 22, 30, 21, P.woodLight, P.woodDeep);
      drawBoard(c, x + 4, 0, 12, 41, shade(color, -0.2), accent);
      drawBoard(c, x + 16, 4, 13, 39, color, accent);
      rect(c, x + 27, 17, 3, 7, accent);
      rect(c, x + 1, 41, 30, 3, P.woodDark);
    },
  },
} satisfies Record<string, PropSpec>;
