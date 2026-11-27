import type { BuildingStyle } from "../maps/types";
import { drawRoof } from "./buildingRoofs";
import { box, ellipse, makeCanvas, px, rect, shade, type Ctx } from "./canvas";
import { drawText, textWidth } from "./font";
import { P } from "./palette";
import { drawBoard, drawShirt, drawWaveMark } from "./motifs";
import { PROPS } from "./props";

function drawGable(ctx: Ctx, w: number, eave: number, roof: BuildingStyle["roof"]) {
  const center = Math.floor(w / 2);
  const halfWidth = Math.floor(w * 0.43);
  const rise = Math.round(eave * 0.85);
  const bottom = eave + 12;
  const trim = roof === "thatch" ? P.thatchDark : P.woodLight;
  const shadow = roof === "thatch" ? P.thatchDeep : P.woodDark;
  for (let row = 0; row <= rise; row++) {
    const half = Math.round(halfWidth * row / rise);
    const y = bottom - rise + row;
    rect(ctx, center - half, y, half * 2 + 1, 1, P.woodDeep);
    if (half < 5) continue;
    rect(ctx, center - half + 4, y, half * 2 - 7, 1, row % 6 === 0 ? P.woodDark : P.wood);
    rect(ctx, center - half + 1, y, 3, 1, trim);
    rect(ctx, center + half - 3, y, 3, 1, shadow);
  }
  rect(ctx, center - halfWidth, bottom + 1, 2 * halfWidth + 1, 2, P.woodDeep);
}

function drawWall(ctx: Ctx, w: number, h: number, top: number, style: BuildingStyle) {
  const paint = style.wall;
  const creamTrim = style.front === "apparel" || paint === P.cream;
  rect(ctx, 6, top, w - 12, h - top, P.woodDeep);
  rect(ctx, 10, top, w - 20, h - top - 5, paint);
  const seam = creamTrim ? P.sandDark : P.woodDark;
  const sunlit = creamTrim ? P.cream : P.woodLight;
  for (let y = top + 4; y < h - 6; y += 6) {
    rect(ctx, 10, y, w - 20, 1, seam);
    rect(ctx, 10, y + 1, w - 20, 1, sunlit);
    const joint = 18 + ((y * 37) % (w - 36));
    rect(ctx, joint, y + 2, 1, 4, seam);
    rect(ctx, joint + 4, y + 3, 6, 1, sunlit);
  }
  rect(ctx, 10, top, w - 20, 7, seam);
  rect(ctx, w - 15, top + 4, 5, h - top - 9, seam);
  const trim = creamTrim ? P.sandLight : P.woodLight;
  for (const x of [7, w - 11]) {
    rect(ctx, x, top, 4, h - top - 6, P.woodDark);
    rect(ctx, x, top + 5, 2, h - top - 11, trim);
    rect(ctx, x - 1, h - 15, 6, 8, P.wallStone);
    rect(ctx, x - 1, h - 15, 6, 1, P.wallStoneLight);
  }
  rect(ctx, 5, h - 7, w - 10, 5, P.wallStoneDark);
  for (let x = 6; x < w - 9; x += 10) {
    rect(ctx, x, h - 7, Math.min(9, w - 5 - x), 1, P.wallStoneLight);
    rect(ctx, x, h - 6, Math.min(9, w - 5 - x), 2, P.wallStone);
  }
}

