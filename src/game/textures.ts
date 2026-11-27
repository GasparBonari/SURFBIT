import type Phaser from "phaser";
import { makeCanvas } from "./art/canvas";
import type { PROPS, Tint } from "./art/props";
import type { MapKey } from "./maps/types";

export const TILESET_KEY = "tiles";
const ATLAS_KEY = "world-art";

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

export function preloadTextures({ load }: Phaser.Scene) {
  load.image(TILESET_KEY, "/assets/world/tiles.png");
  load.atlas(ATLAS_KEY, "/assets/world/sprites.png", "/assets/world/sprites.json");
}

export function registerTextures({ textures }: Phaser.Scene) {
  if (!textures.exists(TILESET_KEY) || !textures.exists(ATLAS_KEY)) {
    throw new Error("Could not load the world art");
  }

  const atlas = textures.get(ATLAS_KEY);
  const source = atlas.getSourceImage();
  if (!(source instanceof HTMLImageElement)) throw new Error("Missing sprite atlas image");

  // Each packed rectangle is a complete sheet. Give it back its original key and numeric frames.
  for (const key of atlas.getFrameNames()) {
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
  textures.remove(ATLAS_KEY);
}

export function requireTexture({ textures }: Phaser.Scene, key: string) {
  if (!textures.exists(key)) throw new Error(`Missing world texture "${key}"`);
  return key;
}
