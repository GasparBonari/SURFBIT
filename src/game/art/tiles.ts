import { P } from "./palette";
import { type Ctx, makeCanvas, px, rect, rng, shade } from "./canvas";

export const TILE = 16;

/** Every ground tile, in tileset order. Index = position in this list. */
export const TILE_NAMES = [
  "empty",
  "sand0", "sand1", "sand2",
  "sandWet",
  "grass0", "grass1", "grass2",
  "grassEdge",
  "path0", "path1",
  "boardwalk",
  "pier",
  "plaza0", "plaza1",
  "water0", "water1", "water2", "water3",
  "foam0", "foam1", "foam2", "foam3",
  "void",
  "wallCream", "wallTeal", "wallCoral",
  "floorWood", "floorTile", "floorConcrete",
  "mat",
] as const;

export type TileName = (typeof TILE_NAMES)[number];
export const T = Object.fromEntries(TILE_NAMES.map((n, i) => [n, i])) as Record<TileName, number>;

export const WATER_FRAMES = [T.water0, T.water1, T.water2, T.water3];
export const FOAM_FRAMES = [T.foam0, T.foam1, T.foam2, T.foam3];

function speckle(ctx: Ctx, ox: number, seed: number, colors: string[], count: number) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    px(ctx, ox + Math.floor(r() * TILE), Math.floor(r() * TILE), colors[Math.floor(r() * colors.length)]);
  }
}

function sand(ctx: Ctx, ox: number, seed: number) {
  rect(ctx, ox, 0, TILE, TILE, P.sand);
  speckle(ctx, ox, seed, [P.sandDark, P.sandLight, P.sandDark], 14);
  if (seed % 3 === 0) {
    // tiny shell
    px(ctx, ox + 11, 4, P.cream);
    px(ctx, ox + 12, 4, P.pink);
  }
}

function grass(ctx: Ctx, ox: number, seed: number) {
  rect(ctx, ox, 0, TILE, TILE, P.grass);
  const r = rng(seed);
  for (let i = 0; i < 9; i++) {
    const x = ox + Math.floor(r() * 15);
    const y = 1 + Math.floor(r() * 14);
    px(ctx, x, y, P.grassDark);
    px(ctx, x + 1, y - 1, P.grassDark);
  }
  speckle(ctx, ox, seed + 7, [P.grassLight], 6);
  if (seed === 3) {
    px(ctx, ox + 4, 5, P.cream);
    px(ctx, ox + 11, 10, P.sun);
  }
}

function water(ctx: Ctx, ox: number, frame: number) {
  rect(ctx, ox, 0, TILE, TILE, P.water);
  // gentle diagonal swell bands that shift with the frame
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const v = (x + y * 2 + frame * 4) % 16;
      if (v === 0 || v === 1) px(ctx, ox + x, y, P.waterDeep);
    }
  }
  const glints = [[3, 3], [11, 9], [7, 13]];
  for (const [gx, gy] of glints) {
    const x = (gx + frame * 2) % TILE;
    px(ctx, ox + x, gy, P.waterLight);
    px(ctx, ox + ((x + 1) % TILE), gy, P.waterLight);
  }
}

function foam(ctx: Ctx, ox: number, frame: number) {
  water(ctx, ox, frame);
  // swash lapping onto the sand: band thickness oscillates per frame
  const reach = [5, 7, 8, 6][frame];
  for (let x = 0; x < TILE; x++) {
    const edge = reach + Math.round(Math.sin((x + frame * 3) * 0.8));
    rect(ctx, ox + x, 0, 1, edge, P.foam);
    px(ctx, ox + x, edge, P.foamShade);
    if ((x + frame) % 5 === 0) px(ctx, ox + x, edge + 2, P.foam);
  }
}

function planksH(ctx: Ctx, ox: number, base: string, seed: number) {
  rect(ctx, ox, 0, TILE, TILE, base);
  for (let y = 3; y < TILE; y += 4) rect(ctx, ox, y, TILE, 1, shade(base, -0.3));
  const r = rng(seed);
  for (let row = 0; row < 4; row++) {
    const gap = Math.floor(r() * 12) + 2;
    rect(ctx, ox + gap, row * 4, 1, 3, shade(base, -0.3));
    px(ctx, ox + ((gap + 6) % 16), row * 4 + 1, shade(base, 0.2));
  }
}

function wall(ctx: Ctx, ox: number, base: string) {
  rect(ctx, ox, 0, TILE, TILE, base);
  for (let x = 0; x < TILE; x += 4) rect(ctx, ox + x, 0, 1, 11, shade(base, -0.12));
  rect(ctx, ox, 11, TILE, 1, shade(base, -0.35));
  rect(ctx, ox, 12, TILE, 4, P.woodDark);
  rect(ctx, ox, 12, TILE, 1, P.woodLight);
}

