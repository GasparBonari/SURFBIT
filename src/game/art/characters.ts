import type { PlayerAppearance } from "@/state/playerAppearance";
import { type Ctx, ellipse, makeCanvas, px, rect, shade } from "./canvas";
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
  barefoot?: boolean;
  /** Full-length wetsuit in the `shirt` color (legs and sleeves covered). */
  wetsuit?: boolean;
  /** Surfboard carried under the arm, in this color. */
  board?: string;
  /** Work apron over the shirt, in this color. */
  apron?: string;
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
    const width = side ? 3 : 2;
    rect(ctx, x, 24, 2, shoeTop - 24, look.wetsuit ? look.shirt : look.skin);
    if (look.wetsuit) px(ctx, x + 1, 24, shade(look.shirt, -0.16));
    if (look.barefoot) {
      rect(ctx, x, shoeTop, 2, 1, look.skin);
      rect(ctx, x, sole, width, 1, shade(look.skin, near ? 0.08 : -0.17));
      return;
    }
    rect(ctx, x, shoeTop, 2, 1, near ? look.shoes ?? P.navy : P.ink);
    rect(ctx, x, sole, width, 1, near ? P.cream : P.wallStoneLight);
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
  const shorts = look.wetsuit ? look.shirt : look.shorts;
  rect(ctx, 4, 21, 8, 4, shorts);
  rect(ctx, 5, 24, 6, 1, shade(shorts, -0.25));
  if (!side) px(ctx, 8, 23, shade(shorts, -0.25));
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
  // Top-left light: shade the far edge and hem, light the near shoulder.
  const shirtShade = shade(look.shirt, -0.16);
  rect(ctx, dir === "right" ? 4 : 11, y + 2, 1, 20 - y - 2, shirtShade);
  rect(ctx, 5, 21, 6, 1, shirtShade);
  px(ctx, 5, y, shade(look.shirt, 0.3));
  if (dir === "down") rect(ctx, 7, y, 2, 1, shirtShade); // collar

  if (dir === "down" && look.shirtMark) drawWaveMark(ctx, 6, y + 3, look.shirtMark);
  if (look.apron) drawApron(ctx, look.apron, dir, y);
  if (look.backpack) drawBackpack(ctx, look.backpack, dir, y + 1);

  // Wetsuits have long sleeves; only the hands show.
  const sleeve = look.wetsuit ? 5 : 3;
  const swing = pose === "stepA" ? -1 : pose === "stepB" ? 1 : 0;
  if (dir === "right") {
    const x = look.board ? 9 : 9 + swing;
    rect(ctx, x, y + 2, 3, sleeve, look.shirt);
    rect(ctx, x + 1, y + 2 + sleeve, 2, 6 - sleeve, look.skin);
  } else {
    rect(ctx, 3, y + 2, 2, sleeve, look.shirt);
    rect(ctx, 2, y + 4, 2, 3 + swing, look.skin);
    if (look.wetsuit) rect(ctx, 2, y + 4, 2, 2 + swing, look.shirt);
    rect(ctx, 11, y + 2, 2, sleeve, look.shirt);
    rect(ctx, 12, y + 4, 2, 3 - swing, look.skin);
    if (look.wetsuit) rect(ctx, 12, y + 4, 2, 2 - swing, look.shirt);
  }
}

function drawApron(ctx: Ctx, color: string, dir: DrawDir, y: number) {
  const dark = shade(color, -0.25);
  if (dir === "up") {
    rect(ctx, 5, y, 1, 7, color);
    rect(ctx, 10, y, 1, 7, color);
    rect(ctx, 4, y + 6, 8, 1, color);
    return;
  }
  if (dir === "right") {
    rect(ctx, 9, y + 2, 2, 22 - y, color);
    rect(ctx, 10, y + 2, 1, 22 - y, dark);
    rect(ctx, 5, y + 6, 5, 1, color);
    return;
  }
  rect(ctx, 5, y, 1, 2, color);
  rect(ctx, 10, y, 1, 2, color);
  rect(ctx, 5, y + 2, 6, 23 - y, color);
  rect(ctx, 10, y + 2, 1, 23 - y, dark);
  rect(ctx, 6, y + 6, 4, 2, dark);
  px(ctx, 6, y + 6, shade(color, 0.2));
}

