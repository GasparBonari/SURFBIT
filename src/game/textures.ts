import type Phaser from "phaser";
import { makeCanvas } from "./art/canvas";
import type { PROPS, Tint } from "./art/props";
import type { MapKey } from "./maps/types";

export const TILESET_KEY = "tiles";

export interface ArtFrame {
  frame: { x: number; y: number; w: number; h: number };
  sheet?: { width: number; height: number };
}

export function buildingTextureKey(map: MapKey, id: string) {
  return `building:${map}:${id}`;
}

export function npcTextureKey(map: MapKey, id: string) {
  return `npc:${map}:${id}`;
}

export function propTextureKey(prop: keyof typeof PROPS, tint?: Tint) {
  return tint ? `${prop}:${tint.color}:${tint.accent}` : prop;
}

export function queueMapAtlas({ load }: Phaser.Scene, map: MapKey) {
  const path = `/assets/world/${map}`;
  load.atlas(`atlas:${map}`, `${path}.png`, `${path}.json`);
}

export function registerMapAtlas({ textures }: Phaser.Scene, map: MapKey) {
  const atlasKey = `atlas:${map}`;
  if (!textures.exists(atlasKey)) throw new Error(`Could not load the "${map}" sprite atlas`);

  const atlas = textures.get(atlasKey);
  const source = atlas.getSourceImage();
  if (!(source instanceof HTMLImageElement)) throw new Error("Missing sprite atlas image");

  try {
    // Keep the original texture and numeric frame keys for sprites shared across maps.
    for (const key of atlas.getFrameNames()) {
      if (textures.exists(key)) continue;
      const { cutX, cutY, cutWidth, cutHeight, customData } = atlas.get(key);
      const { sheet } = customData as ArtFrame;
      const [canvas, ctx] = makeCanvas(cutWidth, cutHeight);
      ctx.drawImage(source, cutX, cutY, cutWidth, cutHeight, 0, 0, cutWidth, cutHeight);
      const texture = textures.addCanvas(key, canvas);
      if (!texture) throw new Error(`Could not register texture "${key}"`);

      if (!sheet) continue;
      const { width, height } = sheet;
      const columns = cutWidth / width;
      const rows = cutHeight / height;
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          texture.add(row * columns + column, 0, column * width, row * height, width, height);
        }
      }
    }
  } finally {
    textures.remove(atlasKey);
  }
}

export function loadMapAtlas(scene: Phaser.Scene, map: MapKey, signal: AbortSignal) {
  const { load } = scene;
  queueMapAtlas(scene, map);
  return new Promise<void>((resolve, reject) => {
    function cancel() {
      load.off("complete", finish);
      resolve();
    }

    function finish() {
      signal.removeEventListener("abort", cancel);
      try {
        registerMapAtlas(scene, map);
        resolve();
      } catch (error) {
        reject(error);
      }
    }

    signal.addEventListener("abort", cancel, { once: true });
    load.once("complete", finish);
    load.start();
  });
}

export function requireTexture({ textures }: Phaser.Scene, key: string) {
  if (!textures.exists(key)) throw new Error(`Missing world texture "${key}"`);
  return key;
}
