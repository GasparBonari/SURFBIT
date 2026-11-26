import type { BuildingStyle } from "../maps/types";
import { box, ellipse, makeCanvas, px, rect, rng, shade, type Ctx } from "./canvas";
import { drawText, textWidth } from "./font";
import { P } from "./palette";
import { drawBoard, drawShirt, drawWaveMark } from "./motifs";
import { PROPS } from "./props";

const ROOFS = {
  thatch: { base: P.thatch, light: P.thatchLight, dark: P.thatchDark, edge: P.thatchDeep },
  terracotta: { base: P.terracotta, light: P.terracottaLight, dark: P.terracottaDark, edge: P.woodDeep },
  indigo: { base: P.roofIndigo, light: P.roofSlate, dark: P.roofIndigoDark, edge: P.roofIndigoDeep },
  slate: { base: P.roofSlate, light: P.foamShade, dark: P.roofSlateDark, edge: P.roofIndigoDeep },
};

function drawRoof(ctx: Ctx, w: number, h: number, style: BuildingStyle) {
  const { base, light, dark, edge } = ROOFS[style.roof];
  const thatch = style.roof === "thatch";
  const hip = style.roof === "slate" || style.front === "cafe";
  const ridge = w / 2;
  const random = rng(w * h);
  const course = thatch ? 8 : 7;
  const tile = style.roof === "slate" ? 16 : 9;
  for (let y = 0; y < h; y++) {
    const slope = 1 - y / (h - 1);
    const pitch = thatch ? (style.front === "gear" ? 2.4 : 1.55) : 1;
    const inset = Math.round((ridge - (hip ? 25 : 4)) * slope ** pitch);
    const width = w - inset * 2;
    const eave = h - y <= 3;
    rect(ctx, inset, y, width, 1, eave ? edge : base);
    if (eave) continue;
    rect(ctx, inset, y, 2, 1, edge);
    rect(ctx, w - inset - 3, y, 3, 1, edge);
    rect(ctx, inset + 2, y, Math.min(3, width - 5), 1, light);
    const rightSlope = ridge + Math.floor(y / 3);
    if (rightSlope < w - inset - 3) {
      rect(ctx, rightSlope, y, w - inset - 3 - rightSlope, 1, dark);
    }
    if (thatch) {
      for (let x = inset + 6; x < w - inset - 4; x += 3) {
        const sweep = x < ridge ? y : -y;
        const straw = (x + Math.floor(sweep / 2) + 24) % 8;
        const roll = random();
        if (roll < 0.72) rect(ctx, x, y, straw < 3 ? 2 : 1, 1, straw < 5 ? light : dark);
        if ((y + Math.floor(x / 7)) % course === 6 && straw < 5) px(ctx, x + 1, y, edge);
      }
    } else {
      const stagger = Math.floor(y / course) % 2 * Math.floor(tile / 2);
      for (let x = inset + 5; x < w - inset - 3; x++) {
        if (y % course === 0 || (x + stagger) % tile === 0) px(ctx, x, y, dark);
        if (y % course === 1 || (x + stagger) % tile === 1) px(ctx, x, y, x < rightSlope ? light : base);
      }
    }
  }
  if (hip) rect(ctx, ridge - 24, 1, 48, 2, light);
  else rect(ctx, ridge - 1, 2, 2, 7, light);
}

function drawGable(ctx: Ctx, center: number, eave: number, halfWidth: number, rise: number) {
  for (let row = 0; row <= rise; row++) {
    const half = Math.round(halfWidth * row / rise);
    const y = eave - rise + row;
    rect(ctx, center - half, y, half * 2 + 1, 1, P.woodDeep);
    if (half <= 3) continue;
    rect(ctx, center - half + 2, y, half * 2 - 4, 1, y % 5 === 0 ? P.woodDark : P.wood);
    rect(ctx, center - half + 1, y, 2, 1, P.woodLight);
    rect(ctx, center + half - 2, y, 2, 1, P.woodDark);
  }
}

function drawWall(ctx: Ctx, w: number, h: number, top: number, style: BuildingStyle) {
  const paint = style.wall;
  const creamTrim = style.front === "apparel" || paint === P.cream;
  rect(ctx, 6, top, w - 12, h - top, P.woodDeep);
  rect(ctx, 10, top, w - 20, h - top - 5, paint);
  for (let y = top + 4; y < h - 6; y += 6) {
    rect(ctx, 10, y, w - 20, 1, shade(paint, -0.22));
    rect(ctx, 10, y + 1, w - 20, 1, shade(paint, 0.17));
    const joint = 18 + ((y * 37) % (w - 36));
    rect(ctx, joint, y + 2, 1, 4, shade(paint, -0.18));
  }
  const trim = creamTrim ? P.sandLight : P.woodLight;
  rect(ctx, 7, top, 3, h - top - 5, trim);
  rect(ctx, w - 10, top, 3, h - top - 5, trim);
  rect(ctx, 5, h - 5, w - 10, 2, P.woodDark);
  rect(ctx, 5, h - 3, w - 10, 2, P.woodDeep);
}

