import { P } from "./palette";
import { type Ctx, makeCanvas, px, rect, rng, shade } from "./canvas";
import { drawWaveMark } from "./motifs";

export const TILE = 16;

/** Every ground tile, in tileset order. Index = position in this list. */
export const TILE_NAMES = [
  "empty",
  "sand0", "sand1", "sand2",
  "sandWet", "sandWetEast", "sandWetSouthEast", "sandWetCorner",
  "grass0", "grass1", "grass2",
  "grassEdge",
  "street0", "street1", "street2",
  "plaza0", "plaza1",
  // Planter rims by edge mask (1 = north, 2 = east, 4 = south, 8 = west); keep in order.
  "planter0", "planter1", "planter2", "planter3", "planter4", "planter5", "planter6", "planter7",
  "planter8", "planter9", "planter10", "planter11", "planter12", "planter13", "planter14", "planter15",
  "retainingWall", "retainingWallFace",
  "retainingWallEndW", "retainingWallEndE", "retainingWallFaceEndW", "retainingWallFaceEndE",
  "stairs", "deck", "deckStairs",
  "water0", "water1", "water2", "water3",
  "foam0", "foam1", "foam2", "foam3",
  "foamWest0", "foamWest1", "foamWest2", "foamWest3",
  "foamCorner0", "foamCorner1", "foamCorner2", "foamCorner3",
  "foamInner0", "foamInner1", "foamInner2", "foamInner3",
  "void",
  "wallCream", "wallTeal", "wallCoral",
  "floorWood", "floorTile", "floorConcrete",
  "mat", "matW", "matE", "matWE",
  "wallWood", "wallSage", "wallWoodTrim", "wallSageTrim", "railing", "floorWood1", "floorWood2",
] as const;

export type TileName = (typeof TILE_NAMES)[number];
export const T = Object.fromEntries(TILE_NAMES.map((n, i) => [n, i])) as Record<TileName, number>;

export const WATER_FRAMES = [T.water0, T.water1, T.water2, T.water3];
export const FOAM_FRAMES = [T.foam0, T.foam1, T.foam2, T.foam3];

/** Planter tile for a rim mask: 1 = north, 2 = east, 4 = south, 8 = west. */
export const planterTile = (mask: number) => T.planter0 + mask;

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

/** Wet band along the bottom, then up the diagonal that meets a diagonal foam corner to the east. */
function wetSandCorner(ctx: Ctx, ox: number) {
  wetSand(ctx, ox, true, false);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const d = x + y - 27;
      if (d === 0) px(ctx, ox + x, y, P.sandDark);
      else if (d > 0) px(ctx, ox + x, y, (x + y) % 5 === 0 ? P.sandLight : P.sandWet);
    }
  }
}

