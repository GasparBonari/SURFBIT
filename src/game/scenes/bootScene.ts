import type Phaser from "phaser";
import { queueMapAtlas, registerMapAtlas, requireTexture, TILESET_KEY } from "../textures";
import { MAP_SCENE_KEY, type MapSceneData } from "./mapScene";

export function createBootScene(phaser: typeof Phaser, reportError: (error: unknown) => void) {
  return class BootScene extends phaser.Scene {
    constructor() {
      super("BootScene");
    }

    preload() {
      this.load.image(TILESET_KEY, "/assets/world/tiles.png");
      queueMapAtlas(this, "town");
    }

    create() {
      try {
        requireTexture(this, TILESET_KEY);
        registerMapAtlas(this, "town");
        const data: MapSceneData = { map: "town", spawn: "default" };
        this.scene.start(MAP_SCENE_KEY, data);
      } catch (error) {
        reportError(error);
      }
    }
  };
}