function drawSign(ctx: Ctx, w: number, eave: number, label: string, front: BuildingStyle["front"]) {
  const scale = front === "flagship" ? 3 : 2;
  const labelWidth = textWidth(label) * scale;
  const hasIcon = front === "apparel" || front === "shaping" || front === "cafe";
  const width = Math.max(56, labelWidth + (hasIcon ? 32 : 16));
  const x = Math.floor((w - width) / 2);
  const y = eave - (front === "flagship" ? 23 : 16);
  box(ctx, x - 2, y - 2, width + 4, 34, P.woodLight, P.woodDeep);
  box(ctx, x, y, width, 30, P.navy, P.navyDark);
  rect(ctx, x + 2, y + 1, width - 4, 1, P.deepBlue);
  drawWaveMark(ctx, w / 2 - 8, y - 1, P.cream);
  ctx.save();
  ctx.translate(Math.floor((w - labelWidth) / 2), y + 13);
  ctx.scale(scale, scale);
  drawText(ctx, label, 0, 0, P.cream);
  ctx.restore();

  if (front === "apparel") {
    drawShirt(ctx, x + 4, y + 13, P.coral, P.cream);
    drawShirt(ctx, x + width - 14, y + 13, P.sky, P.cream);
  } else if (front === "shaping") {
    for (let i = 0; i < 7; i++) {
      px(ctx, x + 5 + i, y + 14 + i, P.cream);
      px(ctx, x + 11 - i, y + 14 + i, P.sandDark);
    }
    rect(ctx, x + 4, y + 13, 3, 2, P.cream);
    rect(ctx, x + 10, y + 13, 3, 2, P.sandDark);
  } else if (front === "cafe") {
    box(ctx, x + 5, y + 13, 5, 4, P.navy, P.cream);
    rect(ctx, x + 4, y + 13, 4, 5, P.cream);
    rect(ctx, x + 3, y + 19, 8, 1, P.cream);
  }
}

function drawDoor(ctx: Ctx, center: number, bottom: number, boarded: boolean, open: boolean) {
  const x = center - 10;
  const y = bottom - 31;
  box(ctx, x, y, 20, 31, P.woodDark, P.woodDeep);
  rect(ctx, x + 1, y + 1, 2, 29, P.woodLight);
  rect(ctx, x - 2, bottom - 2, 24, 2, P.sandDark);
  if (open) {
    rect(ctx, x + 4, y + 1, 14, 28, P.navyDark);
    rect(ctx, x + 4, y + 24, 14, 5, P.wood);
    rect(ctx, x + 4, y + 25, 14, 1, P.woodLight);
    return;
  }
  box(ctx, x + 4, y + 3, 12, 13, P.deepBlue, P.woodDeep);
  rect(ctx, x + 5, y + 4, 3, 5, P.sky);
  rect(ctx, x + 9, y + 4, 1, 11, P.woodDeep);
  rect(ctx, x + 5, y + 9, 10, 1, P.woodDeep);
  box(ctx, x + 5, y + 18, 10, 9, P.wood, P.woodDeep);
  rect(ctx, x + 16, y + 18, 2, 2, P.sun);
  if (!boarded) return;

  for (let i = 0; i < 7; i++) {
    rect(ctx, x - 1 + i * 3, y + 18 - i, 4, 5, P.woodDeep);
    rect(ctx, x - 1 + i * 3, y + 18 - i, 4, 3, P.woodLight);
  }
  box(ctx, x - 1, y + 22, 22, 4, P.wood, P.woodDeep);
  for (const nail of [x + 1, x + 18]) px(ctx, nail, y + 23, P.woodDeep);
  box(ctx, x, y + 3, 20, 9, P.cream, P.woodDeep);
  drawText(ctx, "SOON", x + 2, y + 5, P.navyDark);
}

