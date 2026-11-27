import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { CHAR_H, CHAR_W } from "./art/characters";
import { PROPS, type PropSpec } from "./art/props";
import { TILE, TILE_NAMES } from "./art/tiles";
import { MAPS } from "./maps";
import type { MapKey } from "./maps/types";
import { buildingTextureKey, npcTextureKey, propTextureKey, type ArtFrame } from "./textures";

function pngSize(name: string) {
  const png = readFileSync(new URL(`../../public/assets/world/${name}.png`, import.meta.url));
  return { w: png.readUInt32BE(16), h: png.readUInt32BE(20) };
}

function readAtlas(map: MapKey) {
  const manifest = readFileSync(new URL(`../../public/assets/world/${map}.json`, import.meta.url), "utf8");
  const { frames } = JSON.parse(manifest) as { frames: Record<string, ArtFrame> };
  const { w, h } = pngSize(map);
  for (const [key, { frame }] of Object.entries(frames)) {
    expect(frame.x + frame.w, key).toBeLessThanOrEqual(w);
    expect(frame.y + frame.h, key).toBeLessThanOrEqual(h);
  }
  return frames;
}

it("ships all art required by each map at the point of entry", async () => {
  expect(pngSize("tiles")).toEqual({ w: TILE_NAMES.length * TILE, h: TILE });
  const town = readAtlas("town");
  const character = {
    frame: { w: 3 * CHAR_W, h: 4 * CHAR_H },
    sheet: { width: CHAR_W, height: CHAR_H },
  };
  expect(town.player).toMatchObject(character);
  for (const key of ["shadow", "gull", "footprint", "marker"]) {
    expect(town[key], key).toBeDefined();
  }

  for (const { key: map, objects } of await Promise.all(Object.values(MAPS).map((load) => load()))) {
    const atlas = map === "town" ? town : readAtlas(map);
    const frames = map === "town" ? town : { ...town, ...atlas };
    const used = new Set<string>();
    for (const object of objects) {
      if (object.type === "building") {
        const key = buildingTextureKey(map, object.id);
        used.add(key);
        expect(frames[key], key).toMatchObject({ frame: { w: object.w * TILE, h: object.h * TILE } });
      } else if (object.type === "npc") {
        const key = npcTextureKey(map, object.id);
        used.add(key);
        expect(frames[key], key).toMatchObject(character);
      } else {
        const key = propTextureKey(object.prop, object.tint);
        used.add(key);
        const { w, h, frames: count = 1 }: PropSpec = PROPS[object.prop];
        expect(frames[key], key).toMatchObject({ frame: { w: w * count, h }, sheet: { width: w, height: h } });
      }
    }
    const localKeys = map === "town"
      ? [...used, "player", "shadow", "gull", "footprint", "marker"]
      : [...used].filter((key) => !Object.hasOwn(town, key));
    expect(Object.keys(atlas).sort(), map).toEqual(localKeys.sort());
  }
});
