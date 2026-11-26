import { P } from "./palette";
import { type Ctx, makeCanvas, px, rect, rng, shade } from "./canvas";

export const TILE = 16;

/** Every ground tile, in tileset order. Index = position in this list. */
export const TILE_NAMES = [
  "empty",
  "sand0", "sand1", "sand2",
  "sandWet", "sandWetEast", "sandWetSouthEast",
  "grass0", "grass1", "grass2",
  "grassEdge",
  "street0", "street1", "street2",
  "plaza0", "plaza1",
  "planter", "retainingWall", "retainingWallFace", "stairs", "deck", "deckStairs",
  "water0", "water1", "water2", "water3",
  "foam0", "foam1", "foam2", "foam3",
  "foamWest0", "foamWest1", "foamWest2", "foamWest3",
  "foamCorner0", "foamCorner1", "foamCorner2", "foamCorner3",
  "foamInner0", "foamInner1", "foamInner2", "foamInner3",
  "void",
  "wallCream", "wallTeal", "wallCoral",
  "floorWood", "floorTile", "floorConcrete",
  "mat",
  "wallWood", "wallSage", "railing", "floorWood1", "floorWood2",
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

function wetSand(ctx: Ctx, ox: number, south: boolean, east: boolean) {
  sand(ctx, ox, 91);
  for (let i = 0; i < TILE; i++) {
    const depth = 4 + (i % 5 === 0 ? 1 : 0);
    if (south) rect(ctx, ox + i, TILE - depth, 1, depth, P.sandWet);
    if (east) rect(ctx, ox + TILE - depth, i, depth, 1, P.sandWet);
  }
}

function cobbles(ctx: Ctx, ox: number, seed: number, plaza = false) {
  const random = rng(seed);
  const width = plaza ? 8 : 6;
  const height = plaza ? 8 : 5;
  rect(ctx, ox, 0, TILE, TILE, P.stoneDark);
  for (let y = 0; y < TILE; y += height) {
    const offset = (y / height % 2) * Math.floor(width / 2);
    for (let x = -offset; x < TILE; x += width) {
      const left = Math.max(x, 0);
      const right = Math.min(x + width - 1, TILE);
      const light = random() > 0.45;
      rect(ctx, ox + left, y, right - left, Math.min(height - 1, TILE - y), light ? P.stoneLight : P.stone);
      if (x >= 0 && light) px(ctx, ox + left, y, P.stone);
      if (x > 0 && !light && y > 0) px(ctx, ox + x - 1, y - 1, P.grout);
    }
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
      const v = (x + y * 4 + frame * 4) % 16;
      if (v === 0) px(ctx, ox + x, y, P.waterDeep);
    }
  }
  const glints = [[3, 3], [11, 9], [7, 13]];
  for (const [gx, gy] of glints) {
    const x = (gx + frame * 2) % TILE;
    px(ctx, ox + x, gy, P.waterLight);
    px(ctx, ox + ((x + 1) % TILE), gy, P.waterLight);
  }
}

function foam(ctx: Ctx, ox: number, frame: number, edge: "north" | "west" | "corner" | "inner") {
  water(ctx, ox, frame);
  const baseReach = [4, 5, 6, 5][frame];
  const reach = (along: number) => baseReach + Math.round(Math.sin(along * Math.PI / 4));
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const north = y - reach(x);
      const west = x - reach(y);
      let depth = north;
      if (edge === "west") depth = west;
      if (edge === "corner") depth = Math.min(north, west, Math.floor((north + west - 3) / 2));
      if (edge === "inner") depth = Math.round(Math.hypot(x, y)) - reach(0);

      if (depth < -1) px(ctx, ox + x, y, P.sandWet);
      else if (depth <= 0) px(ctx, ox + x, y, P.foam);
      else if (depth === 1) px(ctx, ox + x, y, P.foamShade);
      else if (depth === 3 && (x + y + frame) % 5 === 0) px(ctx, ox + x, y, P.foam);
    }
  }
}

