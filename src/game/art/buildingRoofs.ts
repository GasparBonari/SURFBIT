import type { BuildingStyle } from "../maps/types";
import { px, rect, rng, type Ctx } from "./canvas";
import { P } from "./palette";

const ROOFS = {
  thatch: { base: P.thatch, light: P.thatchLight, dark: P.thatchDark, edge: P.thatchDeep },
  terracotta: { base: P.terracotta, light: P.terracottaLight, dark: P.terracottaDark, edge: P.woodDeep },
  indigo: { base: P.roofIndigo, light: P.roofSlate, dark: P.roofIndigoDark, edge: P.roofIndigoDeep },
  slate: { base: P.roofSlate, light: P.foamShade, dark: P.roofSlateDark, edge: P.roofIndigoDeep },
};

// The top intervals form the ridges. Pitch controls how quickly the sides flare out.
const PROFILES = {
  surfboards: { left: 0.41, right: 0.52, pitch: 1.25 },
  flagship: { left: 0.47, right: 0.53, pitch: 1 },
  gear: { left: 0.37, right: 0.63, pitch: 2.45 },
  shaping: { left: 0.26, right: 0.48, pitch: 1 },
  apparel: { left: 0.26, right: 0.49, pitch: 1 },
  cafe: { left: 0.30, right: 0.63, pitch: 1 },
  cottage: { left: 0.14, right: 0.77, pitch: 1 },
};

const TILES = {
  terracotta: { width: 9, course: 8, barrel: true },
  indigo: { width: 12, course: 9, barrel: false },
  slate: { width: 19, course: 8, barrel: false },
};

const hash = (x: number, y: number) => (((x * 73856093) ^ (y * 19349663)) >>> 0) % 97;

function thatchRow(ctx: Ctx, y: number, left: number, right: number, ridge: number) {
  const { base, light, dark, edge } = ROOFS.thatch;
  for (let x = left; x < right; x++) {
    // Offset groups of straw so the course ends break into staggered bundles.
    const strandX = x + Math.round((x < ridge ? 1 : -1) * y / 5);
    const lift = hash(Math.floor(strandX / 6), 3) % 5;
    const tier = Math.floor((y + lift) / 9);
    const row = (y + lift) % 9;
    const strand = hash(strandX, tier) % 6;
    let color: string = strand < 2 ? light : strand < 5 ? base : dark;
    if (x >= ridge) color = color === light ? base : dark;
    if (row === 8) color = strand < 3 ? dark : edge;
    if (row === 7 && strand === 5) color = edge;
    px(ctx, x, y, color);
  }
}

function tiledRow(
  ctx: Ctx, y: number, left: number, right: number, ridge: number, roof: keyof typeof TILES,
) {
  const { base, light, dark, edge } = ROOFS[roof];
  const { width, course, barrel } = TILES[roof];
  const tier = Math.floor(y / course);
  const row = y % course;
  const stagger = barrel ? 0 : (tier % 2) * Math.floor(width / 2);
  for (let x = left; x < right; x++) {
    const lit = x < ridge;
    const slopedX = x + stagger + Math.round((lit ? 0.55 : -0.45) * y);
    const column = ((slopedX % width) + width) % width;
    const variation = hash(Math.floor(slopedX / width), tier) % 5;
    let color: string = lit ? base : dark;
    if (column === 0 || row === course - 1) color = lit ? dark : edge;
    else if (lit && (column <= (barrel ? 2 : 1) || (row === 1 && variation < 3))) color = light;
    else if (variation === 0 || (!lit && row === 1)) color = lit ? dark : base;
    px(ctx, x, y, color);
  }
}

export function drawRoof(ctx: Ctx, w: number, h: number, style: BuildingStyle) {
  const { roof, front } = style;
  const profile = front ? PROFILES[front] : PROFILES.flagship;
  const { edge, light, dark } = ROOFS[roof];
  const leftRidge = Math.round(w * profile.left);
  const rightRidge = Math.round(w * profile.right);
  for (let y = 0; y < h; y++) {
    const slope = (1 - y / (h - 1)) ** profile.pitch;
    const left = Math.round(2 + (leftRidge - 2) * slope);
    const right = Math.round(w - 2 - (w - 2 - rightRidge) * slope);
    const ridge = Math.round((leftRidge + rightRidge) / 2 + y / 5);
    rect(ctx, left, y, right - left, 1, edge);
    if (y >= h - 3) continue;
    if (roof === "thatch") thatchRow(ctx, y, left + 2, right - 2, ridge);
    else tiledRow(ctx, y, left + 2, right - 2, ridge, roof);
    px(ctx, left + 1, y, light);
    px(ctx, right - 2, y, dark);
  }
  rect(ctx, leftRidge + 2, 1, rightRidge - leftRidge - 3, 2, light);

  if (roof === "thatch") {
    const random = rng(w * h);
    for (let x = 3; x < w - 3; x++) {
      const hang = 2 + Math.floor(random() * 4);
      rect(ctx, x, h - 4, 1, hang, x % 3 === 0 ? dark : P.thatch);
      px(ctx, x, h - 4 + hang, edge);
    }
  } else {
    rect(ctx, 5, h - 3, w - 10, 1, dark);
  }
}