function wetSand(ctx: Ctx, ox: number, south: boolean, east: boolean) {
  sand(ctx, ox, 91);
  for (let i = 0; i < TILE; i++) {
    const depth = 4 + Math.round(Math.sin((i * Math.PI) / 8) * 1.4);
    if (south) {
      rect(ctx, ox + i, TILE - depth, 1, depth, P.sandWet);
      px(ctx, ox + i, TILE - depth, P.sandDark);
    }
    if (east) {
      rect(ctx, ox + TILE - depth, i, depth, 1, P.sandWet);
      px(ctx, ox + TILE - depth, i, P.sandDark);
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
  // Tufts: a dark root with a sunlit tip, so the bed reads as blades rather than noise.
  for (let i = 0; i < 10; i++) {
    const x = Math.floor(r() * TILE);
    const y = 2 + Math.floor(r() * 14);
    px(ctx, ox + x, y, P.grassDark);
    px(ctx, ox + wrap(x + 1), y, P.grassDark);
    px(ctx, ox + x, y - 1, P.grassLight);
    if (i % 3 === 0) px(ctx, ox + wrap(x + 2), y - 1, P.grassDark);
  }
  const flowers = [P.cream, P.sun, P.pink];
  for (let i = 0; i < seed % 3; i++) {
    px(ctx, ox + Math.floor(r() * TILE), 1 + Math.floor(r() * 14), flowers[(seed + i) % 3]);
  }
}

/** Lawn over cobbles: ragged tufts overhang the street and cast a dark lip onto it. */
function grassEdge(ctx: Ctx, ox: number) {
  cobbles(ctx, ox, 0);
  const r = rng(45);
  for (let x = 0; x < TILE; x++) {
    const hang = 10 + Math.floor(r() * 3);
    rect(ctx, ox + x, 0, 1, hang, P.grass);
    px(ctx, ox + x, hang, P.grassDark);
    px(ctx, ox + x, hang + 1, P.stoneDark);
    if (x % 3 === 1) px(ctx, ox + x, hang - 1, P.grassLight);
    if (x % 4 === 2) px(ctx, ox + x, 3 + (x % 5), P.grassDark);
  }
}

// Leaf clumps [x, y, radius]; they wrap so a planter's interior tiles join into one bed.
const LEAF_CLUMPS: [number, number, number][] = [[3, 3, 2], [10, 2, 3], [6, 9, 3], [14, 8, 2], [1, 13, 2], [11, 13, 3]];

/** Raised stone planter: dense foliage, lit coping on top and sides, a block face along the front. */
function planter(ctx: Ctx, ox: number, mask: number) {
  const [north, east, south, west] = [mask & 1, mask & 2, mask & 4, mask & 8];
  const left = west ? 2 : 0;
  const right = east ? 14 : 16;
  const top = north ? 2 : 0;
  const bottom = south ? 11 : 16;
  rect(ctx, ox, 0, TILE, TILE, P.leafDark);
  if (north) {
    rect(ctx, ox, 0, TILE, 1, P.wallStoneLight);
    rect(ctx, ox, 1, TILE, 1, P.wallStone);
    rect(ctx, ox, 2, TILE, 1, P.wallStoneDark);
  }
  if (west) {
    rect(ctx, ox, 0, 1, TILE, P.wallStoneDark);
    rect(ctx, ox + 1, 0, 1, TILE, P.wallStoneLight);
    rect(ctx, ox + 2, 0, 1, TILE, P.wallStone);
  }
  if (east) {
    rect(ctx, ox + 13, 0, 1, TILE, P.wallStoneLight);
    rect(ctx, ox + 14, 0, 1, TILE, P.wallStone);
    rect(ctx, ox + 15, 0, 1, TILE, P.wallStoneDark);
  }
  const leaf = (x: number, y: number, color: string) => {
    const lx = wrap(x), ly = wrap(y);
    if (lx >= left && lx < right && ly >= top && ly < bottom) px(ctx, ox + lx, ly, color);
  };
  // Round bushes: shaded underside, leafy body, sunlit top-left.
  for (const [cx, cy, r] of LEAF_CLUMPS) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r - 1; dx <= r + 1; dx++) {
        if ((dx * dx) / ((r + 1) * (r + 1)) + (dy * dy) / (r * r) > 1) continue;
        const lit = dx + dy < -r + 1;
        leaf(cx + dx, cy + dy, dy >= r - 1 ? P.leafDeep : lit ? P.leafLight : P.leaf);
      }
    }
    leaf(cx - 1, cy - r + 1, P.leafGlint);
  }
  // Hibiscus blooms at a different spot per rim shape so long beds don't repeat a pattern.
  const [fx, fy] = [[9, 5], [4, 9], [12, 12], [6, 3]][mask % 4];
  leaf(fx, fy, P.hibiscus);
  leaf(fx + 1, fy, P.pink);
  leaf(fx, fy + 1, P.hibiscus);
  leaf(fx + 1, fy + 1, P.sun);
  if (south) {
    rect(ctx, ox, 10, TILE, 1, P.wallStoneLight);
    rect(ctx, ox, 11, TILE, 4, P.wallStone);
    rect(ctx, ox, 15, TILE, 1, P.wallStoneDark);
    for (const [x, y] of [[4, 11], [11, 11], [0, 13], [8, 13], [15, 13]]) {
      rect(ctx, ox + x, y, 1, 2, P.wallStoneDark);
      px(ctx, ox + wrap(x + 1), y, P.wallStoneLight);
    }
    rect(ctx, ox, 13, TILE, 1, P.wallStoneDark);
    if (west) rect(ctx, ox, 10, 1, 6, P.wallStoneDark);
    if (east) rect(ctx, ox + 15, 10, 1, 6, P.wallStoneDark);
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
      // Distance from the swash line, in pixels; negative is land. Corners run diagonally so a
      // one-tile shoreline step reads as a slope instead of a staircase.
      let depth = y - reach(x);
      if (edge === "west") depth = x - reach(y);
      if (edge === "corner") depth = Math.round((x + y - TILE - baseReach) * 0.71);
      if (edge === "inner") depth = Math.round((x + y - baseReach) * 0.71);
      const hole = lace() < 0.22;

      if (depth < -7) px(ctx, ox + x, y, (x * 7 + y * 3) % 11 === 0 ? P.sandDark : P.sand);
      else if (depth === -7) px(ctx, ox + x, y, P.sandDark);
      else if (depth < -2) px(ctx, ox + x, y, P.sandWet);
      else if (depth === -2) px(ctx, ox + x, y, hole ? P.sandWet : P.foamShade);
      else if (depth <= 0) px(ctx, ox + x, y, hole && depth === 0 ? P.foamShade : P.foam);
      else if (depth === 1) px(ctx, ox + x, y, P.foamShade);
      else if (depth <= 4) px(ctx, ox + x, y, (x * 3 + y + frame * 2) % 7 === 0 ? P.foamShade : P.waterLight);
      else if (depth === 6 && (x + y * 2 + frame * 3) % 5 < 2) px(ctx, ox + x, y, P.foam);
    }
  }
}