function drawAwning(ctx: Ctx, x: number, y: number, w: number, color: string) {
  for (let row = 0; row < 10; row++) {
    const overhang = Math.floor(row / 3);
    for (let column = -overhang; column < w + overhang; column++) {
      const stripe = Math.floor((column + 3) / 6) % 2 ? P.cream : color;
      px(ctx, x + column, y + row, row >= 7 ? shade(stripe, -0.24) : stripe);
    }
  }
  rect(ctx, x, y - 1, w, 1, P.woodDeep);
}

function drawDisplay(
  ctx: Ctx, x: number, y: number, w: number, front: BuildingStyle["front"] | "bottles",
) {
  if (w < 18) return;
  box(ctx, x, y, w, 31, P.woodDark, P.woodDeep);
  rect(ctx, x + 2, y + 2, w - 4, 24, P.navyDark);
  rect(ctx, x + 2, y + 2, w - 4, 2, P.woodDeep);
  const center = x + Math.floor(w / 2);

  switch (front) {
    case "surfboards":
      for (const [i, color] of [P.cream, P.flagBlue, P.sun].entries()) {
        drawBoard(ctx, center - 17 + i * 12, y + 4 + i, 8, 22 - i, color, P.coral);
      }
      break;
    case "flagship":
    case "apparel": {
      const scale = w >= 74 ? 2 : 1;
      const colors = w >= 40 ? [P.cream, P.flagBlue, P.teal] : [P.cream];
      const rowWidth = (colors.length * 12 - 2) * scale;
      rect(ctx, x + 3, y + 6, w - 6, 1, P.woodLight);
      for (const [i, color] of colors.entries()) {
        const shirtX = center - Math.floor(rowWidth / 2) + i * 12 * scale;
        px(ctx, shirtX + 5 * scale, y + 8, P.sandDark);
        ctx.save();
        ctx.translate(shirtX, y + 9);
        ctx.scale(scale, scale);
        drawShirt(ctx, 0, 0, color, i === 0 ? P.navy : P.cream);
        ctx.restore();
      }
      break;
    }
    case "gear":
      for (const [i, color] of [P.flagBlue, P.teal, P.ink].entries()) {
        const suitX = center - 17 + i * 12;
        px(ctx, suitX + 5, y + 5, P.cream);
        rect(ctx, suitX + 1, y + 6, 8, 1, P.stoneDark);
        drawShirt(ctx, suitX, y + 7, color, P.sun, true);
        rect(ctx, suitX + 2, y + 17, 2, 8, color);
        rect(ctx, suitX + 6, y + 17, 2, 8, color);
      }
      break;
    case "cafe":
      rect(ctx, x + 4, y + 15, w - 8, 2, P.wood);
      for (let i = x + 6; i < x + w - 7; i += 10) {
        box(ctx, i, y + 9, 5, 6, P.cream, P.wood);
        px(ctx, i + 5, y + 11, P.cream);
      }
      rect(ctx, x + 2, y + 23, w - 4, 4, P.wood);
      break;
    case "bottles":
      for (const shelf of [y + 14, y + 25]) {
        rect(ctx, x + 3, shelf, w - 6, 2, P.woodLight);
        for (let i = x + 5; i + 4 < x + w - 3; i += 7) {
          rect(ctx, i + 1, shelf - 7, 2, 2, P.cream);
          rect(ctx, i, shelf - 5, 4, 5, i % 2 ? P.flagBlue : P.sun);
          rect(ctx, i, shelf - 3, 3, 1, P.cream);
        }
      }
      break;
    default:
      rect(ctx, x + 3, y + 4, w - 6, 20, P.deepBlue);
      rect(ctx, x + 3, y + 4, w - 6, 4, P.sky);
      rect(ctx, center, y + 3, 2, 23, P.woodLight);
      rect(ctx, x + 3, y + 14, w - 6, 2, P.woodLight);
      break;
  }
  rect(ctx, x - 1, y + 28, w + 2, 2, P.woodLight);
}

function drawBoardRack(ctx: Ctx, x: number, bottom: number) {
  for (const [i, color] of [P.coral, P.sun, P.sky, P.cream].entries()) {
    const height = 30 + (i % 3) * 4;
    drawBoard(ctx, x + i * 8, bottom - height - 2, 7, height, color, P.navy);
  }
  rect(ctx, x - 1, bottom - 5, 34, 3, P.woodDark);
  rect(ctx, x - 1, bottom - 5, 34, 1, P.woodLight);
}

