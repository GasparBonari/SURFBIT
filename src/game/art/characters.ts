import { type Ctx, ellipse, makeCanvas, px, rect } from "./canvas";
import { P } from "./palette";

export const CHAR_W = 16;
export const CHAR_H = 32;
export const DIRS = ["down", "left", "right", "up"] as const;
export type Dir = (typeof DIRS)[number];

const POSES = ["stand", "stepA", "stepB"] as const;
type Pose = (typeof POSES)[number];
type DrawDir = Exclude<Dir, "left">;

interface Hat {
  style: "cap" | "backwardCap" | "straw" | "bucket";
  color: string;
  brim: string;
  panel?: string;
  mark?: string;
}

export interface Look {
  skin: string;
  hair: string;
  hairStyle: "short" | "long" | "bun" | "bald" | "curly" | "ponytail";
  shirt: string;
  shorts: string;
  accent?: string;
  hat?: Hat;
  backpack?: string;
  beard?: boolean;
  shirtMark?: string;
  shoes?: string;
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

function drawWaveMark(ctx: Ctx, x: number, y: number, color: string) {
  rect(ctx, x + 1, y, 2, 1, color);
  px(ctx, x, y + 1, color);
  px(ctx, x + 3, y + 1, color);
  px(ctx, x + 2, y + 2, color);
}

function drawLegs(ctx: Ctx, look: Look, side: boolean, pose: Pose) {
  function drawFoot(x: number, sole: number, near: boolean) {
    const shoeTop = sole - 1;
    const shoeColor = look.shoes ?? P.navy;
    rect(ctx, x, 24, 2, shoeTop - 24, look.skin);
    rect(ctx, x, shoeTop, 2, 1, near ? shoeColor : P.ink);
    rect(ctx, x, sole, side ? 3 : 2, 1, near ? P.cream : P.wallStoneLight);
  }

  // Keep the planted sole one pixel above the frame edge for its outline.
  if (side && pose === "stand") {
    drawFoot(7, 30, true);
  } else if (pose === "stepB") {
    drawFoot(5, 28, false);
    drawFoot(9, 30, true);
  } else if (pose === "stepA") {
    drawFoot(9, 28, false);
    drawFoot(side ? 4 : 5, 30, true);
  } else {
    drawFoot(5, 30, true);
    drawFoot(9, 30, true);
  }
  rect(ctx, 4, 21, 8, 4, look.shorts);
  rect(ctx, 5, 24, 6, 1, look.shorts);
}

function drawBackpack(ctx: Ctx, color: string, dir: DrawDir, y: number) {
  if (dir === "down") {
    rect(ctx, 5, y + 1, 1, 5, P.woodDark);
    rect(ctx, 10, y + 1, 1, 5, P.woodDark);
    return;
  }
  const x = dir === "up" ? 4 : 2;
  const width = dir === "up" ? 8 : 5;

  rect(ctx, x + 1, y, width - 2, 1, P.woodDark);
  rect(ctx, x, y + 1, width, 6, color);
  rect(ctx, x + 1, y + 2, width - 2, 1, P.woodLight);
  rect(ctx, x + 1, y + 5, width - 2, 1, P.woodDark);
  rect(ctx, x + 1, y + 7, width - 2, 1, P.woodDark);
  if (dir === "right") rect(ctx, 7, y, 1, 5, P.woodDark);
}

function drawTorso(ctx: Ctx, look: Look, dir: DrawDir, pose: Pose, bob: number) {
  const y = 14 + bob;
  rect(ctx, 5, y, 6, 2, look.shirt);
  rect(ctx, 4, y + 2, 8, 20 - y, look.shirt);
  rect(ctx, 5, 21, 6, 1, look.shirt);

  if (dir === "down" && look.shirtMark) drawWaveMark(ctx, 6, y + 3, look.shirtMark);
  if (look.backpack) drawBackpack(ctx, look.backpack, dir, y + 1);

  const swing = pose === "stepA" ? -1 : pose === "stepB" ? 1 : 0;
  if (dir === "right") {
    const x = 9 + swing;
    rect(ctx, x, y + 2, 3, 3, look.shirt);
    rect(ctx, x + 1, y + 5, 2, 3, look.skin);
  } else {
    rect(ctx, 3, y + 2, 2, 3, look.shirt);
    rect(ctx, 2, y + 4, 2, 3 + swing, look.skin);
    rect(ctx, 11, y + 2, 2, 3, look.shirt);
    rect(ctx, 12, y + 4, 2, 3 - swing, look.skin);
  }
}

function drawHair(ctx: Ctx, look: Look, dir: DrawDir, y: number) {
  if (look.hairStyle === "bald") return;

  const { hair, hairStyle, accent } = look;
  rect(ctx, 5, y, 6, 1, hair);
  rect(ctx, 3, y + 1, 10, 3, hair);
  const sideLength = hairStyle === "long" ? 8 : 4;
  rect(ctx, 3, y + 4, 2, sideLength, hair);

  if (dir === "up") {
    rect(ctx, 4, y + 4, 8, hairStyle === "long" ? 8 : 5, hair);
    rect(ctx, 11, y + 4, 2, sideLength, hair);
  } else if (dir === "down") {
    rect(ctx, 11, y + 4, 2, sideLength, hair);
    if (!look.hat) rect(ctx, 5, y + 4, 3, 1, hair);
  } else {
    rect(ctx, 5, y + 4, 2, hairStyle === "long" ? 7 : 4, hair);
    px(ctx, 6, y + 6, look.skin);
  }

  if (hairStyle === "curly") {
    rect(ctx, 2, y + 5, 2, 2, hair);
    rect(ctx, 3, y + 7, 2, 3, hair);
    px(ctx, 2, y + 9, hair);
    if (dir !== "right") {
      rect(ctx, 12, y + 5, 2, 2, hair);
      rect(ctx, 11, y + 7, 2, 3, hair);
      px(ctx, 13, y + 9, hair);
    }
  }
  if (hairStyle === "bun") rect(ctx, 6, y - 2, 4, 3, hair);
  if (accent) {
    rect(ctx, 5, y + 1, 3, 1, accent);
    if (dir === "up" && hairStyle === "ponytail") rect(ctx, 10, y + 6, 1, 4, accent);
    if (hairStyle === "curly") px(ctx, 3, y + 6, accent);
  }
}

function drawCap(ctx: Ctx, hat: Hat, dir: DrawDir, y: number) {
  const backward = hat.style === "backwardCap";
  rect(ctx, 5, y, 6, 1, hat.color);
  rect(ctx, 4, y + 1, 8, 2, hat.color);
  rect(ctx, 3, y + 3, 10, 2, hat.color);

  if (dir === "right") {
    const panelX = backward ? 4 : 8;
    rect(ctx, panelX, y + 1, 4, 3, hat.panel ?? hat.color);
    rect(ctx, backward ? 1 : 9, y + 4, 6, 1, hat.brim);
    rect(ctx, backward ? 2 : 10, y + 5, 4, 1, hat.brim);
  } else if (backward === (dir === "up")) {
    rect(ctx, 5, y + 1, 6, 4, hat.panel ?? hat.color);
    rect(ctx, 3, y + 5, 10, 1, hat.brim);
    if (hat.mark) drawWaveMark(ctx, 6, y + 2, hat.mark);
  } else {
    rect(ctx, 6, y + 4, 4, 1, P.outline);
    rect(ctx, 6, y + 5, 4, 1, hat.brim);
  }
}

function drawHat(ctx: Ctx, hat: Hat, dir: DrawDir, y: number) {
  if (hat.style === "cap" || hat.style === "backwardCap") {
    drawCap(ctx, hat, dir, y);
    return;
  }

  const straw = hat.style === "straw";
  rect(ctx, 5, y, 6, 1, hat.color);
  rect(ctx, 4, y + 1, 8, 3, hat.color);
  rect(ctx, 3, y + 4, 10, 1, hat.brim);
  rect(ctx, 2, y + 5, 12, 1, straw ? hat.color : hat.brim);
  if (straw) {
    rect(ctx, 1, y + 4, 14, 1, hat.color);
    rect(ctx, 4, y + 3, 8, 1, hat.brim);
  } else if (hat.mark && dir === "down") {
    drawWaveMark(ctx, 6, y + 1, hat.mark);
  }
}

function drawHead(ctx: Ctx, look: Look, dir: DrawDir, bob: number) {
  const y = 4 + bob;
  if (look.hairStyle === "ponytail" && dir !== "down") {
    const x = dir === "up" ? 9 : 2;
    rect(ctx, x + 1, y + 5, 3, 2, P.woodDark);
    rect(ctx, x, y + 7, 4, 5, look.hair);
    rect(ctx, x, y + 12, 3, 2, look.hair);
    if (look.accent) rect(ctx, x + 1, y + 8, 1, 3, look.accent);
  }

  rect(ctx, 4, y, 8, 10, look.skin);
  rect(ctx, 5, y + 10, 6, 1, look.skin);
  if (dir === "right") {
    rect(ctx, 10, y + 3, 3, 6, look.skin);
    px(ctx, 13, y + 6, look.skin);
    rect(ctx, 11, y + 4, 1, 2, P.outline);
    px(ctx, 10, y + 7, P.pink);
    if (look.beard) rect(ctx, 8, y + 8, 4, 2, look.hair);
  } else if (dir === "down") {
    rect(ctx, 6, y + 5, 1, 2, P.outline);
    rect(ctx, 9, y + 5, 1, 2, P.outline);
    px(ctx, 5, y + 7, P.pink);
    px(ctx, 10, y + 7, P.pink);
    if (look.beard) {
      rect(ctx, 4, y + 8, 8, 2, look.hair);
      rect(ctx, 5, y + 10, 6, 1, look.hair);
    }
    rect(ctx, 7, y + 9, 2, 1, look.beard ? look.skin : P.woodDark);
  }
  drawHair(ctx, look, dir, y);
  if (look.hat) drawHat(ctx, look.hat, dir, y - 2);
}

function drawFrame(ctx: Ctx, ox: number, oy: number, look: Look, dir: Dir, pose: Pose) {
  const facing = dir === "left" ? "right" : dir;
  const bob = pose === "stand" ? 0 : 1;

  ctx.save();
  ctx.translate(ox, oy);
  if (dir === "left") {
    ctx.translate(CHAR_W, 0);
    ctx.scale(-1, 1);
  }

  drawLegs(ctx, look, facing === "right", pose);
  drawTorso(ctx, look, facing, pose, bob);
  drawHead(ctx, look, facing, bob);
  ctx.restore();
}

/** Columns are stand, stepA and stepB. Rows follow DIRS. */
export function buildCharacterSheet(look: Look): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(CHAR_W * POSES.length, CHAR_H * DIRS.length);
  DIRS.forEach((dir, row) => {
    POSES.forEach((pose, col) => {
      const ox = col * CHAR_W;
      const oy = row * CHAR_H;
      drawFrame(ctx, ox, oy, look, dir, pose);
      autoOutline(ctx, ox, oy, CHAR_W, CHAR_H, P.outline);
    });
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
  hair: P.woodDeep,
  hairStyle: "short",
  shirt: P.white,
  shorts: P.deepBlue,
  hat: { style: "cap", color: P.flagBlue, brim: P.navyDark, panel: P.white },
  backpack: P.wood,
  shoes: P.coralDark,
};

export const BOARDS_SHOPKEEPER_LOOK: Look = {
  skin: P.skin3,
  hair: P.woodDeep,
  hairStyle: "short",
  beard: true,
  shirt: P.white,
  shorts: P.signTealDark,
  hat: { style: "cap", color: P.cream, brim: P.signTeal, mark: P.signTeal },
  shirtMark: P.signTeal,
};

export const WEAR_SHOPKEEPER_LOOK: Look = {
  skin: P.skin2,
  hair: P.woodDark,
  hairStyle: "curly",
  accent: P.wood,
  shirt: P.cream,
  shorts: P.navy,
  hat: { style: "cap", color: P.white, brim: P.deepBlue, mark: P.deepBlue },
  shirtMark: P.teal,
};

export const GEAR_SHOPKEEPER_LOOK: Look = {
  skin: P.skin4,
  hair: P.outline,
  hairStyle: "ponytail",
  accent: P.ink,
  shirt: P.sun,
  shorts: P.navyDark,
};
