import { rng } from "../art/canvas";
import { PROPS, type PropSpec } from "../art/props";
import { shoreline } from "../art/shore";
import { LEGEND, planterTile, T, TILE } from "../art/tiles";
import type { MapDef, MapObject } from "./types";

interface Footprint {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function getFootprint(object: MapObject): Footprint {
  if (object.type === "building") return object;
  if (object.type === "npc") return { x: object.x, y: object.y, w: 1, h: 1 };

  const prop: PropSpec = PROPS[object.prop];
  const { w, h } = prop.foot ?? { w: Math.ceil(prop.w / TILE), h: 1 };
  return { x: object.x, y: object.y - h + 1, w, h };
}

function containsTile(footprint: Footprint, x: number, y: number): boolean {
  return Number.isInteger(x) && Number.isInteger(y)
    && x >= footprint.x && x < footprint.x + footprint.w
    && y >= footprint.y && y < footprint.y + footprint.h;
}

const WALLS = new Set(["M", "G"]);
const FLOORS = new Set(["_", "D"]);

export function buildGround(def: MapDef): number[][] {
  // A coast the shore overlay can draw brings its own wet sand, so the sand tiles stay dry.
  const smoothShore = shoreline(def.ground) !== null;
  return def.ground.map((row, y) => Array.from(row, (tile, x) => {
    const below = def.ground[y + 1]?.[x];
    const above = def.ground[y - 1]?.[x];
    const west = row[x - 1];
    const east = row[x + 1];
    if (tile === "." && !smoothShore) {
      const eastWater = east === "~";
      // A diagonal foam corner sits east when that water tile also has land to its north.
      const cornerEast = eastWater && def.ground[y - 1]?.[x + 1] !== undefined && def.ground[y - 1][x + 1] !== "~";
      if (below === "~") return cornerEast ? T.sandWetCorner : eastWater ? T.sandWetSouthEast : T.sandWet;
      if (eastWater) return T.sandWetEast;
    }
    if (tile === '"' && below !== undefined && below !== '"') return T.grassEdge;
    if (tile === "P") {
      const rim = (neighbour: string | undefined) => neighbour !== "P";
      return planterTile(
        (rim(above) ? 1 : 0) | (rim(east) ? 2 : 0) | (rim(below) ? 4 : 0) | (rim(west) ? 8 : 0),
      );
    }
    if (tile === "S") {
      const face = above === "S";
      if (west !== undefined && west !== "S") return face ? T.retainingWallFaceEndW : T.retainingWallEndW;
      if (east !== undefined && east !== "S") return face ? T.retainingWallFaceEndE : T.retainingWallEndE;
      return face ? T.retainingWallFace : T.retainingWall;
    }
    if (WALLS.has(tile) && below !== undefined && FLOORS.has(below)) {
      return tile === "G" ? T.wallSageTrim : T.wallWoodTrim;
    }
    if (tile === "D") {
      const edgeW = west !== "D";
      const edgeE = east !== "D";
      return edgeW && edgeE ? T.matWE : edgeW ? T.matW : edgeE ? T.matE : T.mat;
    }
    if (tile === "s" && above === "d") return T.deckStairs;
    if (tile === "~") {
      const northLand = above !== undefined && above !== "~";
      const westLand = west !== undefined && west !== "~";
      if (northLand && westLand) return T.foamCorner0;
      if (northLand) return T.foam0;
      if (westLand) return T.foamWest0;
      if (above === "~" && west === "~" && def.ground[y - 1][x - 1] !== "~") return T.foamInner0;
    }
    if (tile === "#") return (x + y) % 2 === 0 ? T.plaza0 : T.plaza1;

    const { tiles } = LEGEND[tile];
    if (tiles.length === 1) return T[tiles[0]];

    const seed = Math.imul(x, 73856093) ^ Math.imul(y, 19349663);
    return T[tiles[Math.floor(rng(seed)() * tiles.length)]];
  }));
}

export function buildBlocked(def: MapDef): boolean[][] {
  const blocked = def.ground.map((row) => Array.from(row, (tile) => LEGEND[tile].solid === true));

  for (const object of def.objects) {
    if (object.type === "npc") continue;
    if (object.type !== "building") {
      const prop: PropSpec = PROPS[object.prop];
      if (!prop.solid) continue;
    }

    const footprint = getFootprint(object);
    for (let y = footprint.y; y < footprint.y + footprint.h; y++) {
      for (let x = footprint.x; x < footprint.x + footprint.w; x++) {
        if (object.type === "building" && x === object.door.x && y === object.door.y) continue;
        blocked[y][x] = true;
      }
    }
  }

  return blocked;
}

export function validateMap(def: MapDef): void {
  const map = `Map "${def.key}"`;
  const width = def.ground[0]?.length ?? 0;
  if (width === 0) throw new Error(`${map} must have a nonempty ground grid`);

  for (const [y, row] of def.ground.entries()) {
    if (row.length !== width) throw new Error(`${map} row ${y} must have ${width} tiles`);
    for (const [x, tile] of Array.from(row).entries()) {
      if (!LEGEND[tile]) throw new Error(`${map} has unknown tile ${JSON.stringify(tile)} at (${x}, ${y})`);
    }
  }

  const bounds = { x: 0, y: 0, w: width, h: def.ground.length };
  for (const object of def.objects) {
    const footprint = getFootprint(object);
    const name = object.type === "building" || object.type === "npc" ? object.id : object.prop;
    if (
      footprint.w < 1 || footprint.h < 1
      || !containsTile(bounds, footprint.x, footprint.y)
      || !containsTile(bounds, footprint.x + footprint.w - 1, footprint.y + footprint.h - 1)
    ) {
      throw new Error(`${map} object "${name}" is out of bounds at (${object.x}, ${object.y})`);
    }

    if (object.type === "building" && !containsTile(footprint, object.door.x, object.door.y)) {
      throw new Error(`${map} building "${name}" has a door outside its footprint`);
    }
  }

  const blocked = buildBlocked(def);
  const npcIds = new Set<string>();
  const npcHomes = new Set<string>();
  for (const object of def.objects) {
    if (object.type !== "npc") continue;
    const { id, x, y } = object;
    const home = `${x},${y}`;
    if (npcIds.has(id)) throw new Error(`${map} has duplicate NPC id "${id}"`);
    if (blocked[y][x] || npcHomes.has(home)) throw new Error(`${map} NPC "${id}" is blocked at (${x}, ${y})`);
    npcIds.add(id);
    npcHomes.add(home);
  }

  for (const [name, { x, y }] of Object.entries(def.spawns)) {
    if (!containsTile(bounds, x, y)) throw new Error(`${map} spawn "${name}" is out of bounds at (${x}, ${y})`);
    if (blocked[y][x] || npcHomes.has(`${x},${y}`)) throw new Error(`${map} spawn "${name}" is blocked at (${x}, ${y})`);
  }
}
