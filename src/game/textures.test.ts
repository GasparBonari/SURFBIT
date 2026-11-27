import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import manifest from "../../public/assets/world/sprites.json";
import { CHAR_H, CHAR_W } from "./art/characters";
import { PROPS, type PropSpec } from "./art/props";
import { TILE, TILE_NAMES } from "./art/tiles";
import { MAPS } from "./maps";
import { buildingTextureKey, npcTextureKey, propTextureKey, type ArtFrame } from "./textures";

function pngSize(name: string) {
  const png = readFileSync(new URL(`../../public/assets/world/${name}.png`, import.meta.url));
  return { w: png.readUInt32BE(16), h: png.readUInt32BE(20) };
}

it("ships a complete atlas for the configured world", async () => {
  const frames: Record<string, ArtFrame> = manifest.frames;
  const { w, h } = pngSize("sprites");
  expect(pngSize("tiles")).toEqual({ w: TILE_NAMES.length * TILE, h: TILE });
  for (const [key, { frame }] of Object.entries(frames)) {
    expect(frame.x + frame.w, key).toBeLessThanOrEqual(w);
    expect(frame.y + frame.h, key).toBeLessThanOrEqual(h);
  }

  const character = {
    frame: { w: 3 * CHAR_W, h: 4 * CHAR_H },
    sheet: { width: CHAR_W, height: CHAR_H },
  };
  expect(frames.player).toMatchObject(character);
  for (const { key: map, objects } of await Promise.all(Object.values(MAPS).map((load) => load()))) {
    for (const object of objects) {
      if (object.type === "building") {
        const key = buildingTextureKey(map, object.id);
        expect(frames[key], key).toMatchObject({ frame: { w: object.w * TILE, h: object.h * TILE } });
      } else if (object.type === "npc") {
        const key = npcTextureKey(map, object.id);
        expect(frames[key], key).toMatchObject(character);
      } else {
        const key = propTextureKey(object.prop, object.tint);
        const { w, h, frames: count = 1 }: PropSpec = PROPS[object.prop];
        expect(frames[key], key).toMatchObject({ frame: { w: w * count, h }, sheet: { width: w, height: h } });
      }
    }
  }
});
