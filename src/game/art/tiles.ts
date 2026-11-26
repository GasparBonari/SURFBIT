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

const wrap = (v: number) => ((v % TILE) + TILE) % TILE;

function sand(ctx: Ctx, ox: number, seed: number) {
  rect(ctx, ox, 0, TILE, TILE, P.sand);
  const r = rng(seed);
  // Wind ripples: short dark dashes with a lit pixel row above, wrapping so tiles join.
  for (let i = 0; i < 2; i++) {
    const y = 4 + i * 8 + Math.floor(r() * 3);
    const x = Math.floor(r() * TILE);
    const len = 3 + Math.floor(r() * 3);
    for (let j = 0; j < len; j++) {
      px(ctx, ox + wrap(x + j), y, P.sandDark);
      if (j > 0 && j < len - 1) px(ctx, ox + wrap(x + j), y - 1, P.sandLight);
    }
  }
  speckle(ctx, ox, seed + 3, [P.sandDark, P.sandDark, P.sandLight, P.sandWet], 10);
  if (seed % 3 === 0) {
    px(ctx, ox + 11, 12, P.cream);
    px(ctx, ox + 12, 12, P.pink);
    px(ctx, ox + 12, 13, P.sandWet);
  } else if (seed % 3 === 1) {
    px(ctx, ox + 4, 11, P.wallStoneLight);
    px(ctx, ox + 5, 11, P.wallStone);
    px(ctx, ox + 5, 12, P.sandWetDark);
  }
}

function wetSand(ctx: Ctx, ox: number, south: boolean, east: boolean) {
  sand(ctx, ox, 91);
  for (let i = 0; i < TILE; i++) {
    const depth = 4 + Math.round(Math.sin((i * Math.PI) / 8) * 1.4);
    if (south) {
      rect(ctx, ox + i, TILE - depth, 1, depth, P.sandWet);
      px(ctx, ox + i, TILE - depth, P.sandDark);
      if (i % 3 !== 1) px(ctx, ox + i, TILE - 2, P.sandLight);
    }
    if (east) {
      rect(ctx, ox + TILE - depth, i, depth, 1, P.sandWet);
      px(ctx, ox + TILE - depth, i, P.sandDark);
      if (i % 3 !== 1) px(ctx, ox + TILE - 2, i, P.sandLight);
    }
  }
}

type Seed = [x: number, y: number];

// Toroidal seed layouts: cells wrap at the tile edge, so neighbouring tiles join seamlessly.
const COBBLE_SEEDS: Seed[] = [[2, 2], [9, 1], [14, 6], [6, 8], [11, 12], [2, 13]];
const PAVER_SEEDS: Seed[] = [[4, 4], [12, 3], [3, 12], [11, 11]];

/** Rounded stones: grout where two cells meet, light top-left bevel, dark bottom-right bevel. */
function stones(ctx: Ctx, ox: number, seeds: Seed[], fills: string[], squash: number) {
  const nearest = (x: number, y: number) => {
    let best = Infinity, second = Infinity, cell = 0;
    seeds.forEach(([sx, sy], i) => {
      const dx = Math.min(Math.abs(x - sx), TILE - Math.abs(x - sx)) * squash;
      const dy = Math.min(Math.abs(y - sy), TILE - Math.abs(y - sy));
      const d = Math.hypot(dx, dy);
      if (d < best) { second = best; best = d; cell = i; } else if (d < second) second = d;
    });
    return { cell, edge: second - best < 1.05 };
  };
  const grid = Array.from({ length: TILE }, (_, y) => Array.from({ length: TILE }, (_, x) => nearest(x, y)));
  const at = (x: number, y: number) => grid[wrap(y)][wrap(x)];
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const here = at(x, y);
      if (here.edge) {
        // Grout is darkest where several stones meet, softer along a single seam.
        const deep = at(x + 1, y).edge && at(x, y + 1).edge;
        px(ctx, ox + x, y, deep ? P.grout : P.stoneDark);
        continue;
      }
      const fill = fills[here.cell % fills.length];
      const lit = at(x - 1, y).edge || at(x, y - 1).edge;
      const shaded = at(x + 1, y).edge || at(x, y + 1).edge;
      px(ctx, ox + x, y, shaded ? shade(fill, -0.1) : lit ? shade(fill, 0.35) : fill);
    }
  }
}

