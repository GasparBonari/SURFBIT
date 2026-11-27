import { describe, expect, it } from "vitest";
import { CATALOG } from "../../commerce/mock/catalog";
import { buildBlocked, getFootprint, validateMap } from "./build";
import { MAPS } from "./index";
import type { MapDef } from "./types";

const shops = ["boards", "wear", "gear", "goods"] as const;

function reachableFromDoor(def: MapDef) {
  const blocked = buildBlocked(def);
  const queue: { x: number; y: number }[] = [def.spawns.door];
  const visited = new Set<string>();

  for (let i = 0; i < queue.length; i++) {
    const { x, y } = queue[i];
    const key = `${x},${y}`;
    if (visited.has(key) || blocked[y]?.[x] !== false) continue;
    visited.add(key);
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      queue.push({ x: x + dx, y: y + dy });
    }
  }

  return (x: number, y: number) => visited.has(`${x},${y}`);
}

describe("shop interiors", () => {
  it.each(shops)("connects %s to the town door and its displays", async (shop) => {
    const [def, town] = await Promise.all([MAPS[shop](), MAPS.town()]);
    expect(() => validateMap(def)).not.toThrow();
    expect(def.spawns.door.facing).toBe("up");

    const storefront = town.objects.find((object) => object.type === "building" && object.id === shop);
    if (storefront?.type !== "building") throw new Error(`Missing storefront for ${shop}`);
    expect(storefront).toMatchObject({ interact: { kind: "enter", target: shop, spawn: "door" } });
    expect(storefront.upcomingStoreName).toBeUndefined();

    const exit = def.objects.find((object) => object.type === "prop" && object.interact?.kind === "exit");
    expect(exit).toMatchObject({ interact: { target: "town", spawn: `from-${shop}` } });
    expect(town.spawns[`from-${shop}`]).toEqual({
      x: storefront.door.x, y: storefront.door.y + 1, facing: "down",
    });

    const reachable = reachableFromDoor(def);
    const { x, y } = def.spawns.door;
    expect(def.ground[y + 1].slice(x, x + 2)).toBe("DD");
    expect(reachable(x, y + 1)).toBe(true);
    expect(reachable(x + 1, y + 1)).toBe(true);

    for (const object of def.objects) {
      if (object.type !== "display") continue;
      const { x, y, w, h } = getFootprint(object);
      const left = x + Math.floor((w - 1) / 2);
      const right = x + Math.floor(w / 2);
      expect(reachable(left, y + h) || reachable(right, y + h), object.productId).toBe(true);
    }
  });

  it("covers the whole catalog with matching display tints", async () => {
    const interiors = await Promise.all(shops.map((shop) => MAPS[shop]()));
    const displays = interiors.flatMap(({ key, objects }) =>
      objects.filter((object) => object.type === "display").map((display) => ({ key, display })),
    );
    expect(new Set(displays.map(({ display }) => display.productId))).toEqual(new Set(CATALOG.map(({ handle }) => handle)));
    for (const { display } of displays) {
      const art = CATALOG.find(({ handle }) => handle === display.productId)?.images[0].art;
      expect(display.tint).toMatchObject({ color: art?.color, accent: art?.accent });
    }
    for (const { handle, store } of CATALOG) {
      expect(displays.some(({ key, display }) => key === store && display.productId === handle), handle).toBe(true);
    }
  });
});