// Rubble courses: [row height, block widths summing to 16, offset]. Offsets wrap so tiles join.
const COURSES: [number, number[], number][] = [[5, [9, 7], 3], [6, [6, 10], 11], [5, [11, 5], 6]];
const WALL_FILLS = [P.wallStone, P.rock, P.rock, P.wallStone, P.wallStone, P.rock];

/** Laid stone blocks with rounded corners, lit top-left and shaded bottom-right. */
function masonry(ctx: Ctx, ox: number) {
  rect(ctx, ox, 0, TILE, TILE, P.rockDark);
  let y = 0, n = 0;
  for (const [h, widths, offset] of COURSES) {
    let x = offset;
    for (const w of widths) {
      const fill = WALL_FILLS[n++ % WALL_FILLS.length];
      for (let dy = 0; dy < h - 1; dy++) {
        for (let dx = 0; dx < w - 1; dx++) {
          const corner = (dx === 0 || dx === w - 2) && (dy === 0 || dy === h - 2);
          if (corner) continue;
          const color = dy === 0 || dx === 0 ? shade(fill, 0.18) : dy === h - 2 || dx === w - 2 ? shade(fill, -0.15) : fill;
          px(ctx, ox + wrap(x + dx), y + dy, color);
        }
      }
      x += w;
    }
    y += h;
  }
}

/** Stone retaining wall; the top row also gets a lit coping lip. */
function stoneWall(ctx: Ctx, ox: number, coping: boolean, end?: "west" | "east") {
  masonry(ctx, ox);
  if (coping) {
    rect(ctx, ox, 0, TILE, 1, P.wallStoneLight);
    rect(ctx, ox, 1, TILE, 3, P.wallStone);
    for (const x of [5, 13]) rect(ctx, ox + x, 1, 1, 3, P.wallStoneDark);
    rect(ctx, ox, 1, TILE, 1, shade(P.wallStone, 0.25));
    rect(ctx, ox, 4, TILE, 1, P.wallStoneDark);
    rect(ctx, ox, 5, TILE, 1, P.rockDark);
  } else {
    rect(ctx, ox, 15, TILE, 1, P.rockDark);
  }
  // A squared pillar finishes the wall beside stairs and decks.
  if (end) {
    const x = end === "west" ? 0 : 11;
    rect(ctx, ox + x, 0, 5, TILE, P.wallStone);
    rect(ctx, ox + x, 0, 5, 1, P.wallStoneLight);
    rect(ctx, ox + x, 0, 1, TILE, end === "west" ? P.wallStoneDark : P.wallStoneLight);
    rect(ctx, ox + x + 4, 0, 1, TILE, end === "west" ? P.wallStoneLight : P.wallStoneDark);
    rect(ctx, ox + x + 1, coping ? 6 : 7, 3, 1, P.wallStoneDark);
    if (!coping) rect(ctx, ox + x, 15, 5, 1, P.rockDark);
  }
}

