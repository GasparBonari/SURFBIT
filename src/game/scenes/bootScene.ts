import type Phaser from "phaser";
import { registerTextures } from "../textures";
import { MAP_SCENE_KEY, type MapSceneData } from "./mapScene";

export function createBootScene(phaser: typeof Phaser, reportError: (error: unknown) => void) {
  return class BootScene extends phaser.Scene {
    constructor() {
      super("BootScene");
    }

    create() {
      try {
        registerTextures(this);
        const data: MapSceneData = { map: "town", spawn: "default" };
        this.scene.start(MAP_SCENE_KEY, data);
      } catch (error) {
        reportError(error);
      }
    }
  };
}
