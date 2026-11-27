import { buildBuilding } from "../src/game/art/buildings";
import { makeCanvas, type Ctx } from "../src/game/art/canvas";
import { autoOutline, buildCharacterSheet, buildShadow, CHAR_H, CHAR_W, PLAYER_LOOK } from "../src/game/art/characters";
import { P } from "../src/game/art/palette";
import { drawMarker, PROPS, type PropSpec, type Tint } from "../src/game/art/props";
import { buildTileset, TILE } from "../src/game/art/tiles";
import { drawFootprint, drawGull } from "../src/game/art/townProps";
import { MAPS } from "../src/game/maps/index";
import { buildingTextureKey, npcTextureKey, propTextureKey, type ArtFrame } from "../src/game/textures";

type Sprite = { canvas: HTMLCanvasElement; sheet?: ArtFrame["sheet"] };
const characterSheet = { width: CHAR_W, height: CHAR_H };

function drawStrip(
  { w, h, frames = 1 }: Pick<PropSpec, "w" | "h" | "frames">,
  draw: (ctx: Ctx, x: number, frame: number) => void,
): Sprite {
  const [canvas, ctx] = makeCanvas(w * frames, h);
  for (let frame = 0; frame < frames; frame++) draw(ctx, frame * w, frame);
  return { canvas, sheet: { width: w, height: h } };
}

function drawProp(prop: PropSpec, tint: Tint) {
  return drawStrip(prop, (ctx, x, frame) => {
    prop.draw(ctx, x, frame, tint);
    if (prop.outline ?? !prop.flat) autoOutline(ctx, x, 0, prop.w, prop.h, P.outline);
  });
}

async function drawSprites() {
  const sprites = new Map<string, Sprite>([
    ["player", { canvas: buildCharacterSheet(PLAYER_LOOK), sheet: characterSheet }],
    ["shadow", { canvas: buildShadow() }],
    ["gull", drawStrip({ w: 13, h: 8, frames: 2 }, drawGull)],
    ["footprint", drawStrip({ w: 5, h: 4 }, drawFootprint)],
    ["marker", drawStrip({ w: 7, h: 7 }, drawMarker)],
  ]);
  const defaultTint = { color: P.teal, accent: P.cream };
  for (const [key, prop] of Object.entries(PROPS)) sprites.set(key, drawProp(prop, defaultTint));

  for (const { key: map, objects } of await Promise.all(Object.values(MAPS).map((load) => load()))) {
    for (const object of objects) {
      if (object.type === "building") {
        const { id, x, w, h, style, label, door, interact } = object;
        const canvas = buildBuilding(w * TILE, h * TILE, style, label, {
          x: (door.x - x + 0.5) * TILE,
          boarded: Boolean(label) && interact?.kind !== "enter",
        });
        sprites.set(buildingTextureKey(map, id), { canvas });
      } else if (object.type === "npc") {
        const canvas = buildCharacterSheet(object.look);
        sprites.set(npcTextureKey(map, object.id), { canvas, sheet: characterSheet });
      } else if (object.tint) {
        const key = propTextureKey(object.prop, object.tint);
        if (!sprites.has(key)) sprites.set(key, drawProp(PROPS[object.prop], object.tint));
      }
    }
  }
  return sprites;
}

function packSprites(sprites: Map<string, Sprite>) {
  const width = 1024;
  const entries = [...sprites].sort(([, a], [, b]) => b.canvas.height - a.canvas.height);
  const frames: Record<string, ArtFrame> = {};
  let x = 0;
  let y = 0;
  let rowHeight = 0;

  // Pack whole sheets in height order so each texture can be restored with one copy.
  for (const [key, { canvas, sheet }] of entries) {
    const { width: w, height: h } = canvas;
    if (w > width) throw new Error(`Sprite "${key}" is wider than the atlas`);
    if (x + w > width) {
      x = 0;
      y += rowHeight;
      rowHeight = 0;
    }
    frames[key] = { frame: { x, y, w, h }, sheet };
    x += w;
    rowHeight = Math.max(rowHeight, h);
  }

  const [atlas, ctx] = makeCanvas(width, y + rowHeight);
  for (const [key, { canvas }] of entries) {
    const { x, y } = frames[key].frame;
    ctx.drawImage(canvas, x, y);
  }
  return { atlas, frames };
}

const png = (canvas: HTMLCanvasElement) => canvas.toDataURL().split(",")[1];
const result = await drawSprites().then((sprites) => {
  const { atlas, frames } = packSprites(sprites);
  return { tiles: png(buildTileset()), sprites: png(atlas), frames };
}).catch((error: unknown) => ({ error: String(error) }));
await fetch("/result", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(result),
});