function drawSign(ctx: Ctx, w: number, eave: number, label: string, front: BuildingStyle["front"]) {
  const flagship = front === "flagship";
  const scale = flagship ? 3 : 2;
  const labelWidth = textWidth(label) * scale;
  const width = Math.max(68, labelWidth + (front === "apparel" ? 34 : 20));
  const x = Math.floor((w - width) / 2);
  const y = eave - (flagship ? 22 : 14);
  const height = flagship ? 36 : 27;
  const center = Math.floor(w / 2);
  box(ctx, x - 2, y - 2, width + 4, height + 5, P.woodLight, P.woodDeep);
  box(ctx, x, y, width, height, P.navy, P.navyDark);
  rect(ctx, x + 2, y + 1, width - 4, 1, P.deepBlue);
  rect(ctx, x + 2, y + height - 3, width - 4, 1, P.signTealDark);
  for (const screw of [x + 3, x + width - 4]) px(ctx, screw, y + height - 5, P.sandDark);
  if (flagship) drawWaveMark(ctx, center - 16, y - 6, P.cream, 2);
  else if (front !== "shaping" && front !== "cafe") drawWaveMark(ctx, center - 8, y - 1, P.cream);
  ctx.save();
  ctx.translate(Math.floor((w - labelWidth) / 2), y + (flagship ? 17 : 13));
  ctx.scale(scale, scale);
  drawText(ctx, label, 0, 0, P.cream);
  ctx.restore();

  if (front === "apparel") {
    drawShirt(ctx, x + 4, y + 13, P.coral, P.cream);
    drawShirt(ctx, x + width - 14, y + 13, P.sky, P.cream);
  } else if (front === "shaping") {
    drawWaveMark(ctx, x + 5, y - 1, P.sky);
    for (let i = 0; i < 7; i++) {
      px(ctx, center - 3 + i, y + 3 + i, P.cream);
      px(ctx, center + 3 - i, y + 3 + i, P.sandDark);
    }
    rect(ctx, center - 4, y + 2, 3, 2, P.cream);
    rect(ctx, center + 2, y + 2, 3, 2, P.sandDark);
  } else if (front === "cafe") {
    drawWaveMark(ctx, x + 5, y - 1, P.sky);
    box(ctx, center + 2, y + 5, 4, 4, P.navy, P.cream);
    rect(ctx, center - 4, y + 5, 7, 5, P.cream);
    rect(ctx, center - 5, y + 11, 10, 1, P.sandDark);
    px(ctx, center - 1, y + 3, P.cream);
  }
}

function drawDoor(ctx: Ctx, center: number, bottom: number, boarded: boolean, open: boolean) {
  const x = center - 10;
  const y = bottom - 31;
  box(ctx, x, y, 20, 31, P.woodDark, P.woodDeep);
  rect(ctx, x + 1, y + 1, 2, 29, P.woodLight);
  rect(ctx, x - 2, bottom - 2, 24, 2, P.sandDark);
  if (open) {
    // Warm interior seen through the doorway instead of a dark void.
    rect(ctx, x + 3, y + 1, 16, 29, P.woodDeep);
    rect(ctx, x + 5, y + 4, 12, 16, P.woodDark);
    rect(ctx, x + 10, y + 1, 1, 5, P.ironDark);
    rect(ctx, x + 8, y + 6, 5, 2, P.glowWarm);
    rect(ctx, x + 9, y + 8, 3, 1, P.glow);
    rect(ctx, x + 3, y + 20, 16, 10, P.wood);
    for (const row of [22, 25, 28]) rect(ctx, x + 3, y + row, 16, 1, P.woodDark);
    rect(ctx, x + 3, y + 20, 16, 1, P.woodLight);
    return;
  }
  box(ctx, x + 4, y + 3, 12, 13, P.navy, P.woodDeep);
  rect(ctx, x + 5, y + 4, 3, 5, P.sky);
  rect(ctx, x + 11, y + 4, 4, 4, P.deepBlue);
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
  const dark = shade(color, -0.24);
  const light = shade(color, 0.25);
  for (let column = -2; column < w + 2; column++) {
    const stripe = (column + 2) % 7;
    const cream = Math.floor((column + 2) / 7) % 2 === 1;
    const inset = column < 0 || column >= w ? 2 : 0;
    rect(ctx, x + column, y + inset, 1, 7 - inset, cream ? P.cream : stripe < 2 ? light : color);
    rect(ctx, x + column, y + 7, 1, stripe === 0 || stripe === 6 ? 3 : 4, cream ? P.sandDark : dark);
  }
  rect(ctx, x, y - 1, w, 1, P.woodDeep);
}