/** Four steps per tile: lit tread, shaded riser, staggered joints. */
function steps(ctx: Ctx, ox: number, tread: string, light: string, riser: string, seam: string) {
  for (let y = 0; y < TILE; y += 4) {
    rect(ctx, ox, y, TILE, 1, light);
    rect(ctx, ox, y + 1, TILE, 2, tread);
    rect(ctx, ox, y + 3, TILE, 1, riser);
    const joint = (y * 5 + 3) % 12 + 2;
    rect(ctx, ox + joint, y + 1, 1, 2, seam);
    px(ctx, ox + wrap(joint + 7), y + 2, seam);
  }
}

/** Planks four pixels tall with staggered butt joints and nail heads. */
function planks(ctx: Ctx, ox: number, variant: number) {
  rect(ctx, ox, 0, TILE, TILE, P.wood);
  const r = rng(77 + variant);
  for (let y = 0; y < TILE; y += 4) {
    rect(ctx, ox, y, TILE, 1, P.woodLight);
    rect(ctx, ox, y + 3, TILE, 1, P.woodDark);
    const joint = Math.floor(r() * 12) + 2;
    rect(ctx, ox + joint, y, 1, 3, P.woodDeep);
    px(ctx, ox + joint + 1, y, P.woodLight);
    if (y % 8 === 0) px(ctx, ox + joint + 2, y + 1, P.woodDeep);
    const grain = Math.floor(r() * 10) + 3;
    rect(ctx, ox + wrap(grain + joint), y + 2, 3, 1, shade(P.wood, -0.1));
  }
}

function wall(ctx: Ctx, ox: number, base: string) {
  rect(ctx, ox, 0, TILE, TILE, base);
  for (let x = 0; x < TILE; x += 4) rect(ctx, ox + x, 0, 1, 11, shade(base, -0.12));
  rect(ctx, ox, 11, TILE, 1, shade(base, -0.35));
  rect(ctx, ox, 12, TILE, 4, P.woodDark);
  rect(ctx, ox, 12, TILE, 1, P.woodLight);
}

/** Vertical board-and-batten wall; `trim` adds the skirting board where it meets the floor. */
function shopWall(ctx: Ctx, ox: number, color: string, seam: string, trim: boolean) {
  rect(ctx, ox, 0, TILE, TILE, color);
  for (const x of [0, 8]) {
    rect(ctx, ox + x, 0, 1, TILE, seam);
    rect(ctx, ox + x + 1, 0, 1, TILE, shade(color, 0.16));
    rect(ctx, ox + x + 7, 0, 1, TILE, shade(color, -0.12));
    rect(ctx, ox + x + 4, x === 0 ? 4 : 10, 1, 3, shade(color, -0.14));
  }
  if (trim) {
    rect(ctx, ox, 11, TILE, 1, seam);
    rect(ctx, ox, 12, TILE, 1, P.woodLight);
    rect(ctx, ox, 13, TILE, 2, P.wood);
    rect(ctx, ox, 15, TILE, 1, P.woodDeep);
    for (const x of [3, 11]) px(ctx, ox + x, 13, P.woodDark);
  }
}

/** Warm horizontal floorboards, two per tile, with staggered butt joints and a little grain. */
function shopFloor(ctx: Ctx, ox: number, variant: number) {
  rect(ctx, ox, 0, TILE, TILE, P.wood);
  const r = rng(15 + variant);
  for (const y of [0, 8]) {
    rect(ctx, ox, y, TILE, 1, shade(P.wood, 0.18));
    rect(ctx, ox, y + 7, TILE, 1, P.woodDark);
    const joint = (Math.floor(r() * 12) + 2 + variant * 5 + y) % TILE;
    rect(ctx, ox + joint, y, 1, 7, P.woodDark);
    px(ctx, ox + wrap(joint + 1), y + 1, shade(P.wood, 0.18));
    for (const g of [2, 5]) {
      const start = Math.floor(r() * TILE);
      rect(ctx, ox + start, y + g, Math.min(4, TILE - start), 1, shade(P.wood, -0.08));
    }
  }
}