/** Board under the arm: upright at the side when seen front or back, level across the body in profile. */
function drawCarriedBoard(ctx: Ctx, look: Look, dir: DrawDir, bob: number) {
  const color = look.board;
  if (!color) return;
  const light = shade(color, 0.3);
  if (dir === "right") {
    const y = 18 + bob;
    rect(ctx, 1, y, 14, 3, color);
    rect(ctx, 0, y + 1, 1, 1, color);
    rect(ctx, 15, y + 1, 1, 1, color);
    rect(ctx, 1, y, 13, 1, light);
    rect(ctx, 3, y + 2, 11, 1, shade(color, -0.12));
    rect(ctx, 10, y - 1, 2, 3, look.skin); // hand over the rail
    return;
  }
  const x = dir === "down" ? 12 : 1;
  const top = 9 + bob;
  rect(ctx, x + 1, top, 1, 1, color);
  rect(ctx, x, top + 1, 3, 20, color);
  rect(ctx, x + 1, top + 21, 1, 1, color);
  rect(ctx, x, top + 1, 1, 20, light);
  rect(ctx, x + 1, top + 3, 1, 17, shade(color, -0.12)); // stringer
  if (dir === "down") rect(ctx, 12, 19 + bob, 2, 2, look.skin);
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
  const hairShade = shade(hair, -0.22);
  const hairLight = shade(hair, 0.28);
  rect(ctx, 3, y + 4 + sideLength - 2, 2, 2, hairShade);
  if (dir !== "right") rect(ctx, 11, y + 4 + sideLength - 2, 2, 2, hairShade);
  if (dir === "up") {
    rect(ctx, 5, y + 1, 4, 1, hairLight);
    rect(ctx, 4, y + 3, 1, 3, hairLight);
    rect(ctx, 8, y + 4, 1, 4, hairShade); // parting of the strands
  } else if (!look.hat) {
    rect(ctx, 5, y + 1, 3, 1, hairLight);
    px(ctx, 4, y + 2, hairLight);
  }
  if (hairStyle === "bun") {
    if (!look.hat) {
      rect(ctx, 6, y - 2, 4, 3, hair);
    } else if (dir !== "down") {
      // A hat leaves room for a low bun at the nape.
      const bunX = dir === "right" ? 3 : 8;
      const bunY = y + 7;
      ellipse(ctx, bunX, bunY, 2, 2, hair);
      px(ctx, bunX - 1, bunY - 1, hairLight);
      px(ctx, bunX + 1, bunY + 1, hairShade);
    }
  }
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
  rect(ctx, 5, y + 1, 2, 1, shade(hat.color, 0.3));
  rect(ctx, 11, y + 2, 1, 3, shade(hat.color, -0.2));

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
  const skinShade = shade(look.skin, -0.14);
  if (dir !== "right") rect(ctx, 11, y + 4, 1, 6, skinShade);
  rect(ctx, 5, y + 10, 6, 1, skinShade);
  // Round the jaw so the head isn't a box.
  ctx.clearRect(4, y + 9, 1, 1);
  if (dir !== "right") ctx.clearRect(11, y + 9, 1, 1);
  if (dir === "right") {
    rect(ctx, 10, y + 3, 3, 6, look.skin);
    px(ctx, 13, y + 6, look.skin);
    rect(ctx, 11, y + 4, 1, 2, P.outline);
    px(ctx, 11, y + 4, P.cream);
    px(ctx, 10, y + 7, P.pink);
    if (look.beard) rect(ctx, 8, y + 8, 4, 2, look.hair);
  } else if (dir === "down") {
    rect(ctx, 6, y + 5, 1, 2, P.outline);
    rect(ctx, 9, y + 5, 1, 2, P.outline);
    // A glint keeps the eyes readable on every skin tone.
    px(ctx, 6, y + 5, P.cream);
    px(ctx, 9, y + 5, P.cream);
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
  if (facing === "up") drawCarriedBoard(ctx, look, facing, bob);
  drawTorso(ctx, look, facing, pose, bob);
  if (facing !== "up") drawCarriedBoard(ctx, look, facing, bob);
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

const playerSkin = { light: P.skin1, tan: P.skin2, brown: P.skin3, deep: P.skin4 };
const playerShirts = { white: P.white, coral: P.coral, teal: P.teal, navy: P.navy };
const playerHats: Record<PlayerAppearance["headwear"], Look["hat"]> = {
  trucker: PLAYER_LOOK.hat,
  bucket: { style: "bucket", color: P.cream, brim: P.sandDark, mark: P.navy },
  none: undefined,
};

export function playerLook({ skin, shirt, headwear }: PlayerAppearance): Look {
  return { ...PLAYER_LOOK, skin: playerSkin[skin], shirt: playerShirts[shirt], hat: playerHats[headwear] };
}

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
  hair: P.ink,
  hairStyle: "ponytail",
  accent: P.ink,
  shirt: P.sun,
  shorts: P.navyDark,
};

export const GOODS_SHOPKEEPER_LOOK: Look = {
  skin: P.skin3,
  hair: P.ink,
  hairStyle: "bun",
  shirt: P.navy,
  shorts: P.cream,
  hat: { style: "bucket", color: P.cream, brim: P.parchment, mark: P.navy },
  shirtMark: P.cream,
};

export const WORKSHOP_SHOPKEEPER_LOOK: Look = {
  skin: P.skin2,
  hair: P.ink,
  hairStyle: "short",
  beard: true,
  shirt: P.bagSilver,
  shorts: P.navy,
  hat: { style: "backwardCap", color: P.deepBlue, brim: P.navyDark },
  apron: P.woodDark,
};

export const BEACH_CLUB_HOST_LOOK: Look = {
  skin: P.skin4,
  hair: P.ink,
  hairStyle: "curly",
  accent: P.sun,
  shirt: P.hibiscus,
  shorts: P.cream,
};

export const BEACH_CLUB_COACH_LOOK: Look = {
  skin: P.skin3,
  hair: P.woodDeep,
  hairStyle: "short",
  shirt: P.teal,
  shorts: P.tealDark,
  wetsuit: true,
  barefoot: true,
};

export const SURFER_LOOK: Look = {
  skin: P.skin2,
  hair: P.wood,
  hairStyle: "short",
  shirt: P.navy,
  shorts: P.navy,
  wetsuit: true,
  board: P.cream,
  shoes: P.skin2,
};