/** Open shop front: lit back wall, a pendant lamp, a shelf of wax and fins, boards and a counter. */
function drawShopInterior(ctx: Ctx, x: number, y: number, w: number, counterLeft: boolean) {
  box(ctx, x, y, w, 31, P.woodDark, P.woodDeep);
  rect(ctx, x + 2, y + 2, w - 4, 25, P.woodDark);
  for (let i = x + 4; i < x + w - 2; i += 5) rect(ctx, i, y + 4, 1, 22, P.woodDeep);
  rect(ctx, x + 2, y + 2, w - 4, 2, P.woodDeep);
  const lamp = x + Math.floor(w / 2);
  rect(ctx, lamp, y + 4, 1, 3, P.ironDark);
  rect(ctx, lamp - 2, y + 7, 5, 2, P.glowWarm);
  rect(ctx, lamp - 1, y + 9, 3, 1, P.glow);
  for (const [dx, dy] of [[-5, 10], [5, 10], [-3, 12], [3, 12]]) px(ctx, lamp + dx, y + dy, P.wood);

  rect(ctx, x + 3, y + 12, w - 6, 1, P.woodLight);
  for (let i = x + 4, n = 0; i + 3 < x + w - 3; i += 5, n++) {
    rect(ctx, i, y + 9, 3, 3, [P.sun, P.sky, P.coral, P.cream][n % 4]);
    px(ctx, i, y + 9, P.cream);
  }

  const counterX = counterLeft ? x + 2 : x + Math.floor(w / 2) - 2;
  const boardsX = counterLeft ? x + Math.floor(w / 2) + 1 : x + 3;
  for (const [i, color] of [P.cream, P.flagBlue, P.sun].entries()) {
    drawBoard(ctx, boardsX + i * 6, y + 13 + i, 5, 15 - i, color, P.coral);
  }
  const counterW = Math.floor(w / 2);
  rect(ctx, counterX, y + 19, counterW, 8, P.wood);
  rect(ctx, counterX, y + 19, counterW, 1, P.woodLight);
  rect(ctx, counterX, y + 22, counterW, 1, P.woodDark);
  rect(ctx, counterX + 2, y + 16, 4, 3, P.ironDark);
  px(ctx, counterX + 3, y + 17, P.sky);
  rect(ctx, x - 1, y + 28, w + 2, 2, P.woodLight);
}

