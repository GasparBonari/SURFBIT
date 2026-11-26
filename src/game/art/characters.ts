import { P } from "./palette";
import { type Ctx, ellipse, makeCanvas, px, rect } from "./canvas";

export const CHAR_W = 16;
export const CHAR_H = 24;
export const DIRS = ["down", "left", "right", "up"] as const;
export type Dir = (typeof DIRS)[number];

export interface Look {
  skin: string;
  hair: string;
  hairStyle: "short" | "long" | "bun" | "cap" | "bald";
  shirt: string;
  shorts: string;
  /** Optional second hair/cap color (cap brim, highlights). */
  accent?: string;
}

/** Adds a 1px outline around every opaque pixel in a region. */
export function autoOutline(ctx: Ctx, x0: number, y0: number, w: number, h: number, color: string) {
  const img = ctx.getImageData(x0, y0, w, h);
  const d = img.data;
  const solid = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 200;
  const marks: number[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (solid(x, y)) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) marks.push(x, y);
    }
  ctx.fillStyle = color;
  for (let i = 0; i < marks.length; i += 2) ctx.fillRect(x0 + marks[i], y0 + marks[i + 1], 1, 1);
}

function drawHairFront(ctx: Ctx, ox: number, oy: number, look: Look, dir: Dir) {
  const h = look.hair;
  switch (look.hairStyle) {
    case "bald":
      return;
    case "cap": {
      const cap = look.accent ?? P.coral;
      rect(ctx, ox + 4, oy + 2, 8, 3, cap);
      if (dir === "down") rect(ctx, ox + 3, oy + 5, 10, 1, cap);
      if (dir === "left") rect(ctx, ox + 2, oy + 4, 4, 2, cap);
      if (dir === "right") rect(ctx, ox + 10, oy + 4, 4, 2, cap);
      rect(ctx, ox + 4, oy + 5, 1, 2, h);
      rect(ctx, ox + 11, oy + 5, 1, 2, h);
      return;
    }
    default: {
      rect(ctx, ox + 4, oy + 2, 8, 3, h);
      if (dir === "down") {
        rect(ctx, ox + 4, oy + 5, 1, 2, h);
        rect(ctx, ox + 11, oy + 5, 1, 2, h);
        px(ctx, ox + 7, oy + 5, h);
      } else if (dir === "up") {
        rect(ctx, ox + 4, oy + 5, 8, 4, h);
      } else {
        const back = dir === "left" ? ox + 8 : ox + 4;
        rect(ctx, back, oy + 5, 4, 3, h);
      }
      if (look.hairStyle === "long") {
        if (dir === "up") rect(ctx, ox + 4, oy + 9, 8, 4, h);
        else if (dir === "down") {
          rect(ctx, ox + 3, oy + 5, 1, 7, h);
          rect(ctx, ox + 12, oy + 5, 1, 7, h);
        } else rect(ctx, dir === "left" ? ox + 9 : ox + 4, oy + 8, 3, 5, h);
      }
      if (look.hairStyle === "bun") {
        rect(ctx, ox + 6, oy + 0, 4, 2, h);
      }
      if (look.accent) px(ctx, ox + 6, oy + 3, look.accent);
    }
  }
}

/**
 * Draw one character frame at (ox, oy).
 * step: 0 = standing, 1 = left foot forward, 2 = right foot forward.
 */
function drawFrame(ctx: Ctx, ox: number, oy: number, look: Look, dir: Dir, step: 0 | 1 | 2) {
  const bob = step === 0 ? 0 : 1;
  const y = oy + bob;
  const side = dir === "left" || dir === "right";

  // legs
  if (!side) {
    const l = step === 1 ? -1 : 0;
    const r = step === 2 ? -1 : 0;
    rect(ctx, ox + 5, y + 17, 2, 4 + l, look.skin);
    rect(ctx, ox + 9, y + 17, 2, 4 + r, look.skin);
  } else {
    if (step === 0) rect(ctx, ox + 7, y + 17, 2, 4, look.skin);
    else {
      rect(ctx, ox + 5, y + 17, 2, 4, look.skin);
      rect(ctx, ox + 9, y + 17, 2, 3, look.skin);
    }
  }
  // shorts
  rect(ctx, ox + 4, y + 15, 8, 3, look.shorts);
  // torso
  rect(ctx, ox + 4, y + 10, 8, 6, look.shirt);
  // arms
  const swing = step === 1 ? 1 : step === 2 ? -1 : 0;
  if (!side) {
    rect(ctx, ox + 3, y + 11, 1, 3, look.shirt);
    px(ctx, ox + 3, y + 14 + Math.max(0, swing), look.skin);
    rect(ctx, ox + 12, y + 11, 1, 3, look.shirt);
    px(ctx, ox + 12, y + 14 + Math.max(0, -swing), look.skin);
  } else {
    const ax = ox + 7 + swing;
    rect(ctx, ax, y + 11, 2, 3, look.shirt);
    rect(ctx, ax, y + 14, 2, 1, look.skin);
  }
  // head
  rect(ctx, ox + 4, y + 2, 8, 8, look.skin);
  if (dir === "down") {
    px(ctx, ox + 6, y + 7, P.outline);
    px(ctx, ox + 9, y + 7, P.outline);
    px(ctx, ox + 5, y + 8, P.pink);
    px(ctx, ox + 10, y + 8, P.pink);
  } else if (dir === "left") {
    px(ctx, ox + 5, y + 7, P.outline);
  } else if (dir === "right") {
    px(ctx, ox + 10, y + 7, P.outline);
  }
  drawHairFront(ctx, ox, y, look, dir);
}

/**
 * Build a 3×4 spritesheet: columns = [stand, stepA, stepB], rows = DIRS.
 */
export function buildCharacterSheet(look: Look): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(CHAR_W * 3, CHAR_H * 4);
  DIRS.forEach((dir, row) => {
    for (let col = 0; col < 3; col++) {
      const ox = col * CHAR_W;
      const oy = row * CHAR_H;
      drawFrame(ctx, ox, oy, look, dir, col as 0 | 1 | 2);
      autoOutline(ctx, ox, oy, CHAR_W, CHAR_H - 1, P.outline);
    }
  });
  return canvas;
}

export function buildShadow(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(14, 5);
  ellipse(ctx, 7, 2, 6, 2, P.shadow);
  return canvas;
}

export const PLAYER_LOOK: Look = {
  skin: P.skin2,
  hair: "#5a3a26",
  hairStyle: "short",
  shirt: P.coral,
  shorts: P.deepBlue,
  accent: "#7a5236",
};
