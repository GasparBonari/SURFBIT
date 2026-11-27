import { DIRS, type Look } from "../src/game/art/characters";
import { P } from "../src/game/art/palette";
import { PROPS, type Tint } from "../src/game/art/props";
import { LEGEND, TILE, TILE_NAMES, type TileName } from "../src/game/art/tiles";
import { validateMap } from "../src/game/maps/build";
import { MAPS } from "../src/game/maps/index";
import { DISPLAY_PROPS, type BuildingStyle, type Interaction, type MapDef, type MapKey, type MapObject, type Spawn } from "../src/game/maps/types";

const terrain = new Map<TileName, string>(
  Object.entries(LEGEND).flatMap(([code, { tiles }]) => tiles.map((tile) => [tile, code] as const)),
);
const palette = new Map<string, string>(Object.entries(P));
const paletteValues = new Set(palette.values());

function record(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`${field} must be an object`);
  return value as Record<string, unknown>;
}

function list(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
  return value;
}

function string(value: unknown, field: string, allowEmpty = false): string {
  if (typeof value !== "string" || (!allowEmpty && !value.trim())) throw new Error(`${field} must be a string${allowEmpty ? "" : " with a value"}`);
  return value;
}

function integer(value: unknown, field: string, min = 0): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min) {
    throw new Error(`${field} must be an integer ≥ ${min}`);
  }
  return value;
}

function oneOf<T extends string>(value: unknown, field: string, choices: readonly T[]): T {
  const match = choices.find((choice) => choice === value);
  if (match === undefined) throw new Error(`${field} must be one of ${choices.join(", ")}`);
  return match;
}

function optional<T>(value: unknown, field: string, read: (value: unknown, field: string) => T): T | undefined {
  return value === undefined ? undefined : read(value, field);
}

function color(value: unknown, field: string): string {
  const name = string(value, field);
  const entry = palette.get(name);
  if (entry !== undefined) return entry;
  if (paletteValues.has(name)) return name;
  throw new Error(`${field} must use a SURFBIT palette color`);
}

function properties(value: unknown): Map<string, unknown> {
  const values = new Map<string, unknown>();
  for (const entry of list(value ?? [], "properties")) {
    const property = record(entry, "property");
    const name = string(property.name, "property name");
    if (values.has(name)) throw new Error(`duplicate property "${name}"`);
    values.set(name, property.value);
  }
  return values;
}

function grid(value: unknown, field: string): number {
  const pixels = integer(value, field);
  if (pixels % TILE !== 0) throw new Error(`${field} must align to the ${TILE} px grid`);
  return pixels / TILE;
}

function mapKey(value: unknown, field: string): MapKey {
  return oneOf(value, field, Object.keys(MAPS) as MapKey[]);
}

function lines(value: unknown, field: string): string[] {
  return list(value, field).map((line, index) => string(line, `${field}[${index}]`, true));
}

function interaction(value: unknown): Interaction {
  const data = record(value, "interact");
  switch (data.kind) {
    case "enter":
    case "exit":
      return { kind: data.kind, target: mapKey(data.target, "interact.target"), spawn: string(data.spawn, "interact.spawn") };
    case "product":
      return { kind: data.kind, productId: string(data.productId, "interact.productId") };
    case "read":
      return { kind: data.kind, title: string(data.title, "interact.title"), text: lines(data.text, "interact.text") };
    case "talk":
      return { kind: data.kind, name: string(data.name, "interact.name"), lines: lines(data.lines, "interact.lines") };
    default:
      throw new Error("interact.kind must be enter, exit, product, read or talk");
  }
}

function tint(value: unknown, field: string): Tint {
  const data = record(value, field);
  return { color: color(data.color, `${field}.color`), accent: color(data.accent, `${field}.accent`) };
}