/** Cells touching the tile edge keep the same fill in every variant so stones never change colour mid-stone. */
function cobbleFills(seeds: Seed[], variant: number, plaza: boolean) {
  const r = rng(40 + variant * 13);
  const base = plaza ? [P.stone, P.stoneLight, P.sandDark] : [P.stone, P.stone, P.stoneLight, P.wallStoneLight, P.sandDark];
  return seeds.map(([x, y], i) => {
    const touchesEdge = x < 3 || y < 3 || x > 12 || y > 12;
    return touchesEdge ? base[i % base.length] : base[Math.floor(r() * base.length)];
  });
}

function cobbles(ctx: Ctx, ox: number, variant: number, plaza = false) {
  const seeds = plaza ? PAVER_SEEDS : COBBLE_SEEDS;
  stones(ctx, ox, seeds, cobbleFills(seeds, variant, plaza), plaza ? 0.8 : 0.75);
  if (variant === 1) {
    px(ctx, ox + 7, 5, P.grout); // hairline crack
    px(ctx, ox + 8, 6, P.stoneDark);
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

// Ripple bands: [row, start x, length]. Frames shift them 4px east so the loop closes after 4 frames.
const RIPPLES: [number, number, number][] = [[2, 3, 6], [7, 11, 4], [12, 1, 7]];

function water(ctx: Ctx, ox: number, frame: number) {
  rect(ctx, ox, 0, TILE, TILE, P.water);
  for (const [row, start, len] of RIPPLES) {
    const shift = frame * 4 + (row % 2 ? 0 : 2);
    for (let j = 0; j < len; j++) {
      const x = wrap(start + j + shift);
      const middle = j > 0 && j < len - 1;
      px(ctx, ox + x, row, middle && j % 3 === 1 ? P.foamShade : P.waterLight);
      // Trough sits a few pixels behind each crest.
      px(ctx, ox + wrap(x - 7), row + 2, P.waterDeep);
    }
  }
  px(ctx, ox + wrap(3 + frame * 4), 7, P.foam);
  px(ctx, ox + wrap(11 + frame * 4), 4, P.waterDeeper);
}

function foam(ctx: Ctx, ox: number, frame: number, edge: "north" | "west" | "corner" | "inner") {
  water(ctx, ox, frame);
  const baseReach = [4, 5, 6, 5][frame];
  const reach = (along: number) => baseReach + Math.round(Math.sin(along * Math.PI / 4));
  const lace = rng(500 + frame);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const north = y - reach(x);
      const west = x - reach(y);
      let depth = north;
      if (edge === "west") depth = west;
      if (edge === "corner") depth = Math.min(north, west, Math.floor((north + west - 3) / 2));
      if (edge === "inner") depth = Math.round(Math.hypot(x, y)) - reach(0);
      const hole = lace() < 0.22;

      if (depth < -2) px(ctx, ox + x, y, P.sandWet);
      else if (depth === -2) px(ctx, ox + x, y, hole ? P.sandWet : P.foamShade);
      else if (depth <= 0) px(ctx, ox + x, y, hole && depth === 0 ? P.foamShade : P.foam);
      else if (depth === 1) px(ctx, ox + x, y, P.foamShade);
      else if (depth <= 4) px(ctx, ox + x, y, (x * 3 + y + frame * 2) % 7 === 0 ? P.foamShade : P.waterLight);
      else if (depth === 6 && (x + y * 2 + frame * 3) % 5 < 2) px(ctx, ox + x, y, P.foam);
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
        cobbles(ctx, ox, 0);
        rect(ctx, ox, 0, TILE, 11, P.grass);
        for (let x = 0; x < TILE; x++) {
          const d = (x * 7) % 3;
          rect(ctx, ox + x, 11, 1, d, P.grass);
          px(ctx, ox + x, 11 + d, P.grassDark);
        }
        speckle(ctx, ox, 44, [P.grassDark], 5);
        break;
      case "street0": case "street1": case "street2":
        cobbles(ctx, ox, i - T.street0);
        break;
      case "plaza0": case "plaza1":
        cobbles(ctx, ox, i - T.plaza0, true);
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