function drawVine(ctx: Ctx, x: number, y: number, bottom: number) {
  for (let dy = 0; y + dy < bottom - 6; dy += 4) {
    const leafX = x + Math.round(Math.sin(dy / 4) * 3);
    ellipse(ctx, leafX, y + dy, 4, 3, P.leafDeep);
    ellipse(ctx, leafX - 1, y + dy - 1, 3, 2, P.leaf);
    if (dy % 12 === 4) {
      ellipse(ctx, leafX + 2, y + dy, 2, 2, P.hibiscus);
      px(ctx, leafX + 2, y + dy - 1, P.pink);
      px(ctx, leafX + 2, y + dy, P.sun);
    }
  }
}

function drawWorkshop(ctx: Ctx, w: number, top: number, bottom: number) {
  box(ctx, 12, top, w - 24, bottom - top, P.woodDeep, P.woodDark);
  rect(ctx, 16, top + 4, w - 32, 2, P.wood);
  rect(ctx, 18, bottom - 9, w - 36, 8, P.woodDark);
  const workbench = Math.floor(w / 3);
  rect(ctx, workbench, top + 4, 1, 6, P.ironDark);
  box(ctx, workbench - 5, top + 10, 11, 6, P.glow, P.glowWarm);

  rect(ctx, workbench - 14, bottom - 19, 3, 16, P.woodLight);
  rect(ctx, workbench + 13, bottom - 19, 3, 16, P.woodLight);
  rect(ctx, workbench - 12, bottom - 8, 26, 2, P.wood);
  ellipse(ctx, workbench, bottom - 20, 23, 4, P.woodDark);
  ellipse(ctx, workbench, bottom - 21, 23, 3, P.cream);
  rect(ctx, workbench - 17, bottom - 21, 33, 1, P.sandDark);
  for (const x of [13, w - 17]) rect(ctx, x, top, 4, bottom - top, P.woodLight);
}

interface Entrance {
  x: number;
  boarded: boolean;
}

/** Dimensions and the entrance's horizontal offset are in pixels. */
export function buildBuilding(w: number, h: number, style: BuildingStyle, label: string, entrance?: Entrance) {
  const [canvas, ctx] = makeCanvas(w, h);
  const eave = Math.round(h * 0.45);
  const bottom = h - 3;
  const doorX = entrance?.x ?? Math.floor(w / 2);
  const front = style.front;
  drawWall(ctx, w, h, eave - 2, style);
  drawRoof(ctx, w, eave, style);
  if (front) drawGable(ctx, w / 2, eave, Math.floor(w * 0.35), Math.floor(eave * 0.7));

  const displayY = bottom - 32;
  const leftWidth = doorX - 32;
  const rightWidth = w - doorX - 32;
  if (front === "shaping") {
    drawWorkshop(ctx, w, eave + 13, bottom);
  } else {
    if (front === "surfboards") box(ctx, 12, displayY - 4, w - 24, 35, P.woodDark, P.woodDeep);
    drawDisplay(ctx, 16, displayY, leftWidth, front);
    drawDisplay(ctx, doorX + 16, displayY, rightWidth, front === "gear" ? "bottles" : front);
  }
  const boarded = entrance?.boarded ?? false;
  drawDoor(ctx, doorX, bottom, boarded, front === "surfboards" && !boarded);

  if (style.awnings) {
    if (leftWidth >= 18) drawAwning(ctx, 15, displayY - 4, leftWidth + 2, style.awnings.window);
    drawAwning(ctx, doorX - 13, displayY - 4, 26, style.awnings.door);
    if (front === "apparel" && rightWidth >= 18) {
      drawAwning(ctx, doorX + 15, displayY - 4, rightWidth + 2, style.awnings.door);
    }
  }
  if (label) drawSign(ctx, w, eave, label, front);

  if (front === "surfboards") {
    drawBoardRack(ctx, 5, bottom + 1);
    ctx.save();
    ctx.translate(w - 19, h - PROPS.plant.h);
    PROPS.plant.draw(ctx, 0);
    ctx.restore();
  } else if (front === "gear") {
    drawBoard(ctx, w - 18, bottom - 34, 10, 34, P.coral, P.cream);
  } else if (front === "flagship") {
    drawVine(ctx, 9, eave - 11, bottom);
    drawVine(ctx, w - 10, eave - 4, bottom);
    const signX = doorX - 29;
    box(ctx, signX, bottom - 15, 13, 14, P.navyDark, P.woodLight);
    rect(ctx, signX + 2, bottom - 11, 9, 1, P.cream);
    rect(ctx, signX + 3, bottom - 8, 7, 1, P.cream);
    for (const leg of [signX + 1, signX + 11]) rect(ctx, leg, bottom - 2, 1, 4, P.woodDeep);
  }
  return canvas;
}