function style(value: unknown): BuildingStyle {
  const data = record(value, "style");
  return {
    roof: oneOf(data.roof, "style.roof", ["thatch", "terracotta", "indigo", "slate"]),
    wall: color(data.wall, "style.wall"),
    front: optional(data.front, "style.front", (front, field) => oneOf(front, field, [
      "surfboards", "flagship", "gear", "shaping", "apparel", "cafe", "cottage",
    ])),
    shutters: optional(data.shutters, "style.shutters", color),
    awnings: optional(data.awnings, "style.awnings", (value, field) => {
      const awnings = record(value, field);
      return { window: color(awnings.window, `${field}.window`), door: color(awnings.door, `${field}.door`) };
    }),
  };
}

function look(value: unknown): Look {
  const data = record(value, "look");
  const bool = (value: unknown, field: string) => {
    if (typeof value !== "boolean") throw new Error(`${field} must be a boolean`);
    return value;
  };
  return {
    skin: color(data.skin, "look.skin"),
    hair: color(data.hair, "look.hair"),
    hairStyle: oneOf(data.hairStyle, "look.hairStyle", ["short", "long", "bun", "bald", "curly", "ponytail"]),
    shirt: color(data.shirt, "look.shirt"),
    shorts: color(data.shorts, "look.shorts"),
    accent: optional(data.accent, "look.accent", color),
    backpack: optional(data.backpack, "look.backpack", color),
    beard: optional(data.beard, "look.beard", bool),
    shirtMark: optional(data.shirtMark, "look.shirtMark", color),
    shoes: optional(data.shoes, "look.shoes", color),
    wetsuit: optional(data.wetsuit, "look.wetsuit", bool),
    board: optional(data.board, "look.board", color),
    apron: optional(data.apron, "look.apron", color),
    hat: optional(data.hat, "look.hat", (value, field) => {
      const hat = record(value, field);
      return {
        style: oneOf(hat.style, `${field}.style`, ["cap", "backwardCap", "straw", "bucket"]),
        color: color(hat.color, `${field}.color`),
        brim: color(hat.brim, `${field}.brim`),
        panel: optional(hat.panel, `${field}.panel`, color),
        mark: optional(hat.mark, `${field}.mark`, color),
      };
    }),
  };
}