/** Woven teal doormat; a pair of tiles shares one wave mark across the seam. */
function mat(ctx: Ctx, ox: number, west: boolean, east: boolean) {
  shopFloor(ctx, ox, 1);
  const left = west ? 1 : 0;
  const right = east ? 15 : 16;
  rect(ctx, ox + left, 2, right - left, 12, P.signTealDark);
  rect(ctx, ox + left, 3, right - left, 10, P.signTeal);
  for (let y = 3; y < 13; y += 2) {
    for (let x = left + (y % 4 === 1 ? 0 : 1); x < right; x += 2) px(ctx, ox + x, y, shade(P.signTeal, -0.1));
  }
  if (west) rect(ctx, ox + 1, 2, 1, 12, P.signTealDark);
  if (east) rect(ctx, ox + 14, 2, 1, 12, P.signTealDark);
  ctx.save();
  ctx.beginPath();
  ctx.rect(ox + (west ? 2 : 0), 3, (east ? 14 : 16) - (west ? 2 : 0), 10);
  ctx.clip();
  const markX = west && east ? 0 : west ? 8 : -8;
  drawWaveMark(ctx, ox + markX, -1, P.cream);
  ctx.restore();
}

function railing(ctx: Ctx, ox: number) {
  shopFloor(ctx, ox, 0);
  rect(ctx, ox, 4, TILE, 6, P.woodDeep);
  rect(ctx, ox, 4, TILE, 1, P.woodLight);
  rect(ctx, ox, 5, TILE, 1, P.wood);
  for (const x of [3, 11]) {
    rect(ctx, ox + x, 6, 2, 7, P.woodDark);
    px(ctx, ox + x, 6, P.wood);
  }
  rect(ctx, ox, 12, TILE, 4, P.woodDark);
  rect(ctx, ox, 12, TILE, 1, P.woodLight);
  rect(ctx, ox, 15, TILE, 1, P.woodDeep);
}

export function buildTileset(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(TILE * TILE_NAMES.length, TILE);
  TILE_NAMES.forEach((name, i) => {
    const ox = i * TILE;
    if (name.startsWith("planter")) {
      planter(ctx, ox, i - T.planter0);
      return;
    }
    switch (name) {
      case "empty":
        break;
      case "sand0": case "sand1": case "sand2":
        sand(ctx, ox, 11 + i * 17);
        break;
      case "sandWet": case "sandWetEast": case "sandWetSouthEast":
        wetSand(ctx, ox, name !== "sandWetEast", name !== "sandWet");
        break;
      case "sandWetCorner":
        wetSandCorner(ctx, ox);
        break;
      case "grass0": case "grass1": case "grass2":
        grass(ctx, ox, i - T.grass0 + 1);
        break;
      case "grassEdge":
        grassEdge(ctx, ox);
        break;
      case "street0": case "street1": case "street2":
        cobbles(ctx, ox, i - T.street0);
        break;
      case "plaza0": case "plaza1":
        cobbles(ctx, ox, i - T.plaza0, true);
        break;
      case "retainingWall": case "retainingWallFace":
        stoneWall(ctx, ox, name === "retainingWall");
        break;
      case "retainingWallEndW": case "retainingWallEndE":
        stoneWall(ctx, ox, true, name === "retainingWallEndW" ? "west" : "east");
        break;
      case "retainingWallFaceEndW": case "retainingWallFaceEndE":
        stoneWall(ctx, ox, false, name === "retainingWallFaceEndW" ? "west" : "east");
        break;
      case "stairs":
        steps(ctx, ox, P.wallStone, P.wallStoneLight, P.wallStoneDark, P.rockDark);
        break;
      case "deckStairs":
        steps(ctx, ox, P.wood, P.woodLight, P.woodDark, P.woodDeep);
        break;
      case "deck":
        planks(ctx, ox, 0);
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
      case "wallWood": case "wallWoodTrim":
        shopWall(ctx, ox, P.woodDark, P.woodDeep, name === "wallWoodTrim");
        break;
      case "wallSage": case "wallSageTrim":
        shopWall(ctx, ox, P.wallSage, P.wallSageDark, name === "wallSageTrim");
        break;
      case "railing":
        railing(ctx, ox);
        break;
      case "floorWood":
        shopFloor(ctx, ox, 0);
        break;
      case "mat": case "matW": case "matE": case "matWE":
        mat(ctx, ox, name === "matW" || name === "matWE", name === "matE" || name === "matWE");
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
  P: { tiles: ["planter15"], solid: true },
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