export function buildTileset(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(TILE * TILE_NAMES.length, TILE);
  TILE_NAMES.forEach((name, i) => {
    const ox = i * TILE;
    switch (name) {
      case "empty":
        break;
      case "sand0": case "sand1": case "sand2":
        sand(ctx, ox, 11 + i * 17);
        break;
      case "sandWet":
        rect(ctx, ox, 0, TILE, TILE, P.sand);
        rect(ctx, ox, 8, TILE, 8, P.sandWet);
        for (let x = 0; x < TILE; x++) px(ctx, ox + x, 7 + (x % 3 === 0 ? 1 : 0), P.sandWet);
        speckle(ctx, ox, 91, [P.sandWetDark, P.sandDark], 10);
        break;
      case "grass0": case "grass1": case "grass2":
        grass(ctx, ox, i - T.grass0 + 1);
        break;
      case "grassEdge":
        sand(ctx, ox, 5);
        rect(ctx, ox, 0, TILE, 11, P.grass);
        for (let x = 0; x < TILE; x++) {
          const d = (x * 7) % 3;
          rect(ctx, ox + x, 11, 1, d, P.grass);
          px(ctx, ox + x, 11 + d, P.grassDark);
        }
        speckle(ctx, ox, 44, [P.grassDark], 5);
        break;
      case "path0": case "path1": {
        rect(ctx, ox, 0, TILE, TILE, P.sandDark);
        speckle(ctx, ox, 70 + i, [P.stoneDark, P.sand, P.stone], 22);
        break;
      }
      case "boardwalk":
        planksH(ctx, ox, P.woodLight, 3);
        break;
      case "pier": {
        rect(ctx, ox, 0, TILE, TILE, P.woodLight);
        for (let x = 3; x < TILE; x += 4) rect(ctx, ox + x, 0, 1, TILE, P.woodDark);
        rect(ctx, ox + 1, 6, 1, 1, P.woodDeep);
        rect(ctx, ox + 9, 12, 1, 1, P.woodDeep);
        break;
      }
      case "plaza0": case "plaza1": {
        rect(ctx, ox, 0, TILE, TILE, P.stoneDark);
        const alt = name === "plaza1";
        rect(ctx, ox, 0, 7, 7, alt ? P.stoneLight : P.stone);
        rect(ctx, ox + 8, 0, 8, 7, alt ? P.stone : P.stoneLight);
        rect(ctx, ox, 8, 7, 8, alt ? P.stone : P.stoneLight);
        rect(ctx, ox + 8, 8, 8, 8, alt ? P.stoneLight : P.stone);
        break;
      }
      case "water0": case "water1": case "water2": case "water3":
        water(ctx, ox, i - T.water0);
        break;
      case "foam0": case "foam1": case "foam2": case "foam3":
        foam(ctx, ox, i - T.foam0);
        break;
      case "void":
        rect(ctx, ox, 0, TILE, TILE, P.outline);
        break;
      case "wallCream":
        wall(ctx, ox, P.cream);
        break;
      case "wallTeal":
        wall(ctx, ox, P.teal);
        break;
      case "wallCoral":
        wall(ctx, ox, "#f0a07a");
        break;
      case "floorWood":
        planksH(ctx, ox, P.wood, 9);
        break;
      case "floorTile": {
        const a = P.cream, b = "#9fd8d2";
        for (let y = 0; y < 2; y++)
          for (let x = 0; x < 2; x++) rect(ctx, ox + x * 8, y * 8, 8, 8, (x + y) % 2 ? b : a);
        break;
      }
      case "floorConcrete":
        rect(ctx, ox, 0, TILE, TILE, "#c9c3b8");
        speckle(ctx, ox, 31, ["#b5aea2", "#d8d3ca"], 16);
        rect(ctx, ox, 15, TILE, 1, "#b5aea2");
        rect(ctx, ox + 15, 0, 1, TILE, "#b5aea2");
        break;
      case "mat":
        rect(ctx, ox, 0, TILE, TILE, P.wood);
        rect(ctx, ox + 1, 2, 14, 12, P.coralDark);
        rect(ctx, ox + 2, 3, 12, 10, P.coral);
        for (let x = 3; x < 13; x += 2) rect(ctx, ox + x, 4, 1, 8, P.coralDark);
        break;
    }
  });
  return canvas;
}

/** ASCII legend for map ground layers. */
export const LEGEND: Record<string, { tiles: TileName[]; solid?: boolean }> = {
  ".": { tiles: ["sand0", "sand1", "sand2"] },
  '"': { tiles: ["grass0", "grass1", "grass2"] },
  ":": { tiles: ["path0", "path1"] },
  "=": { tiles: ["boardwalk"] },
  "|": { tiles: ["pier"] },
  "#": { tiles: ["plaza0", "plaza1"] },
  "~": { tiles: ["water0"], solid: true },
  X: { tiles: ["void"], solid: true },
  W: { tiles: ["wallCream"], solid: true },
  V: { tiles: ["wallTeal"], solid: true },
  K: { tiles: ["wallCoral"], solid: true },
  _: { tiles: ["floorWood"] },
  "+": { tiles: ["floorTile"] },
  o: { tiles: ["floorConcrete"] },
  D: { tiles: ["mat"] },
};
