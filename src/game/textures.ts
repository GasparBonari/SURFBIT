import type Phaser from "phaser";
import { makeCanvas, type Ctx } from "./art/canvas";
import { autoOutline, buildCharacterSheet, buildShadow, CHAR_H, CHAR_W, PLAYER_LOOK, type Look } from "./art/characters";
import { P } from "./art/palette";
import { drawMarker, PROPS, type PropSpec, type Tint } from "./art/props";
import { buildTileset } from "./art/tiles";
import { drawFootprint, drawGull } from "./art/townProps";

export const TILESET_KEY = "tiles";

type TextureManager = Phaser.Textures.TextureManager;
type FrameSize = Pick<PropSpec, "w" | "h" | "frames">;

function addSheet(textures: TextureManager, key: string, canvas: HTMLCanvasElement, w: number, h: number) {
  const texture = textures.addCanvas(key, canvas);
  if (!texture) throw new Error(`Could not register texture "${key}"`);

  const columns = canvas.width / w;
  const rows = canvas.height / h;
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      texture.add(row * columns + column, 0, column * w, row * h, w, h);
    }
  }
}

function addStrip(
  textures: TextureManager,
  key: string,
  { w, h, frames = 1 }: FrameSize,
  draw: (ctx: Ctx, x: number, frame: number) => void,
) {
  const [canvas, ctx] = makeCanvas(w * frames, h);
  for (let frame = 0; frame < frames; frame++) draw(ctx, frame * w, frame);
  addSheet(textures, key, canvas, w, h);
}

function addProp(textures: TextureManager, key: string, prop: PropSpec, tint: Tint) {
  addStrip(textures, key, prop, (ctx, x, frame) => {
    prop.draw(ctx, x, frame, tint);
    if (prop.outline ?? !prop.flat) autoOutline(ctx, x, 0, prop.w, prop.h, P.outline);
  });
}

export function ensureCharacter({ textures }: Phaser.Scene, key: string, look: Look): string {
  if (!textures.exists(key)) addSheet(textures, key, buildCharacterSheet(look), CHAR_W, CHAR_H);
  return key;
}

export function registerTextures(scene: Phaser.Scene) {
  const { textures } = scene;
  textures.addCanvas(TILESET_KEY, buildTileset());
  ensureCharacter(scene, "player", PLAYER_LOOK);
  textures.addCanvas("shadow", buildShadow());

  const tint = { color: P.teal, accent: P.cream };
  for (const [key, prop] of Object.entries(PROPS)) addProp(textures, key, prop, tint);

  addStrip(textures, "gull", { w: 13, h: 8, frames: 2 }, drawGull);
  addStrip(textures, "footprint", { w: 5, h: 4 }, drawFootprint);
  addStrip(textures, "marker", { w: 7, h: 7 }, drawMarker);
}

export function ensureTinted({ textures }: Phaser.Scene, propKey: keyof typeof PROPS, tint: Tint): string {
  const key = `${propKey}:${tint.color}:${tint.accent}`;
  if (!textures.exists(key)) addProp(textures, key, PROPS[propKey], tint);
  return key;
}