function stoneWall(ctx: Ctx, ox: number, coping: boolean) {
  rect(ctx, ox, 0, TILE, TILE, P.wallStoneDark);
  for (let y = 0; y < TILE; y += 5) {
    const offset = y % 2 ? 0 : 3;
    for (let x = -offset; x < TILE; x += 8) {
      const left = Math.max(0, x);
      const width = Math.min(TILE, x + 7) - left;
      rect(ctx, ox + left, y, width, Math.min(4, TILE - y), P.wallStone);
      rect(ctx, ox + left, y, width, 1, P.wallStoneLight);
    }
  }
  if (coping) {
    rect(ctx, ox, 0, TILE, 3, P.wallStoneLight);
    rect(ctx, ox, 3, TILE, 1, P.wallStoneDark);
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

function shopWall(ctx: Ctx, ox: number, color: string, seam: string) {
  rect(ctx, ox, 0, TILE, TILE, color);
  for (const x of [0, 8]) {
    rect(ctx, ox + x, 0, 1, TILE, seam);
    rect(ctx, ox + x + 1, 0, 1, TILE, shade(color, 0.13));
    rect(ctx, ox + x + 5, x === 0 ? 5 : 11, 1, 4, shade(color, -0.13));
  }
}

function shopFloor(ctx: Ctx, ox: number, variant: number) {
  const base = shade(P.woodLight, -0.08);
  rect(ctx, ox, 0, TILE, TILE, base);
  const random = rng(15 + variant);
  for (const y of [0, 8]) {
    rect(ctx, ox, y, TILE, 1, P.wood);
    rect(ctx, ox, y + 1, TILE, 1, shade(base, 0.1));
    const grain = Math.floor(random() * 9) + 2;
    rect(ctx, ox + grain, y + 4, 4, 1, shade(base, -0.06));
  }
  const y = variant % 2 === 0 ? 0 : 8;
  rect(ctx, ox + [3, 11, 7][variant], y + 1, 1, 7, shade(P.wood, -0.08));
}

function railing(ctx: Ctx, ox: number) {
  shopFloor(ctx, ox, 0);
  rect(ctx, ox, 4, TILE, 6, P.woodDeep);
  rect(ctx, ox, 4, TILE, 2, P.woodLight);
  rect(ctx, ox + 5, 7, 4, 6, P.woodDark);
  rect(ctx, ox + 5, 7, 1, 6, P.woodLight);
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
      case "sandWet": case "sandWetEast": case "sandWetSouthEast":
        wetSand(ctx, ox, name !== "sandWetEast", name !== "sandWet");
        break;
      case "grass0": case "grass1": case "grass2":
        grass(ctx, ox, i - T.grass0 + 1);
        break;
      case "grassEdge":
        cobbles(ctx, ox, 5);
        rect(ctx, ox, 0, TILE, 11, P.grass);
        for (let x = 0; x < TILE; x++) {
          const d = (x * 7) % 3;
          rect(ctx, ox + x, 11, 1, d, P.grass);
          px(ctx, ox + x, 11 + d, P.grassDark);
        }
        speckle(ctx, ox, 44, [P.grassDark], 5);
        break;
      case "street0": case "street1": case "street2":
        cobbles(ctx, ox, 70 + i);
        break;
      case "plaza0": case "plaza1":
        cobbles(ctx, ox, 17 + i, true);
        break;
      case "planter":
        stoneWall(ctx, ox, true);
        rect(ctx, ox + 1, 1, 14, 11, P.grassDeep);
        for (const [x, y] of [[1, 4], [5, 2], [10, 4], [3, 8], [9, 9]]) {
          rect(ctx, ox + x, y, 4, 2, P.leafDark);
          rect(ctx, ox + x + 1, y - 1, 3, 2, P.leaf);
          px(ctx, ox + x + 2, y - 1, P.leafLight);
        }
        break;
      case "retainingWall": case "retainingWallFace":
        stoneWall(ctx, ox, name === "retainingWall");
        break;
      case "stairs": case "deckStairs": {
        const wooden = name === "deckStairs";
        rect(ctx, ox, 0, TILE, TILE, wooden ? P.wood : P.wallStone);
        for (let y = 0; y < TILE; y += 4) {
          rect(ctx, ox, y, TILE, 1, wooden ? P.woodLight : P.wallStoneLight);
          rect(ctx, ox, y + 3, TILE, 1, wooden ? P.woodDark : P.wallStoneDark);
        }
        break;
      }
      case "deck":
        planksH(ctx, ox, P.woodLight, 3);
        break;
      case "water0": case "water1": case "water2": case "water3":
        water(ctx, ox, i - T.water0);
        break;
      case "foam0": case "foam1": case "foam2": case "foam3":
        foam(ctx, ox, i - T.foam0, "north");
        break;
      case "foamWest0": case "foamWest1": case "foamWest2": case "foamWest3":
        foam(ctx, ox, i - T.foamWest0, "west");
        break;
      case "foamCorner0": case "foamCorner1": case "foamCorner2": case "foamCorner3":
        foam(ctx, ox, i - T.foamCorner0, "corner");
        break;
      case "foamInner0": case "foamInner1": case "foamInner2": case "foamInner3":
        foam(ctx, ox, i - T.foamInner0, "inner");
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
      case "wallWood":
        shopWall(ctx, ox, P.woodDark, P.woodDeep);
        break;
      case "wallSage":
        shopWall(ctx, ox, P.wallSage, P.wallSageDark);
        break;
      case "railing":
        railing(ctx, ox);
        break;
      case "floorWood": case "mat":
        shopFloor(ctx, ox, 0);
        break;
      case "floorWood1": case "floorWood2":
        shopFloor(ctx, ox, i - T.floorWood1 + 1);
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
    }
  });
  return canvas;
}

/** ASCII legend for map ground layers. */
export const LEGEND: Record<string, { tiles: TileName[]; solid?: boolean }> = {
  ".": { tiles: ["sand0", "sand1", "sand2"] },
  '"': { tiles: ["grass0", "grass1", "grass2"] },
  ":": { tiles: ["street0", "street1", "street2"] },
  "#": { tiles: ["plaza0", "plaza1"] },
  P: { tiles: ["planter"], solid: true },
  S: { tiles: ["retainingWall"], solid: true },
  s: { tiles: ["stairs"] },
  d: { tiles: ["deck"] },
  "~": { tiles: ["water0"], solid: true },
  X: { tiles: ["void"], solid: true },
  W: { tiles: ["wallCream"], solid: true },
  V: { tiles: ["wallTeal"], solid: true },
  K: { tiles: ["wallCoral"], solid: true },
  M: { tiles: ["wallWood"], solid: true },
  G: { tiles: ["wallSage"], solid: true },
  R: { tiles: ["railing"], solid: true },
  _: { tiles: ["floorWood", "floorWood1", "floorWood2"] },
  "+": { tiles: ["floorTile"] },
  o: { tiles: ["floorConcrete"] },
  D: { tiles: ["mat"] },
};
