import { describe, expect, it } from "vitest";
import { PLAYER_LOOK } from "../art/characters";
import { P } from "../art/palette";
import { T } from "../art/tiles";
import { buildBlocked, buildGround, validateMap } from "./build";
import { MAPS } from "./index";
import type { MapDef, MapObject } from "./types";

function makeMap(overrides: Partial<MapDef>): MapDef {
  return {
    key: "town",
    name: "Test map",
    kind: "outdoor",
    ambience: "beach",
    ground: ["...", "...", "..."],
    objects: [],
    spawns: {},
    ...overrides,
  };
}

const shop: Extract<MapObject, { type: "building" }> = {
  type: "building", id: "shop", label: "Shop",
  x: 2, y: 0, w: 3, h: 2, door: { x: 3, y: 1 },
  style: { roof: P.coral, wall: P.woodLight },
};

describe("buildGround", () => {
  it("autotiles grass, sand, water, and the plaza from neighbouring terrain", () => {
    const map = makeMap({ ground: ['""#~~', '".#~~', "..###", "~~||~", "~~||~"] });
    const tiles = buildGround(map);

    expect([T.grass0, T.grass1, T.grass2]).toContain(tiles[0][0]);
    expect(tiles[0].slice(1)).toEqual([T.grassEdge, T.plaza0, T.water0, T.water0]);
    expect(tiles[1][0]).toBe(T.grassEdge);
    expect(tiles[1][2]).toBe(T.plaza1);
    expect(tiles[2]).toEqual([T.sandWet, T.sandWet, T.plaza0, T.plaza1, T.plaza0]);
    expect(tiles[3]).toEqual([T.foam0, T.foam0, T.pier, T.pier, T.foam0]);
    expect(tiles[4]).toEqual([T.water0, T.water0, T.pier, T.pier, T.water0]);
  });

  it("chooses stable variants by position", () => {
    const map = makeMap({ ground: ["................", "................"] });
    const tiles = buildGround(map);

    expect(buildGround(map)).toEqual(tiles);
    expect(new Set(tiles.flat()).size).toBeGreaterThan(1);
    expect(tiles.flat().every((tile) => [T.sand0, T.sand1, T.sand2].includes(tile))).toBe(true);
  });
});

describe("buildBlocked", () => {
  it("combines solid terrain, props, displays and buildings while leaving doors open", () => {
    const map = makeMap({
      ground: ["~W.....", ".......", ".......", "......."],
      objects: [
        shop,
        { ...shop, id: "shed", x: 0, y: 0, w: 2, h: 1, door: { x: 0, y: 0 } },
        { type: "prop", prop: "bench", x: 0, y: 2 },
        { type: "prop", prop: "rock", x: 2, y: 3 },
        { type: "prop", prop: "umbrellaCoral", x: 2, y: 2 },
        { type: "prop", prop: "rug", x: 4, y: 3 },
        { type: "display", prop: "boardDisplay", x: 6, y: 0, productId: "sample", tint: { color: P.teal, accent: P.cream } },
        { type: "npc", id: "local", x: 4, y: 3, look: PLAYER_LOOK, behavior: "idle", name: "Local", lines: [] },
      ],
    });

    expect(buildBlocked(map)).toEqual([
      [true, true, true, true, true, false, true],
      [false, false, true, false, true, false, false],
      [true, true, false, false, false, false, false],
      [false, false, true, false, false, false, false],
    ]);
  });
});

describe("validateMap", () => {
  it.each([
    { ground: [], error: "nonempty ground grid" },
    { ground: ["...", ".."], error: "row 1 must have 3 tiles" },
    { ground: [".?."], error: 'unknown tile "?" at (1, 0)' },
  ])("rejects invalid ground $ground", ({ ground, error }) => {
    expect(() => validateMap(makeMap({ ground }))).toThrow(error);
  });

  it("checks the entire footprint of an object against the map bounds", () => {
    const map = makeMap({ objects: [{ type: "prop", prop: "rug", x: 0, y: 0 }] });

    expect(() => validateMap(map)).toThrow('object "rug" is out of bounds');
  });

  it("rejects a door outside its building even if the tile is in the map", () => {
    const map = makeMap({
      ground: [".....", "....."],
      objects: [{ ...shop, door: { x: 1, y: 1 } }],
    });

    expect(() => validateMap(map)).toThrow('building "shop" has a door outside its footprint');
  });

  it("rejects a spawn outside the ground grid", () => {
    const map = makeMap({ spawns: { door: { x: 3, y: 0, facing: "up" } } });

    expect(() => validateMap(map)).toThrow('spawn "door" is out of bounds');
  });

  it("rejects a spawn on a solid prop", () => {
    const map = makeMap({
      objects: [{ type: "prop", prop: "bench", x: 0, y: 1 }],
      spawns: { default: { x: 1, y: 1, facing: "down" } },
    });

    expect(() => validateMap(map)).toThrow('spawn "default" is blocked');
  });
});

it("loads a valid town with a walkable route to each open shop and the pier", async () => {
  const town = await MAPS.town!();
  expect(() => validateMap(town)).not.toThrow();

  const blocked = buildBlocked(town);
  const { x, y } = town.spawns.default;
  expect(town.ground[y][x]).toBe("#");

  const queue = [[x, y]];
  const reachable = new Set<string>();
  for (const [tileX, tileY] of queue) {
    const tile = `${tileX},${tileY}`;
    if (blocked[tileY]?.[tileX] !== false || reachable.has(tile)) continue;
    reachable.add(tile);
    queue.push([tileX + 1, tileY], [tileX - 1, tileY], [tileX, tileY + 1], [tileX, tileY - 1]);
  }

  const shops = town.objects.filter((object) => object.type === "building");
  const openShops = shops.filter((object) => object.interact?.kind === "enter");
  expect(openShops.map((object) => object.id).sort()).toEqual(["boards", "gear", "wear"]);
  expect(shops.filter((object) => !object.interact).map((object) => object.id).sort())
    .toEqual(["beach-club", "goods", "workshop"]);
  for (const { id, door, interact } of openShops) {
    expect(interact).toEqual({ kind: "enter", target: id, spawn: "door" });
    expect(town.spawns[`from-${id}`]).toEqual({ x: door.x, y: door.y + 1, facing: "down" });
    expect(reachable.has(`${door.x},${door.y + 1}`)).toBe(true);
    expect(reachable.has(`${door.x},${door.y}`)).toBe(true);
  }

  const pierY = town.ground.findLastIndex((row) => row.includes("|"));
  const pierX = town.ground[pierY].indexOf("|");
  expect(reachable.has(`${pierX},${pierY}`)).toBe(true);
});