function drawDisplay(
  ctx: Ctx, x: number, y: number, w: number, front: BuildingStyle["front"] | "bottles",
) {
  if (w < 18) return;
  box(ctx, x, y, w, 31, P.woodDark, P.woodDeep);
  rect(ctx, x + 2, y + 2, w - 4, 25, P.navyDark);
  rect(ctx, x + 2, y + 2, w - 4, 2, P.woodDeep);
  rect(ctx, x + 1, y + 4, 1, 23, P.woodLight);
  rect(ctx, x + w - 2, y + 4, 1, 23, P.wood);
  const center = x + Math.floor(w / 2);

  switch (front) {
    case "flagship":
    case "apparel": {
      const scale = front === "flagship" && w >= 74 ? 2 : 1;
      const colors = w >= 40 ? [P.cream, P.flagBlue, front === "apparel" ? P.coral : P.teal] : [P.cream];
      const rowWidth = (colors.length * 12 - 2) * scale;
      const shirtTop = y + (scale === 2 ? 8 : 13);
      rect(ctx, x + 3, shirtTop - 3, w - 6, 1, P.woodLight);
      for (const [i, color] of colors.entries()) {
        const shirtX = center - Math.floor(rowWidth / 2) + i * 12 * scale;
        rect(ctx, shirtX + 4 * scale, shirtTop - 2, 1, 2, P.sandDark);
        ctx.save();
        ctx.translate(shirtX, shirtTop);
        ctx.scale(scale, scale);
        drawShirt(ctx, 0, 0, color, i === 0 ? P.navy : P.cream);
        ctx.restore();
      }
      break;
    }
    case "gear":
      rect(ctx, x + 4, y + 5, w - 8, 1, P.woodLight);
      for (const [i, color] of [P.flagBlue, P.teal].entries()) {
        const suitX = center - 12 + i * 15;
        px(ctx, suitX + 5, y + 6, P.cream);
        rect(ctx, suitX + 1, y + 8, 8, 1, P.stoneDark);
        rect(ctx, suitX + 2, y + 9, 6, 11, P.ink);
        rect(ctx, suitX, y + 10, 2, 8, color);
        rect(ctx, suitX + 8, y + 10, 2, 8, P.deepBlue);
        rect(ctx, suitX + 2, y + 10, 1, 10, color);
        rect(ctx, suitX + 2, y + 20, 2, 6, color);
        rect(ctx, suitX + 6, y + 20, 2, 5, P.deepBlue);
        px(ctx, suitX + 5, y + 12, P.sun);
      }
      break;
    case "cafe":
      rect(ctx, x + 3, y + 4, w - 6, 20, P.woodDeep);
      rect(ctx, x + 4, y + 5, w - 8, 1, P.woodLight);
      rect(ctx, x + 4, y + 15, w - 8, 2, P.wood);
      for (const lampX of [x + 8, x + w - 9]) {
        rect(ctx, lampX, y + 5, 1, 3, P.iron);
        rect(ctx, lampX - 1, y + 8, 3, 2, P.glowWarm);
        px(ctx, lampX, y + 10, P.glow);
      }
      for (let i = x + 6; i < x + w - 7; i += 10) {
        box(ctx, i, y + 17, 5, 6, P.cream, P.woodDark);
        px(ctx, i + 5, y + 19, P.cream);
      }
      rect(ctx, x + 2, y + 23, w - 4, 4, P.woodDark);
      rect(ctx, x + 2, y + 23, w - 4, 1, P.woodLight);
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
  rect(ctx, x - 1, y + 27, w + 2, 4, P.woodDeep);
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
  rect(ctx, x, y + 1, 2, bottom - y - 6, P.leafDeep);
  for (let dy = 0; y + dy < bottom - 6; dy += 4) {
    const leafX = x + Math.round(Math.sin(dy / 4) * 4);
    ellipse(ctx, leafX, y + dy, 5, 3, P.leafDark);
    ellipse(ctx, leafX - 1, y + dy - 1, 4, 2, P.leaf);
    px(ctx, leafX - 3, y + dy - 1, P.leafLight);
    if (dy % 12 === 4) {
      ellipse(ctx, leafX + 2, y + dy, 3, 2, P.hibiscus);
      rect(ctx, leafX, y + dy - 1, 3, 1, P.pink);
      px(ctx, leafX + 2, y + dy, P.sun);
    }
  }
}

function drawWorkshop(ctx: Ctx, w: number, top: number, bottom: number) {
  box(ctx, 10, top, w - 20, bottom - top, P.woodDeep, P.woodDark);
  rect(ctx, 15, top + 3, w - 30, 2, P.woodLight);
  const workbench = Math.floor(w * 0.29);
  rect(ctx, workbench - 25, top + 5, 50, bottom - top - 10, P.woodDark);
  for (let x = workbench - 21; x < workbench + 24; x += 6) {
    rect(ctx, x, top + 6, 1, bottom - top - 14, P.woodDeep);
  }
  rect(ctx, workbench - 16, top + 14, 32, 12, P.wood);
  rect(ctx, workbench - 10, top + 14, 20, 9, P.woodLight);
  rect(ctx, workbench, top + 5, 1, 5, P.ironDark);
  rect(ctx, workbench - 5, top + 10, 11, 4, P.glowWarm);
  rect(ctx, workbench - 3, top + 14, 7, 1, P.glow);
  rect(ctx, 14, bottom - 8, w - 28, 7, P.woodDark);
  rect(ctx, 15, bottom - 3, w - 30, 2, P.wallStone);

  rect(ctx, workbench - 14, bottom - 19, 3, 16, P.woodLight);
  rect(ctx, workbench + 13, bottom - 19, 3, 16, P.woodLight);
  rect(ctx, workbench - 12, bottom - 8, 26, 2, P.wood);
  ellipse(ctx, workbench, bottom - 20, 23, 4, P.sandWetDark);
  ellipse(ctx, workbench, bottom - 22, 23, 3, P.cream);
  rect(ctx, workbench - 17, bottom - 21, 33, 1, P.sandDark);
  rect(ctx, w - 53, bottom - 15, 36, 4, P.woodLight);
  for (const dx of [21, 26, 34, 40, 47]) rect(ctx, w - dx, bottom - 25, 2, 8, P.iron);
  for (const x of [11, w - 16]) {
    rect(ctx, x, top, 5, bottom - top, P.wood);
    rect(ctx, x, top + 3, 2, bottom - top - 4, P.woodLight);
  }
}

function drawCottage(ctx: Ctx, w: number, eave: number, bottom: number, doorX: number, shutters: string) {
  const y = bottom - 29;
  for (const x of [18, w - 39]) {
    box(ctx, x, y, 21, 19, P.navy, P.woodDeep);
    rect(ctx, x + 2, y + 2, 17, 4, P.sky);
    rect(ctx, x + 2, y + 7, 17, 8, P.deepBlue);
    rect(ctx, x + 10, y + 1, 1, 16, P.woodLight);
    rect(ctx, x + 1, y + 7, 19, 1, P.woodLight);
    for (const shutterX of [x - 5, x + 20]) {
      box(ctx, shutterX, y + 1, 6, 17, shutters, P.woodDark);
      for (let slat = y + 4; slat < y + 15; slat += 3) rect(ctx, shutterX + 1, slat, 4, 1, P.woodDark);
    }
    rect(ctx, x - 1, y + 18, 23, 2, P.woodLight);
  }
  drawDoor(ctx, doorX, bottom, false, false);
  const lintelY = Math.min(eave + 8, bottom - 33);
  rect(ctx, doorX - 12, lintelY, 24, 4, P.woodDark);
  rect(ctx, doorX - 12, lintelY, 24, 1, P.woodLight);
  rect(ctx, doorX - 12, bottom - 2, 24, 4, P.wallStoneDark);
  rect(ctx, doorX - 11, bottom - 2, 22, 1, P.wallStoneLight);
}

interface Entrance {
  x: number;
  boarded: boolean;
}

/** Dimensions and the entrance's horizontal offset are in pixels. */
export function buildBuilding(w: number, h: number, style: BuildingStyle, label: string, entrance?: Entrance) {
  const [canvas, ctx] = makeCanvas(w, h);
  const { front } = style;
  const eave = Math.round(h * (front === "cottage" ? 0.52 : 0.45));
  const bottom = h - 3;
  const doorX = entrance?.x ?? Math.floor(w / 2);
  drawWall(ctx, w, h, eave - 2, style);
  drawRoof(ctx, w, eave, style);
  if (front === "cottage") {
    drawCottage(ctx, w, eave, bottom, doorX, style.shutters ?? P.teal);
    return canvas;
  }
  if (front && front !== "gear") drawGable(ctx, w, eave, style.roof);

  const displayY = bottom - 32;
  const leftWidth = doorX - 32;
  const rightWidth = w - doorX - 32;
  if (front === "shaping") {
    drawWorkshop(ctx, w, eave + 11, bottom);
  } else if (front === "surfboards") {
    box(ctx, 12, displayY - 4, w - 24, 35, P.woodDark, P.woodDeep);
    if (leftWidth >= 18) drawShopInterior(ctx, 16, displayY, leftWidth, false);
    if (rightWidth >= 18) drawShopInterior(ctx, doorX + 16, displayY, rightWidth, true);
  } else {
    drawDisplay(ctx, 16, displayY, leftWidth, front);
    const rightDisplay = front === "gear" || front === "flagship" ? "bottles" : front;
    drawDisplay(ctx, doorX + 16, displayY, rightWidth, rightDisplay);
  }
  const boarded = entrance?.boarded ?? false;
  const openFront = front === "surfboards" || front === "gear" || front === "flagship" || front === "cafe";
  drawDoor(ctx, doorX, bottom, boarded, openFront && !boarded);

  if (style.awnings) {
    const awningY = displayY - 8;
    if (leftWidth >= 18) drawAwning(ctx, 15, awningY, leftWidth + 2, style.awnings.window);
    drawAwning(ctx, doorX - 13, awningY, 26, style.awnings.door);
    if (front === "apparel" && rightWidth >= 18) {
      drawAwning(ctx, doorX + 15, awningY, rightWidth + 2, style.awnings.door);
    }
  }
  if (label) drawSign(ctx, w, eave, label, front);

  if (front === "surfboards") {
    drawBoardRack(ctx, 5, bottom + 1);
    drawPot(ctx, w - 21, h);
    drawPot(ctx, 33, h);
  } else if (front === "gear") {
    drawBoard(ctx, w - 18, bottom - 34, 10, 34, P.coral, P.cream);
  } else if (front === "flagship") {
    drawVine(ctx, 9, eave - 11, bottom);
    drawVine(ctx, w - 10, eave - 4, bottom);
    drawPot(ctx, 6, h);
    drawPot(ctx, w - 22, h);
    const signX = doorX - 29;
    box(ctx, signX, bottom - 15, 13, 14, P.navyDark, P.woodLight);
    rect(ctx, signX + 2, bottom - 11, 9, 1, P.cream);
    rect(ctx, signX + 3, bottom - 8, 7, 1, P.cream);
    for (const leg of [signX + 1, signX + 11]) rect(ctx, leg, bottom - 2, 1, 4, P.woodDeep);
  }
  return canvas;
}

function drawPot(ctx: Ctx, x: number, bottom: number) {
  ctx.save();
  ctx.translate(x, bottom - PROPS.plant.h);
  PROPS.plant.draw(ctx, 0);
  ctx.restore();
}
