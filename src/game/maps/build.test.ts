import { describe, expect, it } from "vitest";
import { PLAYER_LOOK } from "../art/characters";
import { P } from "../art/palette";
import { planterTile, T } from "../art/tiles";
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
  style: { roof: "terracotta", wall: P.woodLight },
};

describe("buildGround", () => {
  it("autotiles the plaza, garden edges, and retaining wall", () => {
    const map = makeMap({ ground: ['""##S', '".d#S', "PssS."] });
    const tiles = buildGround(map);

    expect([T.grass0, T.grass1, T.grass2]).toContain(tiles[0][0]);
    expect(tiles[0].slice(1)).toEqual([T.grassEdge, T.plaza0, T.plaza1, T.retainingWallEndW]);
    expect(tiles[1][0]).toBe(T.grassEdge);
    expect(tiles[1][2]).toBe(T.deck);
    expect(tiles[1][3]).toBe(T.plaza0);
    expect(tiles[1][4]).toBe(T.retainingWallFaceEndW);
    expect(tiles[2].slice(0, 4)).toEqual([planterTile(15), T.stairs, T.deckStairs, T.retainingWallEndW]);
  });

  it("caps retaining walls only where they meet something other than wall", () => {
    const tiles = buildGround(makeMap({ ground: ["SSSsS", "SSSsS"] }));

    expect(tiles[0]).toEqual([T.retainingWall, T.retainingWall, T.retainingWallEndE, T.stairs, T.retainingWallEndW]);
    expect(tiles[1]).toEqual([
      T.retainingWallFace, T.retainingWallFace, T.retainingWallFaceEndE, T.stairs, T.retainingWallFaceEndW,
    ]);
  });

  it("draws planter rims on the sides that face away from the bed", () => {
    const tiles = buildGround(makeMap({ ground: [".....", ".PPP.", ".PPP.", "....."] }));

    expect(tiles[1].slice(1, 4)).toEqual([planterTile(1 | 8), planterTile(1), planterTile(1 | 2)]);
    expect(tiles[2].slice(1, 4)).toEqual([planterTile(4 | 8), planterTile(4), planterTile(2 | 4)]);
  });

  it("adds skirting where interior walls meet the floor and splits doormats into halves", () => {
    const tiles = buildGround(makeMap({ ground: ["MGM", "M_M", "_DD", "D._"] }));

    expect(tiles[0]).toEqual([T.wallWood, T.wallSageTrim, T.wallWood]);
    expect(tiles[1][0]).toBe(T.wallWoodTrim);
    expect(tiles[2].slice(1)).toEqual([T.matW, T.matE]);
    expect(tiles[3][0]).toBe(T.matWE);
  });

  it("uses a diagonal wet-sand corner beside a one-tile shoreline step", () => {
    const tiles = buildGround(makeMap({ ground: ["....", "...~.", "..~~."].map((row) => row.padEnd(5, ".")) }));

    expect(tiles[1][2]).toBe(T.sandWetCorner);
    expect(tiles[1][3]).toBe(T.foamCorner0);
    expect(tiles[2][3]).toBe(T.foamInner0);
  });

  it("joins north and west swash around both sides of a shoreline step", () => {
    // The sand column on the east keeps this off the shore overlay, so the tiles draw the coast.
    const map = makeMap({ ground: ["....~~.", "..~~~~.", "..~~~~.", "~~~~~~."] });
    const tiles = buildGround(map);

    expect(tiles[0].slice(2, 6)).toEqual([T.sandWet, T.sandWetSouthEast, T.foamWest0, T.water0]);
    expect(tiles[1].slice(1, 6)).toEqual([T.sandWetEast, T.foamCorner0, T.foam0, T.foamInner0, T.water0]);
    expect(tiles[2].slice(1, 6)).toEqual([T.sandWetSouthEast, T.foamWest0, T.water0, T.water0, T.water0]);
    expect(tiles[3].slice(0, 6)).toEqual([T.foam0, T.foam0, T.foamInner0, T.water0, T.water0, T.water0]);
  });

  it("leaves sand dry when the shore overlay draws the coast", () => {
    const tiles = buildGround(makeMap({ ground: ["....", "...~", "..~~"] }));

    expect([T.sand0, T.sand1, T.sand2]).toContain(tiles[1][2]);
    expect(tiles[1][3]).toBe(T.foamCorner0);
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
  it("blocks planters, retaining walls and water while keeping stairs and deck walkable", () => {
    expect(buildBlocked(makeMap({ ground: ["PSSsd~"] })))
      .toEqual([[true, true, true, false, false, true]]);
  });

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

it("loads a valid town with walkable routes to each open shop and the beach stairs", async () => {
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
  expect(shops.filter((object) => object.interact?.kind === "read").map((object) => object.id).sort())
    .toEqual(["beach-club", "workshop"]);
  expect(shops.filter((object) => !object.interact).map((object) => object.id).sort())
    .toEqual(["cottage-east", "cottage-west", "goods"]);
  for (const { id, door, interact } of openShops) {
    expect(interact).toEqual({ kind: "enter", target: id, spawn: "door" });
    expect(town.spawns[`from-${id}`]).toEqual({ x: door.x, y: door.y + 1, facing: "down" });
    expect(reachable.has(`${door.x},${door.y + 1}`)).toBe(true);
    expect(reachable.has(`${door.x},${door.y}`)).toBe(true);
  }

  const wall = town.ground[28];
  expect(wall.match(/s+/g)).toEqual(["sss", "sssss", "sss"]);
  expect(wall.replaceAll("s", "")).toMatch(/^S+$/);
  for (const x of [12, 29, 47]) {
    expect(wall[x]).toBe("s");
    expect(reachable.has(`${x},28`)).toBe(true);
    expect(reachable.has(`${x},30`)).toBe(true);
  }

  const club = shops.find((object) => object.id === "beach-club")!;
  for (const row of town.ground.slice(club.y + club.h, club.y + club.h + 4)) {
    expect(row.slice(club.x, club.x + club.w)).toBe("d".repeat(12));
  }
  const shoreline = town.ground.map((row) => row.indexOf("~")).filter((x) => x >= 0);
  expect(shoreline.every((x, index) => index === 0 || x < shoreline[index - 1])).toBe(true);
  expect(shoreline[0]).toBe(59);
  expect(shoreline.at(-1)).toBe(19);
});
