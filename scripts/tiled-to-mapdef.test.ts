import { describe, expect, it } from "vitest";
import { LEGEND, T, TILE, TILE_NAMES } from "../src/game/art/tiles";
import { MAPS } from "../src/game/maps/index";
import type { MapDef } from "../src/game/maps/types";
import { tiledToMapDef } from "./tiled-to-mapdef";

const property = (name: string, value: string) => ({ name, type: "string", value });

function tiledMap(def: MapDef) {
  const { key, name, kind, ambience } = def;
  const width = def.ground[0].length;
  const height = def.ground.length;
  const ground = {
    name: "ground", type: "tilelayer", width, height,
    data: def.ground.flatMap((row) => Array.from(row, (code) => T[LEGEND[code].tiles[0]] + 1)),
  };
  const objects = def.objects.map(({ x, y, ...object }) => {
    const coordinates = { x: x * TILE, y: y * TILE };
    switch (object.type) {
      case "building": {
        const { type, id, w, h, ...data } = object;
        return { type, name: id, ...coordinates, width: w * TILE, height: h * TILE, properties: [property("data", JSON.stringify(data))] };
      }
      case "prop":
      case "display": {
        const { type, prop, ...data } = object;
        return { type, name: prop, ...coordinates, point: true, properties: [property("data", JSON.stringify(data))] };
      }
      case "npc": {
        const { type, id, ...data } = object;
        return { type, name: id, ...coordinates, point: true, properties: [property("data", JSON.stringify(data))] };
      }
    }
  });
  const spawns = Object.entries(def.spawns).map(([name, { x, y, facing }]) => ({
    type: "spawn", name, x: x * TILE, y: y * TILE, point: true,
    properties: [property("data", JSON.stringify({ facing }))],
  }));
  return {
    type: "map", orientation: "orthogonal", infinite: false, width, height, tilewidth: TILE, tileheight: TILE,
    tilesets: [{ firstgid: 1, columns: TILE_NAMES.length, tilecount: TILE_NAMES.length, tilewidth: TILE, tileheight: TILE }],
    properties: Object.entries({ key, name, kind, ambience }).map(([name, value]) => property(name, value)),
    layers: [ground, { type: "objectgroup", objects }, { type: "objectgroup", objects: spawns }] as const,
  };
}

describe("Tiled map importer", () => {
  it.each(Object.entries(MAPS))("round-trips the %s map definition", async (_key, load) => {
    const def = await load();
    expect(tiledToMapDef(tiledMap(def))).toEqual(def);
  });

  it("imports empty cells as void and accepts an external tileset reference", async () => {
    const input = tiledMap(await MAPS.boards());
    input.layers[0].data[0] = 0;
    const def = tiledToMapDef({ ...input, tilesets: [{ firstgid: 1, source: "terrain.tsx" }] });
    expect(def.ground[0]).toBe("X" + "M".repeat(input.width - 1));
  });

  it("resolves palette keys in object data", async () => {
    const input = tiledMap(await MAPS.boards());
    const [object] = input.layers[1].objects;
    object.properties[0].value = JSON.stringify({ tint: { color: "navy", accent: "cream" } });
    const def = tiledToMapDef(input);
    expect(def.objects[0]).toMatchObject({ tint: { color: expect.stringMatching(/^#/), accent: expect.stringMatching(/^#/) } });
  });

  it("reports transformed ground cells with their coordinates", async () => {
    const input = tiledMap(await MAPS.town());
    input.layers[0].data[1] += 0x80000000;
    expect(() => tiledToMapDef(input)).toThrow("Ground tile at (1, 0) must be unflipped and unrotated");
  });

  it("rejects an object placed off the 16 px grid", async () => {
    const input = tiledMap(await MAPS.boards());
    input.layers[1].objects[0].x += 1;
    expect(() => tiledToMapDef(input)).toThrow('Object "boardsSign": x must align to the 16 px grid');
  });

  it("rejects spawns on solid terrain using the game validator", async () => {
    const input = tiledMap(await MAPS.boards());
    Object.assign(input.layers[2].objects[0], { x: 0, y: 0 });
    expect(() => tiledToMapDef(input)).toThrow('spawn "door" is blocked at (0, 0)');
  });
});
