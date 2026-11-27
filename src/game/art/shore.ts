import { P } from "./palette";

const TILE = 16;
export const SHORE_FRAMES = 4;

/** Pixels for every animation frame, stacked vertically, placed at `top` in map pixels. */
export interface ShoreImage {
  width: number;
  height: number;
  top: number;
  frames: number;
  pixels: Uint8ClampedArray<ArrayBuffer>;
}

type Point = [x: number, y: number];

/**
 * The coastline through the bottom-left corner of each row's first water tile, so the drawn shore
 * stays on the water side of the tile collision. Returns null unless every row's water is one run
 * reaching the east edge (the only coast shape the overlay draws; other maps keep the foam tiles).
 */
export function shoreline(ground: readonly string[]): Point[] | null {
  const width = ground[0]?.length ?? 0;
  const points: Point[] = [];
  for (const [y, row] of ground.entries()) {
    const start = row.indexOf("~");
    if (start === -1) continue;
    if (row.slice(start) !== "~".repeat(width - start)) return null;
    points.push([start * TILE, (y + 1) * TILE]);
  }
  if (points.length < 2) return null;

  // Extend one row past each end so the line leaves the map instead of stopping.
  const [first, second] = points;
  const [beforeLast, last] = points.slice(-2);
  points.unshift([first[0] * 2 - second[0], first[1] - TILE]);
  points.push([last[0] * 2 - beforeLast[0], last[1] + TILE]);
  return points;
}

/** Perpendicular distance in pixels from the coastline; positive is sea, negative is land. */
export function shoreDistance(points: readonly Point[], x: number, y: number): number {
  let i = 1;
  while (i < points.length - 1 && points[i][1] < y) i++;
  const [x0, y0] = points[i - 1];
  const [x1, y1] = points[i];
  const slope = (x1 - x0) / (y1 - y0);
  const coastX = x0 + (y - y0) * slope;
  return (x - coastX) / Math.hypot(1, slope);
}

const hash = (a: number, b: number) => (((a * 73856093) ^ (b * 19349663)) >>> 0) % 97;

const WET = 9;
const SWASH = [-1, 0, 1, 0];
const SET_SPACING = 24;

/** Palette color for one pixel of the shore, or undefined to leave the sand tile showing. */
function shorePixel(d: number, x: number, y: number, frame: number): string | undefined {
  const along = x + y * 3; // runs roughly parallel to the coast
  const swash = SWASH[frame] + Math.round(Math.sin(along / 9) * 1.3);
  const lace = hash(x, y + frame * 7) < 20;

  if (d < -WET - 1) return undefined;
  if (d < -WET) return (x + y) % 2 ? P.sandDark : undefined;
  if (d < swash - 2) {
    // Sparse glints where the backwash left a film of water.
    if (Math.round(d) === -5 && hash(Math.floor(along / 6), 3) < 14) return P.sandLight;
    return P.sandWet;
  }
  if (d < swash - 1) return lace ? P.sandWet : P.foamShade;
  if (d < swash + 1.5) return lace ? P.foamShade : P.foam;
  if (d < swash + 2.5) return P.foamShade;
  if (d < 7) return hash(x, y) < 8 ? P.foamShade : P.waterLight;

  // Two broken lines of white water roll in toward the beach, one set every SET_SPACING px.
  const set = ((d + frame * (SET_SPACING / SHORE_FRAMES)) % SET_SPACING + SET_SPACING) % SET_SPACING;
  const broken = hash(Math.floor(along / 11), Math.floor((d + frame * 6) / SET_SPACING)) < 22;
  if (d < 44 && !broken) {
    if (set < 1.2) return P.foam;
    if (set < 2.4) return P.foamShade;
  }
  if (d < 12) return (x + y) % 2 ? P.waterLight : P.water;

  // Ripples: short lit crests over a darker trough, drifting with the frame.
  const row = y % 6;
  const run = (x + frame * 4 + Math.floor(y / 6) * 7) % 16;
  if (row === 0 && run < 5) return P.waterLight;
  if (row === 1 && run > 0 && run < 4) return P.waterDeep;
  if (d > 72) return (x + y) % 2 ? P.waterDeep : P.water;
  return P.water;
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

export function buildShore(ground: readonly string[]): ShoreImage | null {
  const points = shoreline(ground);
  if (!points) return null;
  const width = (ground[0]?.length ?? 0) * TILE;
  const top = Math.max(0, points[1][1] - 2 * TILE);
  const height = ground.length * TILE - top;
  const pixels = new Uint8ClampedArray(width * height * SHORE_FRAMES * 4);
  const colors = new Map<string, number[]>();

  for (let frame = 0; frame < SHORE_FRAMES; frame++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = shorePixel(shoreDistance(points, x, top + y), x, top + y, frame);
        if (!color) continue;
        if (!colors.has(color)) colors.set(color, rgb(color));
        const [r, g, b] = colors.get(color)!;
        const i = ((frame * height + y) * width + x) * 4;
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
        pixels[i + 3] = 255;
      }
    }
  }
  return { width, height, top, frames: SHORE_FRAMES, pixels };
}
