import type Phaser from "phaser";
import { PROPS, type PropSpec } from "../art/props";
import { TILE } from "../art/tiles";
import { getFootprint } from "../maps/build";
import type { MapDef } from "../maps/types";
import { buildingTextureKey, propTextureKey, requireTexture } from "../textures";

export interface AnimatedProp {
  sprite: Phaser.GameObjects.Sprite;
  frames: number;
  frameMs: number;
  pingPong?: boolean;
}

export function spawnObjects(scene: Phaser.Scene, { key: map, objects }: MapDef) {
  const animated: AnimatedProp[] = [];
  for (const object of objects) {
    if (object.type === "npc") continue;

    if (object.type === "building") {
      const { id, x, y, h } = object;
      const key = requireTexture(scene, buildingTextureKey(map, id));
      const bottom = (y + h) * TILE;
      scene.add.image(x * TILE, bottom, key).setOrigin(0, 1).setDepth(bottom);
    } else {
      const prop: PropSpec = PROPS[object.prop];
      const { w } = getFootprint(object);
      const x = (object.x + w / 2) * TILE;
      const bottom = (object.y + 1) * TILE;
      const depth = prop.flat ? 1 : prop.wall ? 2 : bottom;
      const key = requireTexture(scene, propTextureKey(object.prop, object.tint));
      const sprite = scene.add.sprite(x, bottom, key, 0).setOrigin(0.5, 1).setDepth(depth);
      if (prop.animation && prop.frames && prop.frames > 1) {
        animated.push({ sprite, frames: prop.frames, ...prop.animation });
      }
    }
  }
  return animated;
}