function readObject(value: unknown): MapObject | { type: "spawn"; name: string; spawn: Spawn } {
  const object = record(value, "object");
  try {
    const type = oneOf(object.class ?? object.type, "class", ["building", "prop", "display", "npc", "spawn"]);
    const name = string(object.name, "name");
    const isPoint = object.point === true;
    if ((object.rotation ?? 0) !== 0 || isPoint !== (type !== "building")
      || object.gid !== undefined || object.template !== undefined || object.text !== undefined
      || object.ellipse || object.capsule || object.polygon || object.polyline) {
      throw new Error(`use an unrotated ${type === "building" ? "rectangle" : "point"}`);
    }
    const x = grid(object.x, "x");
    const y = grid(object.y, "y");
    const raw = properties(object.properties).get("data");
    const data = record(typeof raw === "string" ? JSON.parse(raw) as unknown : raw ?? {}, "data property");

    switch (type) {
      case "spawn":
        return { type, name, spawn: { x, y, facing: oneOf(data.facing, "facing", DIRS) } };
      case "building": {
        const door = record(data.door, "door");
        return {
          type, id: name, x, y, w: grid(object.width, "width"), h: grid(object.height, "height"),
          door: { x: integer(door.x, "door.x"), y: integer(door.y, "door.y") },
          style: style(data.style), label: string(data.label, "label", true),
          upcomingStoreName: optional(data.upcomingStoreName, "upcomingStoreName", string),
          interact: optional(data.interact, "interact", interaction),
        };
      }
      case "prop":
        if (!Object.hasOwn(PROPS, name)) throw new Error(`unknown prop "${name}"`);
        return {
          type, prop: name as keyof typeof PROPS, x, y,
          tint: optional(data.tint, "tint", tint), interact: optional(data.interact, "interact", interaction),
        };
      case "display":
        return { type, prop: oneOf(name, "display prop", DISPLAY_PROPS), x, y, productId: string(data.productId, "productId"), tint: tint(data.tint, "tint") };
      case "npc":
        return {
          type, id: name, x, y, look: look(data.look), behavior: oneOf(data.behavior, "behavior", ["idle", "wander"]),
          name: string(data.name, "NPC name"), lines: lines(data.lines, "lines"),
        };
    }
  } catch (error) {
    const label = typeof object.name === "string" && object.name ? `"${object.name}"` : String(object.id);
    throw new Error(`Object ${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function readGround(layer: Record<string, unknown>, width: number, height: number, firstGid: number): string[] {
  const cells = list(layer.data, "ground data (choose CSV tile layer format in Tiled)");
  if (layer.width !== width || layer.height !== height || cells.length !== width * height) {
    throw new Error("The ground layer must match the map dimensions");
  }
  return Array.from({ length: height }, (_, y) => cells.slice(y * width, (y + 1) * width).map((cell, x) => {
    const gid = integer(cell, `Ground tile at (${x}, ${y})`);
    if (gid === 0) return "X";
    // Tiled stores transforms in the top four bits, which ASCII terrain cannot represent.
    if (gid > 0x0fffffff) throw new Error(`Ground tile at (${x}, ${y}) must be unflipped and unrotated`);
    const tile = TILE_NAMES[gid - firstGid];
    const code = terrain.get(tile);
    if (code === undefined) throw new Error(`Unsupported ground tile ${tile ?? gid} at (${x}, ${y})`);
    return code;
  }).join(""));
}

export function tiledToMapDef(input: unknown): MapDef {
  const map = record(input, "map");
  if (map.orientation !== "orthogonal" || map.infinite || map.tilewidth !== TILE || map.tileheight !== TILE) {
    throw new Error(`Use a finite orthogonal map with ${TILE} × ${TILE} px tiles`);
  }
  const width = integer(map.width, "map width", 1);
  const height = integer(map.height, "map height", 1);
  const tilesets = list(map.tilesets, "tilesets");
  if (tilesets.length !== 1) throw new Error("Use the SURFBIT tiles.png as the only tileset");
  const tileset = record(tilesets[0], "tileset");
  if (tileset.source === undefined && (tileset.tilecount !== TILE_NAMES.length || tileset.columns !== TILE_NAMES.length
    || tileset.tilewidth !== TILE || tileset.tileheight !== TILE)) {
    throw new Error("Use the SURFBIT tiles.png tileset with its original layout");
  }
  const firstGid = integer(tileset.firstgid, "tileset firstgid", 1);
  const mapProps = properties(map.properties);
  let ground: string[] | undefined;
  const objects: MapObject[] = [];
  const spawns = new Map<string, Spawn>();

  for (const value of list(map.layers, "layers")) {
    const layer = record(value, "layer");
    if ([layer.x, layer.y, layer.offsetx, layer.offsety].some((offset) => (offset ?? 0) !== 0)) {
      throw new Error(`Layer "${String(layer.name)}" must have zero offset`);
    }
    if (layer.type === "tilelayer" && layer.name === "ground" && ground === undefined) {
      ground = readGround(layer, width, height, firstGid);
    } else if (layer.type === "objectgroup") {
      for (const value of list(layer.objects, "layer objects")) {
        const object = readObject(value);
        if (object.type === "spawn") {
          if (object.name === "__proto__" || spawns.has(object.name)) throw new Error(`Invalid or duplicate spawn "${object.name}"`);
          spawns.set(object.name, object.spawn);
        } else {
          objects.push(object);
        }
      }
    } else {
      throw new Error(`Unexpected layer "${String(layer.name)}". Use one tile layer named "ground" and object layers`);
    }
  }

  if (!ground) throw new Error('A tile layer named "ground" is required');
  if (spawns.size === 0) throw new Error("At least one spawn is required");
  const def: MapDef = {
    key: mapKey(mapProps.get("key"), "map key"), name: string(mapProps.get("name"), "map name"),
    kind: oneOf(mapProps.get("kind"), "map kind", ["outdoor", "interior"]),
    ambience: oneOf(mapProps.get("ambience"), "map ambience", ["beach", "shop"]),
    ground, objects, spawns: Object.fromEntries(spawns),
  };
  validateMap(def);
  return def;
}
